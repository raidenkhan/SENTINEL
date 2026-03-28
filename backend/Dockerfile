# Stage 1: Build dependencies
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Final runtime image
FROM python:3.11-slim

WORKDIR /app

# Install runtime system dependencies (for OpenCV/RapidOCR)
RUN apt-get update && apt-get install -y \
    libpq5 \
    curl \
    libgl1 \
    libglib2.0-0 \
    libxcb1 \
    libx11-6 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed python packages from builder
COPY --from=builder /root/.local /root/.local
COPY . .

# Ensure scripts in .local/bin are in PATH
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

EXPOSE 7860

# Start FastAPI with Uvicorn on port 7860 (Hugging Face default)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
