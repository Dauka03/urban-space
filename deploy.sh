#!/bin/bash
set -e

# Настройки — измени под себя
DOCKER_USER="dauqen"
IMAGE_NAME="urban-space-frontend"
VPS_USER="ubuntu"
VPS_IP="213.155.22.220"

IMAGE="$DOCKER_USER/$IMAGE_NAME"

echo "🔨 Building Docker image..."
docker build -t "$IMAGE:latest" .

echo "📤 Pushing to Docker Hub..."
docker push "$IMAGE:latest"

echo "🚀 Deploying on VPS..."
ssh "$VPS_USER@$VPS_IP" "
  docker pull $IMAGE:latest &&
  docker stop urban-space 2>/dev/null || true &&
  docker rm urban-space 2>/dev/null || true &&
  docker run -d \
    --name urban-space \
    --restart unless-stopped \
    -p 80:80 \
    $IMAGE:latest
  echo '✅ Done!'
"
