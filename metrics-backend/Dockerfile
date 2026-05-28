FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
RUN mkdir -p /app/logs && chown -R appuser:appgroup /app/logs
COPY main.py .

VOLUME ["/app/logs"]
USER appuser
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]