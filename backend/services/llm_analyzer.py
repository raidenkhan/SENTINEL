import time
import logging
from typing import List, Optional
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
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

class DetectedCourse(BaseModel):
    """Course info identified from the paper's own header/front-matter."""
    code: str = Field(description="The course code, e.g., EE357, MATH101, CS205")
    name: str = Field(description="The full course name, e.g., Computer Architecture")
    department: Optional[str] = Field(default=None, description="Department or faculty, e.g., Computer Engineering")
    level: Optional[int] = Field(default=None, description="Course level (100-400)")
    confidence: str = Field(default="high", description="high, medium, or low")
    reason: Optional[str] = Field(default=None, description="One short sentence justifying the detection")


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
- Respond with ONLY valid JSON matching the required schema.
"""

prompt = PromptTemplate(
    template=SYSTEM_TEMPLATE,
    input_variables=["department", "course_code", "course_name", "syllabus_topics", "exam_text"],
)

# ---------------------------------------------------------
# LLM Initialization
# ---------------------------------------------------------
# DeepSeek is the sole LLM provider (both parsing and chatbot).
# It exposes an OpenAI-compatible API, so we use ChatOpenAI
# pointed at api.deepseek.com with the deepseek-chat model.

DEEPSEEK_API_KEY = settings.DEEP_SEEK_API_KEY
if not DEEPSEEK_API_KEY:
    raise RuntimeError(
        "No LLM API key configured: set DEEP_SEEK_API_KEY in .env or the "
        "HF Space secrets (DEEP_SEEK_API_KEY)."
    )

llm = ChatOpenAI(
    temperature=0.1,  # Low temperature for analytical consistency
    model="deepseek-chat",
    api_key=DEEPSEEK_API_KEY,
    base_url="https://api.deepseek.com",
    max_retries=2,  # client-level retry for transient network errors
)

# Bind the LLM to strictly output JSON matching our Pydantic schema.
# DeepSeek supports OpenAI-style tool/function calling, which LangChain
# uses to enforce the schema (json_mode alone lets the model invent its
# own key names — verified against the live API).
structured_llm = llm.with_structured_output(ExamAnalysisResult, method="function_calling")

chain = prompt | structured_llm

# ---------------------------------------------------------
# Course Detection (auto-categorization)
# ---------------------------------------------------------
# Reads the paper's own header to identify the course, so uploads get
# tagged to the correct course even if the dropdown selection was wrong
# or missing. Returns a DetectedCourse or None on failure.

COURSE_DETECT_PROMPT = PromptTemplate(
    template="""
You are a document classifier for an academic exam-paper archive.

Read the exam header below and identify the COURSE this paper belongs to.
Use only information explicitly present in the text (course code, course name,
department, faculty, university, year of study, etc.).

If a course code and/or course name is clearly visible, return it with confidence
"high". If only a partial hint exists (e.g. a department name but no code), return
what you can with confidence "medium". If the text is just a body of questions
with no header information, return confidence "low" with your best guess.

Exam Header Text:
{exam_header}

Return a JSON object with keys: code, name, department, level, confidence, reason.
""",
    input_variables=["exam_header"],
)

structured_course_detector = llm.with_structured_output(DetectedCourse, method="function_calling")
course_detect_chain = COURSE_DETECT_PROMPT | structured_course_detector


def detect_course(exam_text: str) -> Optional[DetectedCourse]:
    """
    Identifies the course from the paper's own header/front-matter.

    Uses the first ~3000 characters of the extracted text (the header), so it's
    a single cheap call. Returns None if the call fails.
    """
    try:
        header = exam_text[:3000].strip()
        if not header:
            return None
        print("Detecting course from paper header...")
        result = course_detect_chain.invoke({"exam_header": header})
        if result is None:
            print("Course detection returned no structured result.")
            return None
        print(f"Detected course: {result.code or '?'} - {result.name or '?'} "
              f"(confidence: {result.confidence})")
        return result
    except Exception as e:
        print(f"Course detection failed: {e}")
        return None


# ---------------------------------------------------------
# Rate-Limit / Budget Management
# ---------------------------------------------------------
# DeepSeek is pay-per-token (no tight free-tier TPM cap like Groq's 12k),
# but it still rate-limits on bursts. We keep:
#   1. Chunking long exam text so no single request is huge
#   2. A generous rolling-budget pace to avoid 429 bursts
#   3. Retry with backoff if a rate-limit error slips through

CHUNK_SIZE = 16000   # characters per chunk (~4k tokens; well under context limits)
CHUNK_OVERLAP = 600  # overlap so questions spanning a chunk boundary aren't lost
TPM_LIMIT = 100000   # generous rolling budget — only trips on genuine bursts
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
                f"LLM token budget nearly exhausted ({self.used}/{self.limit}), "
                f"pausing {wait:.0f}s for the window to roll over..."
            )
            time.sleep(wait)


_budget = _TokenBudget()


def _chunk_text(text: str) -> List[str]:
    """Split long exam text into overlapping chunks sized for the request budget."""
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
            result = chain.invoke(inputs)
            if result is None:
                # with_structured_output can return None when the model makes
                # no tool call — retry rather than silently dropping the chunk
                raise RuntimeError("LLM returned no structured result (no tool call)")
            return result
        except Exception as e:
            msg = str(e).lower()
            is_retryable = any(
                marker in msg
                for marker in ("429", "rate limit", "rate_limit", "too many requests",
                               "tokens per minute", "tpm", "insufficient balance",
                               "402", "connection", "timeout", "500", "502", "503", "504",
                               "no structured result")
            )
            if not is_retryable or attempt == MAX_RETRIES:
                if "no structured result" in str(e):
                    logger.warning(f"LLM returned no structured result (attempt {attempt}/{MAX_RETRIES})")
                else:
                    logger.error(f"LLM call failed after {attempt} attempt(s): {e}")
                return None
            wait = 15 * attempt  # 15s, 30s, 45s — lets the rate window roll over
            logger.warning(f"LLM rate limited ({e}); backing off {wait}s and retrying...")
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
    Sends extracted exam text to DeepSeek LLM to parse into structured JSON.

    Long papers are chunked into smaller calls, paced to respect the rate
    budget, and the per-chunk results are merged into a single
    ExamAnalysisResult.
    """
    try:
        print(f"Sending {len(exam_text)} characters to DeepSeek LLM for analysis...")
        chunks = _chunk_text(exam_text)
        if len(chunks) > 1:
            print(f"Split into {len(chunks)} chunk(s) to keep each request well-sized.")

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
