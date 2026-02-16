REGISTRY = ghcr.io/joel-ajayi
IMAGE_NAME = cls-marketpulse

TAG := $(shell git rev-parse --short HEAD)
FULL_IMAGE_NAME = $(REGISTRY)/$(IMAGE_NAME):$(TAG)

.PHONY: build push deploy all

# 2. The Push Command
build_and_push:
	@echo "🏗️  Building Docker image: $(FULL_IMAGE_NAME):$(TAG)..."
	docker build -t $(FULL_IMAGE_NAME) .
	@echo "🚀 Pushing to GitHub Container Registry..."
	docker push $(FULL_IMAGE_NAME)
