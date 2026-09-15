FROM python:3.10-slim

# Install system dependencies required by OpenCV and MediaPipe
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libegl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirement specifications
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Set default host and port environment variables
ENV HOST=0.0.0.0
ENV PORT=8000

EXPOSE 8000

CMD ["python", "server.py"]
