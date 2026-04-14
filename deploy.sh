#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# TTAI — Deploy to GCP Cloud Run
# ═══════════════════════════════════════════════════════════════
#
# Usage:  ./deploy.sh
#
# Prerequisites:
#   1. gcloud CLI installed and authenticated (gcloud auth login)
#   2. GCP project set (gcloud config set project YOUR_PROJECT_ID)
#   3. APIs enabled: Cloud Run, Artifact Registry, Cloud Storage, Secret Manager
#   4. Gemini API key stored in Secret Manager:
#      gcloud secrets create GEMINI_API_KEY --data-file=- <<< "your-key"
#
# This script will:
#   1. Create Artifact Registry repo (if not exists)
#   2. Create GCS bucket for temple data (if not exists)
#   3. Seed temple data to GCS (if empty)
#   4. Build Docker image
#   5. Push to Artifact Registry
#   6. Deploy to Cloud Run

set -euo pipefail

# ─── Configuration ──────────────────────────────────────────
REGION="asia-south1"
SERVICE_NAME="ttai-web"
REPO_NAME="ttai"
BUCKET_NAME="${PROJECT_ID:-$(gcloud config get-value project)}-ttai-data"
PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project)}"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}"

echo "═══════════════════════════════════════════════════"
echo "  TTAI Deployment to GCP"
echo "  Project:  ${PROJECT_ID}"
echo "  Region:   ${REGION}"
echo "  Service:  ${SERVICE_NAME}"
echo "  Bucket:   ${BUCKET_NAME}"
echo "═══════════════════════════════════════════════════"
echo

# ─── Step 1: Enable APIs ───────────────────────────────────
echo "[1/6] Enabling APIs..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  --quiet

# ─── Step 2: Create Artifact Registry ──────────────────────
echo "[2/6] Setting up Artifact Registry..."
gcloud artifacts repositories describe ${REPO_NAME} \
  --location=${REGION} --quiet 2>/dev/null || \
gcloud artifacts repositories create ${REPO_NAME} \
  --repository-format=docker \
  --location=${REGION} \
  --description="TTAI container images"

# ─── Step 3: Create GCS bucket for temple data ─────────────
echo "[3/6] Setting up Cloud Storage bucket..."
gsutil ls -b gs://${BUCKET_NAME} 2>/dev/null || \
gsutil mb -l ${REGION} gs://${BUCKET_NAME}

# Seed temple data if bucket is empty
EXISTING=$(gsutil ls gs://${BUCKET_NAME}/temples/ 2>/dev/null | wc -l | tr -d ' ')
if [ "${EXISTING}" -eq "0" ]; then
  echo "  Seeding temple data to GCS..."
  if [ -d "apps/ttai-web/data/temples" ] && [ "$(ls apps/ttai-web/data/temples/*.json 2>/dev/null | wc -l)" -gt "0" ]; then
    gsutil -m cp apps/ttai-web/data/temples/*.json gs://${BUCKET_NAME}/temples/
    echo "  Uploaded $(ls apps/ttai-web/data/temples/*.json | wc -l | tr -d ' ') temple files"
  else
    echo "  No local temple data found. Templates will be generated on first boot."
  fi
fi

# ─── Step 4: Build Docker image ───────────────────────────
echo "[4/6] Building Docker image..."
docker build -t ${IMAGE}:latest .

# ─── Step 5: Push to Artifact Registry ─────────────────────
echo "[5/6] Pushing to Artifact Registry..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet
docker push ${IMAGE}:latest

# ─── Step 6: Deploy to Cloud Run ──────────────────────────
echo "[6/6] Deploying to Cloud Run..."

# Check if Gemini API key secret exists
GEMINI_SECRET_EXISTS=$(gcloud secrets describe GEMINI_API_KEY --quiet 2>/dev/null && echo "yes" || echo "no")

DEPLOY_CMD="gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE}:latest \
  --region ${REGION} \
  --platform managed \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 10 \
  --port 3000 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-env-vars GCS_BUCKET_NAME=${BUCKET_NAME} \
  --set-env-vars NEXT_PUBLIC_APP_URL=\$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='value(status.url)' 2>/dev/null || echo 'https://ttai-web.run.app')"

if [ "${GEMINI_SECRET_EXISTS}" = "yes" ]; then
  DEPLOY_CMD="${DEPLOY_CMD} --set-secrets GOOGLE_GENERATIVE_AI_API_KEY=GEMINI_API_KEY:latest"
fi

eval ${DEPLOY_CMD}

# ─── Done ──────────────────────────────────────────────────
echo
echo "═══════════════════════════════════════════════════"
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='value(status.url)' 2>/dev/null || echo "Check Cloud Run console")
echo "  DEPLOYED SUCCESSFULLY"
echo "  URL: ${SERVICE_URL}"
echo "  Health: ${SERVICE_URL}/api/health"
echo "═══════════════════════════════════════════════════"
