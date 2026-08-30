FROM python:3.12-slim

# Prevents .pyc files and forces stdout/stderr to be unbuffered so
# `docker logs` shows Django/gunicorn output immediately.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System deps needed to build psycopg2-binary and Pillow on slim images.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# collectstatic needs *some* value for every required env var to
# import settings.py at all -- these are throwaway build-time
# placeholders, never used at runtime (the real values come from
# docker-compose's env_file at container start).
RUN SECRET_KEY=build-only-placeholder \
    DB_NAME=build DB_USER=build DB_PASSWORD=build \
    EMAIL_HOST_USER=build EMAIL_HOST_PASSWORD=build \
    python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "loomino.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
