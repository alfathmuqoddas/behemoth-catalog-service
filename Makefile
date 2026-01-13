.PHONY: dev build install shell clean

# ===== Config =====
IMAGE      := node:lts-alpine
APP_DIR    := /app
HOST_DIR   := $(CURDIR)
PORT       ?= 3020
NETWORK    ?= proxy
TAG        ?= latest
SERVICE_NAME := behemoth-catalog-service
REGISTRY     := registry.local:5000
FULL_IMAGE   := $(REGISTRY)/$(SERVICE_NAME):$(TAG)
KEYS_PATH    := /home/alfath/Downloads/behemoth/secrets/keys

# ===== Helpers =====
define docker_run
	docker run --rm -it \
		-v $(HOST_DIR):$(APP_DIR) \
		-w $(APP_DIR) \
		--network $(NETWORK) \
		$(1)
endef

# ===== Targets =====
install:
	$(call docker_run,$(IMAGE) sh -c "npm install")

dev:
	$(call docker_run, \
		-e CHOKIDAR_USEPOLLING=true \
		-p $(PORT):$(PORT) \
		$(IMAGE) sh -c "npm run dev -- --host 0.0.0.0")

build:
	$(call docker_run,$(IMAGE) sh -c "npm run build")

build-images:
	docker build -t $(FULL_IMAGE) .

push-images:
	docker push $(FULL_IMAGE)

run-images:
	docker run -d -p $(PORT):$(PORT) --env-file ./.env --network $(NETWORK) -v $(KEYS_PATH):/app/keys --name $(SERVICE_NAME) $(FULL_IMAGE)

shell:
	$(call docker_run,$(IMAGE) sh)
