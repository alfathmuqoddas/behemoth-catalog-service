.PHONY: dev build install shell clean

# ===== Config =====
IMAGE      := node:lts-alpine
APP_DIR    := /app
HOST_DIR   := $(CURDIR)
PORT       ?= 3020
NETWORK    ?= proxy

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

shell:
	$(call docker_run,$(IMAGE) sh)
