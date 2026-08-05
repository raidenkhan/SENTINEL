import time
import logging
from typing import List, Optional
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------
# Define Structured Output Schema (Pydantic Models)
# ---------------------------------------------------------

class CourseMetadata(BaseModel):
    code: str = Field(description="The course code, e.g., EE357")
    level: int = Field(description="The course level (100-400)")
    detected_topics: List[str] = Field(description="List of main topics detected in the paper")

class Question(BaseModel):
    question_id: str = Field(description="Identifier like Q1a, Q2b")
    raw_text: str = Field(description="The full word-for-word text of the question as it appears in the exam")
    topic: str = Field(description="Main topic matching syllabus concepts")
    sub_topic: str = Field(description="Specific concept tested")
    weight: float = Field(description="0.3 for Remember/Understand, 0.6 for Apply/Analyze, 1.0 for Evaluate/Create")
    blooms_level: str = Field(description="Remember, Understand, Apply, Analyze, Evaluate, Create")
    is_calculation_heavy: bool = Field(description="True if quantitative calculation is required")
    keywords: List[str] = Field(description="Up to 5 technical keywords")
    diagram_id: Optional[str] = Field(description="The ID of the diagram (e.g., p1_img0) that this question refers to or depends on, if any.")

class ExamAnalysisResult(BaseModel):
    course_metadata: CourseMetadata
    questions: List[Question]
    summary: str = Field(description="2-sentence pedagogical trend observation")

# ---------------------------------------------------------
# Prompt Definition
# ---------------------------------------------------------

SYSTEM_TEMPLATE = """
Role: You are an Expert Engineering Professor and Lead Curriculum Auditor with 20 years of experience in {department} Engineering.

Task: Analyze the provided text from an engineering exam paper for {course_code} - {course_name}.

Constraints:
1. Categorization: Map questions to specific engineering concepts within this discipline
2. Granularity: Identify both the "Core Concept" and "Sub-Topic"
3. Bloom's Taxonomy: Classify cognitive level (Remember, Understand, Apply, Analyze, Evaluate, Create)
4. Calculation Detection: Determine if the question requires numerical problem-solving
5. No Hallucination: Only extract information explicitly present in the text

Context - Course Syllabus Topics:
{syllabus_topics}

Input Text:
{exam_text}

Critical Rules:
- **Raw Text**: Capture the complete, verbatim text for each question. Include sub-parts if they belong to the same question ID.
- **Diagram Association**: If the input text includes "Available Visual Assets", carefully associate the correct Diagram ID with questions that refer to "the figure", "the diagram", "the circuit", etc.
- If topic is ambiguous, choose the most specific match from the syllabus
- Weight calculation: 0.3 for Remember/Understand, 0.6 for Apply/Analyze, 1.0 for Evaluate/Create
"""

prompt = PromptTemplate(
    template=SYSTEM_TEMPLATE,
    input_variables=["department", "course_code", "course_name", "syllabus_topics", "exam_text"],
)

# ---------------------------------------------------------
# LLM Initialization
# ---------------------------------------------------------

# Using llama-3.3-70b-versatile for high performance instruction following
llm = ChatGroq(
    temperature=0.1,  # Low temperature for analytical consistency
    model_name="llama-3.3-70b-versatile",
    groq_api_key=settings.GROQ_API_KEY
)

# Bind the LLM to strictly output JSON matching our Pydantic schema
structured_llm = llm.with_structured_output(ExamAnalysisResult)

chain = prompt | structured_llm

# ---------------------------------------------------------
# Free-Tier Budget Management
# ---------------------------------------------------------
# Groq's free tier caps llama-3.3-70b-versatile at 12,000 tokens/minute.
# A single long paper can exceed that in one request (HTTP 413 "Payload Too
# Large"), which is exactly what was killing uploads. We solve it by:
#   1. Chunking the exam text into ~2k-token pieces (small enough per request)
#   2. Pacing calls against a rolling 60s token budget so a burst of chunks
#      never trips the per-minute cap
#   3. Retrying with backoff if a rate-limit error slips through anyway

CHUNK_SIZE = 8000    # characters per chunk (~2k tokens)
CHUNK_OVERLAP = 600  # overlap so questions spanning a chunk boundary aren't lost
TPM_LIMIT = 12000    # Groq free-tier tokens-per-minute for llama-3.3-70b-versatile
MAX_RETRIES = 3
TOKENS_PER_CHAR = 0.25  # rough estimate: ~4 chars per token


class _TokenBudget:
    """Paces LLM calls so a rolling 60-second window never exceeds the TPM cap."""

    def __init__(self, limit: int = TPM_LIMIT):
        self.limit = limit
        self.used = 0
        self.window_start = time.monotonic()

    def acquire(self, est_tokens: int) -> None:
        while True:
            now = time.monotonic()
            elapsed = now - self.window_start
            if elapsed >= 60:
                self.window_start = now
                self.used = 0
            if self.used + est_tokens <= self.limit:
                self.used += est_tokens
                return
            wait = max(1.0, 60 - elapsed + 1)
            logger.warning(
                f"Groq TPM budget nearly exhausted ({self.used}/{self.limit}), "
                f"pausing {wait:.0f}s for the window to roll over..."
            )
            time.sleep(wait)


_budget = _TokenBudget()


def _chunk_text(text: str) -> List[str]:
    """Split long exam text into overlapping chunks sized for the free-tier budget."""
    if len(text) <= CHUNK_SIZE:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + CHUNK_SIZE, len(text))
        chunks.append(text[start:end])
        if end >= len(text):
            break
        start = end - CHUNK_OVERLAP
    return chunks


def _invoke_with_retry(inputs: dict) -> Optional[ExamAnalysisResult]:
    """Invoke the analysis chain, pacing + retrying on rate-limit errors."""
    est_tokens = int(len(inputs["exam_text"]) * TOKENS_PER_CHAR) + 1200  # + prompt overhead
    _budget.acquire(est_tokens)

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            return chain.invoke(inputs)
        except Exception as e:
            msg = str(e).lower()
            is_rate_limit = any(
                marker in msg
                for marker in ("413", "429", "rate_limit", "payload too large",
                               "tokens per minute", "tpm", "too many requests")
            )
            if not is_rate_limit or attempt == MAX_RETRIES:
                logger.error(f"LLM call failed after {attempt} attempt(s): {e}")
                return None
            wait = 15 * attempt  # 15s, 30s, 45s — lets the TPM window roll over
            logger.warning(f"Groq rate limited ({e}); backing off {wait}s and retrying...")
            time.sleep(wait)
    return None


def process_exam_text(
    exam_text: str,
    course_code: str,
    course_name: str,
    department: str,
    syllabus_topics: str
) -> Optional[ExamAnalysisResult]:
    """
    Sends extracted exam text to Groq LLM to parse into structured JSON.

    Long papers are chunked into multiple smaller calls (each well under the
    free-tier TPM limit), paced to respect the per-minute token budget, and
    the per-chunk results are merged into a single ExamAnalysisResult.
    """
    try:
        print(f"Sending {len(exam_text)} characters to Groq LLM for analysis...")
        chunks = _chunk_text(exam_text)
        if len(chunks) > 1:
            print(f"Split into {len(chunks)} chunk(s) to stay under Groq's free-tier TPM limit.")

        questions: List[Question] = []
        seen_raw: set = set()
        course_meta: Optional[CourseMetadata] = None
        detected_topics: set = set()
        summaries: List[str] = []

        for i, chunk in enumerate(chunks, 1):
            if len(chunks) > 1:
                print(f"  Analyzing chunk {i}/{len(chunks)} ({len(chunk)} chars)...")
            result = _invoke_with_retry({
                "exam_text": chunk,
                "course_code": course_code,
                "course_name": course_name,
                "department": department,
                "syllabus_topics": syllabus_topics
            })
            if result is None:
                continue  # salvage whatever other chunks produce

            if result.questions:
                for q in result.questions:
                    key = q.raw_text.strip()[:200]
                    if key in seen_raw:
                        continue  # dedupe questions caught in chunk overlaps
                    seen_raw.add(key)
                    questions.append(q)

            if result.course_metadata:
                detected_topics.update(result.course_metadata.detected_topics)
                if course_meta is None:
                    course_meta = result.course_metadata

            if result.summary:
                summaries.append(result.summary)

        if not questions:
            print("LLM analysis returned no questions (all chunks failed or were empty).")
            return None

        # Merge: first chunk's course identity, but union of all detected topics
        if course_meta is None:
            course_meta = CourseMetadata(
                code=course_code, level=0, detected_topics=list(detected_topics)[:20]
            )
        else:
            course_meta = CourseMetadata(
                code=course_meta.code,
                level=course_meta.level,
                detected_topics=sorted(detected_topics) if detected_topics else course_meta.detected_topics
            )

        summary = " ".join(summaries)
        if len(summary) > 600:
            summary = summary[:600].rsplit(".", 1)[0] + "."
        if not summary.strip():
            summary = f"Analysis of {len(questions)} questions across {len(chunks)} chunk(s)."

        return ExamAnalysisResult(
            course_metadata=course_meta,
            questions=questions,
            summary=summary
        )
    except Exception as e:
        print(f"Error during LLM Analysis: {e}")
        return None
