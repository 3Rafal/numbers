FROM python:3.10-slim
FROM pytorch/pytorch:latest

WORKDIR /app

RUN apt-get update && apt-get install -y gcc g++

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .
COPY static/ ./static/
COPY resnet34-finetuned.pth .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]