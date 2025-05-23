FROM python:3.12.10-slim

# Install psycopg2 dependencies
RUN apt-get update && apt-get install -y gcc libpq-dev

WORKDIR /annotate_app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000
ENV COFIG=development

COPY . .

CMD ["python3", "flask_main.py"]
