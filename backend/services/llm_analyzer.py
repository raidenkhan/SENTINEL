import json
from typing import List, Optional
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from core.config import settings

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

def process_exam_text(
    exam_text: str,
    course_code: str,
    course_name: str,
    department: str,
    syllabus_topics: str
) -> Optional[ExamAnalysisResult]:
    """
    Sends extracted exam text to Groq LLM to parse into structured JSON.
    """
    try:
        print(f"Sending {len(exam_text)} characters to Groq LLM for analysis...")
        result = chain.invoke({
            "exam_text": exam_text,
            "course_code": course_code,
            "course_name": course_name,
            "department": department,
            "syllabus_topics": syllabus_topics
        })
        return result
    except Exception as e:
        print(f"Error during LLM Analysis: {e}")
        return None

