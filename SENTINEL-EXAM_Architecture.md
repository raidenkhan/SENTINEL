# SENTINEL-EXAM: System Architecture Document

## Executive Summary

**Project Name:** SENTINEL-EXAM - Automated Past Questions Analyzer for Engineering Courses

**Purpose:** An intelligent system that analyzes historical exam papers to identify question patterns, topic frequencies, and predict likely focus areas to improve student exam preparation.

**Target Users:** Engineering undergraduates at KNUST and similar institutions

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

### 1.1 Architecture Pattern
**Decoupled Microservices Architecture** - Separating concerns between frontend presentation, backend processing, and data storage.

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE LAYER                     │
│              (Next.js 14+ with App Router)                   │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ REST API / Server Actions
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│                    (FastAPI Backend)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Upload       │  │ OCR/Parse    │  │ Analysis     │      │
│  │ Handler      │  │ Engine       │  │ Engine       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   AI/NLP PROCESSING LAYER                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  LangChain + Groq (Llama 3)                          │   │
│  │  - Topic Extraction                                   │   │
│  │  - Bloom's Taxonomy Classification                    │   │
│  │  - Semantic Similarity (ChromaDB)                     │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Supabase     │  │ ChromaDB     │  │ File Storage │      │
│  │ (PostgreSQL) │  │ (Vectors)    │  │ (PDFs)       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. TECHNOLOGY STACK (Zero-Cost Production Grade)

### 2.1 Frontend Stack
| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Framework** | Next.js 14+ (App Router) | SEO optimization, Server Actions, modern React patterns |
| **UI Library** | Shadcn/ui + Tailwind CSS | Professional enterprise aesthetics, zero custom CSS overhead |
| **Charts** | Recharts / Tremor | Interactive data visualization for trend analysis |
| **State Management** | React Server Components + Zustand | Minimal client-side state, leveraging server components |
| **Deployment** | Vercel (Hobby Tier) | Automatic CI/CD, SSL, CDN, edge functions |

### 2.2 Backend Stack
| Component | Technology | Justification |
|-----------|-----------|---------------|
| **API Framework** | FastAPI (Python) | High performance, async support, auto-documentation |
| **OCR Engine** | PyMuPDF + EasyOCR/Tesseract | Hybrid approach for native PDFs and scanned images |
| **Image Processing** | OpenCV + pdf2image | Pre-processing for OCR accuracy improvement |
| **Task Queue** | FastAPI BackgroundTasks | Async processing without Redis overhead |
| **Deployment** | Render.com (Free Tier) | Zero-cost Python hosting with auto-sleep |

### 2.3 AI/NLP Stack
| Component | Technology | Justification |
|-----------|-----------|---------------|
| **LLM Provider** | Groq Cloud (Llama 3) | 10x faster than OpenAI, massive free tier |
| **Framework** | LangChain | Structured LLM interactions, prompt templating |
| **Vector DB** | ChromaDB (Local/Embedded) | Semantic similarity search, zero hosting cost |
| **Embeddings** | sentence-transformers | Open-source, runs locally |

### 2.4 Data Layer
| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Primary Database** | Supabase (PostgreSQL) | 500MB free tier, built-in auth, real-time subscriptions |
| **File Storage** | Supabase Storage | 1GB free for PDF storage with CDN |
| **Caching Strategy** | MD5 hashing + DB lookup | Prevent duplicate processing |

---

## 3. FUNCTIONAL REQUIREMENTS

### FR1: Multi-Format Document Ingestion
**Description:** System must accept and process both native PDF text and scanned image-based PDFs.

**Technical Implementation:**
- **Step 1:** File upload via Next.js with drag-and-drop (react-dropzone)
- **Step 2:** MD5 hash calculation to check for duplicates
- **Step 3:** Upload to Supabase Storage
- **Step 4:** Trigger background processing job

**Acceptance Criteria:**
- Support PDF files up to 10MB
- Detect and reject duplicate submissions
- Provide real-time upload progress

### FR2: Intelligent Text Extraction Pipeline
**Description:** Extract text from documents with >85% accuracy.

**Processing Pipeline:**
```python
# Pseudo-code flow
if is_native_pdf(file):
    text = extract_with_pymupdf(file)
else:
    images = convert_pdf_to_images(file)
    images = preprocess_with_opencv(images)  # Grayscale, threshold
    text = ocr_with_easyocr(images)

# Post-processing
text = remove_headers_footers(text)
text = clean_noise_with_regex(text)
```

### FR3: Semantic Topic Categorization
**Description:** Map extracted questions to engineering syllabus topics using LLM.

**System Prompt Structure:**
```json
{
  "role": "You are an Expert Engineering Professor and Lead Curriculum Auditor",
  "task": "Analyze engineering exam questions",
  "output_schema": {
    "course_metadata": {"code": "string", "level": "int"},
    "analysis": [
      {
        "topic": "string",
        "sub_topic": "string", 
        "weight": "float (0-1)",
        "blooms_level": "string",
        "is_calculation_heavy": "boolean"
      }
    ]
  }
}
```

### FR4: Longitudinal Trend Analysis
**Description:** Weighted frequency analysis across multiple years.

**Mathematical Model - Weighted Decay Algorithm:**
```
Importance Score = Σ (Frequency × e^(-λt))

Where:
- Frequency = number of occurrences of topic
- t = age of exam paper (years)
- λ = decay constant (suggested: 0.3)
```

**Why This Matters:** Recent papers weighted more heavily than older ones to account for curriculum changes.

### FR5: Vector-Based Similarity Detection
**Description:** Identify semantically similar questions across years using ChromaDB.

**Implementation:**
1. Embed each question using sentence-transformers
2. Store in ChromaDB with metadata (year, topic, course)
3. Query similar questions with cosine similarity threshold >0.85

**Use Case:** "Design a full-wave rectifier" (2018) matches "Explain full-wave rectification circuit" (2023)

### FR6: Bloom's Taxonomy Classification
**Description:** Classify questions by cognitive complexity level.

**Levels:**
- **Remember:** Define, List, Recall
- **Understand:** Explain, Summarize, Interpret
- **Apply:** Calculate, Demonstrate, Solve
- **Analyze:** Compare, Examine, Differentiate
- **Evaluate:** Critique, Justify, Assess
- **Create:** Design, Construct, Develop

**Engineering Value:** Identifies whether exams test theory vs. application

### FR7: Interactive Visualization Dashboard
**Description:** Display analytical insights through interactive charts.

**Dashboard Components:**
1. **Topic Frequency Heatmap** - Grid showing topic occurrence by year
2. **Trend Line Chart** - Topic frequency over time with decay weighting
3. **Bloom's Distribution** - Pie chart of question complexity levels
4. **High-Yield Topics** - Ranked list with prediction confidence scores

### FR8: Generative Study Assistant (RAG)
**Description:** Chat interface for querying past questions.

**Example Queries:**
- "How does this course usually test Thevenin's Theorem?"
- "Show me all application-level questions on DC motors"
- "What's the typical structure of thermodynamics questions?"

**Technical Stack:**
- ChromaDB for semantic search
- LangChain for RAG orchestration
- Groq for LLM inference

### FR9: User Authentication & Access Control
**Description:** A modal/overlay-based authentication system.
- **Login Flow:** Email/Password interface.
- **Registration Flow:** Must capture Student Information (e.g., Major/Course of study, Year).
- **Access Goal:** Allow registered students to view existing analysis for their specific courses without requiring them to upload new documents.

---

## 4. NON-FUNCTIONAL REQUIREMENTS

### NFR1: Performance
- **Upload Processing:** <30 seconds for 10-page PDF
- **Query Response Time:** <2 seconds for dashboard analytics
- **OCR Accuracy:** Minimum 85% character recognition rate

### NFR2: Scalability
- **Concurrent Users:** Handle 50 simultaneous uploads
- **Data Growth:** Support 500+ exam papers per course
- **Background Jobs:** Async processing to prevent UI blocking

### NFR3: Data Integrity
- **Duplicate Prevention:** MD5 hash comparison before processing
- **Validation:** Schema validation for all LLM JSON outputs
- **Error Recovery:** Retry logic for failed API calls (max 3 attempts)

### NFR4: Security
- **File Validation:** Accept only PDF format, scan for malicious content
- **Rate Limiting:** 10 uploads per user per hour
- **Authentication:** Supabase Auth (email/password or OAuth)

### NFR5: Maintainability
- **Code Quality:** Type hints for Python, TypeScript for Next.js
- **Documentation:** OpenAPI specs for FastAPI endpoints
- **Testing:** Unit tests for core algorithms, integration tests for API

---

## 5. API ARCHITECTURE (FastAPI Endpoints)

### 5.1 Upload & Processing Flow

```
POST /api/upload
├── Request: multipart/form-data (PDF file + metadata)
├── Response: { "upload_id": "uuid", "status": "queued" }
└── Actions:
    1. Calculate MD5 hash
    2. Check for duplicates in DB
    3. Upload to Supabase Storage
    4. Create DB record with status='pending'
    5. Trigger background job

GET /api/status/{upload_id}
├── Response: { "status": "processing|completed|failed", "progress": 0-100 }

POST /api/process/{upload_id}
├── Background Task Pipeline:
    1. Download PDF from storage
    2. Extract text (PyMuPDF or OCR)
    3. Send to LLM for analysis
    4. Store results in PostgreSQL
    5. Generate vector embeddings
    6. Update status='completed'

GET /api/analytics/{course_code}
├── Query Parameters: ?years=5&min_frequency=3
├── Response: Aggregated JSON with trend data
└── DB Query: 
    SELECT topic, year, COUNT(*) as frequency
    FROM questions
    WHERE course_code = ?
    GROUP BY topic, year
    ORDER BY weighted_importance DESC
```

### 5.2 RAG Chat Interface

```
POST /api/chat
├── Request: { "query": "string", "course_code": "string" }
├── Process:
    1. Embed query with sentence-transformers
    2. Search ChromaDB for relevant questions (top 5)
    3. Construct prompt with context
    4. Send to Groq LLM
    5. Return structured response
└── Response: { "answer": "string", "sources": [...] }
```

---

## 6. DATABASE SCHEMA (PostgreSQL - Supabase)

### 6.1 Tables

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    course_of_study VARCHAR(100), -- Major/Program (e.g., Computer Engineering)
    academic_year INT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Courses Table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department VARCHAR(100),
    level INT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Exam Papers Table
CREATE TABLE exam_papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id),
    year INT NOT NULL,
    semester VARCHAR(20),
    file_url TEXT NOT NULL,
    file_hash VARCHAR(64) UNIQUE, -- MD5 hash
    upload_date TIMESTAMP DEFAULT NOW(),
    processing_status VARCHAR(20) DEFAULT 'pending',
    ocr_accuracy FLOAT
);

-- Questions Table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID REFERENCES exam_papers(id),
    question_number VARCHAR(10),
    raw_text TEXT,
    topic VARCHAR(100),
    sub_topic VARCHAR(100),
    blooms_level VARCHAR(20),
    is_calculation_heavy BOOLEAN,
    weight FLOAT DEFAULT 1.0,
    extracted_at TIMESTAMP DEFAULT NOW()
);

-- Analytics Cache Table
CREATE TABLE analytics_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id),
    cache_key VARCHAR(100) UNIQUE,
    result_json JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- Vector Embeddings (managed by ChromaDB separately)
-- Stored as collection: "exam_questions"
```

### 6.2 Indexes
```sql
CREATE INDEX idx_questions_topic ON questions(topic);
CREATE INDEX idx_questions_paper_year ON questions(paper_id, year);
CREATE INDEX idx_papers_course_year ON exam_papers(course_id, year);
```

---

## 7. LLM SYSTEM PROMPT (Critical Component)

### Master Prompt Template

```python
SYSTEM_PROMPT = """
Role: You are an Expert Engineering Professor and Lead Curriculum Auditor with 20 years of experience in {department} Engineering.

Task: Analyze the provided text from an engineering exam paper for {course_code} - {course_name}.

Constraints:
1. Categorization: Map questions to specific engineering concepts within this discipline
2. Granularity: Identify both the "Core Concept" and "Sub-Topic"
3. Bloom's Taxonomy: Classify cognitive level (Remember, Understand, Apply, Analyze, Evaluate, Create)
4. Calculation Detection: Determine if the question requires numerical problem-solving
5. No Hallucination: Only extract information explicitly present in the text
6. Structured Output: Return ONLY valid JSON, no explanations

Context - Course Syllabus Topics:
{syllabus_topics}

Input Text:
{exam_text}

Output Schema (strict JSON):
{{
  "course_metadata": {{
    "code": "string",
    "level": "int (100-400)",
    "detected_topics": ["string"]
  }},
  "questions": [
    {{
      "question_id": "string (e.g., Q1a, Q2b)",
      "topic": "string (main topic from syllabus)",
      "sub_topic": "string (specific concept)",
      "weight": "float (0.0-1.0, importance/difficulty)",
      "blooms_level": "string (Remember|Understand|Apply|Analyze|Evaluate|Create)",
      "is_calculation_heavy": "boolean",
      "keywords": ["string (max 5 technical terms)"]
    }}
  ],
  "summary": "string (2-sentence pedagogical trend observation)"
}}

Critical Rules:
- If topic is ambiguous, choose the most specific match from the syllabus
- Weight calculation: 0.3 for Remember/Understand, 0.6 for Apply/Analyze, 1.0 for Evaluate/Create
- If text is too degraded to analyze, return {{"error": "OCR quality insufficient"}}
"""
```

---

## 8. DEPLOYMENT ARCHITECTURE

### 8.1 Zero-Cost Hosting Strategy

```
┌─────────────────────────────────────────────────┐
│  CLIENT BROWSER                                 │
└──────────────┬──────────────────────────────────┘
               │
               │ HTTPS
               ▼
┌─────────────────────────────────────────────────┐
│  VERCEL CDN/EDGE NETWORK                        │
│  ├─ Next.js Frontend (Static + SSR)             │
│  ├─ API Routes (Serverless Functions)           │
│  └─ Automatic SSL/Domain Management             │
└──────────────┬──────────────────────────────────┘
               │
               │ REST API Calls
               ▼
┌─────────────────────────────────────────────────┐
│  RENDER.COM (Free Tier)                         │
│  ├─ FastAPI Backend (Auto-sleep after 15min)    │
│  ├─ Background Workers                           │
│  └─ Cold Start: ~30 seconds                     │
└──────────────┬──────────────────────────────────┘
               │
               ├──────────────┬──────────────┐
               ▼              ▼              ▼
┌──────────────────┐ ┌────────────┐ ┌───────────────┐
│  SUPABASE        │ │ GROQ CLOUD │ │ ChromaDB      │
│  ├─ PostgreSQL   │ │ (Llama 3)  │ │ (Embedded/    │
│  ├─ File Storage │ │ LLM API    │ │  Local)       │
│  └─ Auth         │ └────────────┘ └───────────────┘
└──────────────────┘
```

### 8.2 Critical Deployment Considerations

**Cold Start Mitigation (Render Free Tier):**
```javascript
// Frontend: Show loading state during cold start
const callAPI = async () => {
  setIsWakingUp(true);
  try {
    const response = await fetch('/api/health', { 
      timeout: 35000  // 35s timeout for cold start
    });
    // ... proceed
  } catch (error) {
    if (error.name === 'TimeoutError') {
      // Retry logic
    }
  }
};
```

**Rate Limit Handling (Groq API):**
- Free Tier: ~14,400 requests/day
- Strategy: Implement exponential backoff
- Fallback: Cache LLM responses in PostgreSQL

---

## 9. ACCURACY VALIDATION STRATEGY

### 9.1 Manual Ground Truth Dataset
**Process:**
1. Manually analyze 20 past papers (4 papers × 5 courses)
2. Create ground truth JSON with expert-labeled topics
3. Run system analysis on same papers
4. Calculate F1-Score

**Metrics:**
```
Precision = True Positives / (True Positives + False Positives)
Recall = True Positives / (True Positives + False Negatives)
F1-Score = 2 × (Precision × Recall) / (Precision + Recall)

Target: F1 > 0.85
```

### 9.2 Error Analysis Categories
- **OCR Errors:** Misread mathematical symbols
- **Topic Misclassification:** Wrong syllabus mapping
- **Bloom's Level:** Cognitive complexity misjudgment

---

## 10. RISK MITIGATION STRATEGY

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Poor OCR Quality | High | Medium | Pre-processing with OpenCV, manual verification UI |
| LLM Hallucination | High | Low | Strict JSON schema validation, syllabus constraints |
| API Rate Limits | Medium | High | Aggressive caching, request batching |
| Free Tier Shutdown | Low | Low | Document migration path to paid tiers |
| Duplicate Data | Medium | High | MD5 hashing, DB unique constraints |

---

## 11. FUTURE ENHANCEMENTS (Post-MVP)

1. **Automated Answer Grading:** Use RAG to grade student practice answers
2. **Personalized Study Plans:** ML-based recommendation system
3. **Mobile App:** React Native version
4. **Peer Collaboration:** Share study notes on specific topics
5. **Professor Dashboard:** Analytics on question difficulty distribution

---

## 12. SUCCESS CRITERIA (For Final Year Presentation)

### Technical Excellence
- ✅ Working end-to-end system with live demo
- ✅ F1-Score >0.85 on topic classification
- ✅ <30s processing time for average paper
- ✅ Professional UI/UX matching industry standards

### Academic Rigor
- ✅ Detailed system design documentation
- ✅ Mathematical justification for weighted decay algorithm
- ✅ Comparative analysis with baseline keyword matching
- ✅ Error analysis and limitations discussion

### Engineering Maturity
- ✅ Deployed on production-grade infrastructure
- ✅ API documentation (OpenAPI/Swagger)
- ✅ Unit test coverage >70%
- ✅ Version control with meaningful commits

---

## APPENDIX: Weighted Decay Algorithm Implementation

```python
import math
from typing import List, Dict
from datetime import datetime

def calculate_topic_importance(
    topic_occurrences: List[Dict[str, any]], 
    decay_constant: float = 0.3
) -> float:
    """
    Calculate weighted importance score for a topic across years.
    
    Args:
        topic_occurrences: List of {"year": int, "frequency": int}
        decay_constant: Lambda value for exponential decay (default 0.3)
    
    Returns:
        Weighted importance score
    """
    current_year = datetime.now().year
    importance_score = 0.0
    
    for occurrence in topic_occurrences:
        year = occurrence["year"]
        frequency = occurrence["frequency"]
        time_diff = current_year - year
        
        # Exponential decay: recent years weighted more heavily
        weight = math.exp(-decay_constant * time_diff)
        importance_score += frequency * weight
    
    return round(importance_score, 2)

# Example usage:
topic_data = [
    {"year": 2024, "frequency": 5},
    {"year": 2023, "frequency": 4},
    {"year": 2022, "frequency": 6},
    {"year": 2021, "frequency": 3},
]

score = calculate_topic_importance(topic_data)
# 2024: 5 × e^0 = 5.0
# 2023: 4 × e^-0.3 = 2.96
# 2022: 6 × e^-0.6 = 3.29
# 2021: 3 × e^-0.9 = 1.22
# Total: ~12.47
```

---

**Document Version:** 1.0  
**Last Updated:** [Current Date]  
**Prepared By:** SENTINEL-EXAM Development Team  
**Project Supervisor:** [Lecturer Name]
