build-and-push-dev:
	docker build -f docker/web-dev.Dockerfile -t ghcr.io/sdwalker62/gitchef/web-dev-container:latest .
	docker push ghcr.io/sdwalker62/gitchef/web-dev-container:latest