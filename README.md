# maze-playground

## Run in Docker

```bash
# podman
podman container run --rm -p 8080:80 "$(podman image build -f web.Dockerfile . --quiet | tail -n 1)"
# docker
docker container run --rm -p 8080:80 "$(docker image build -f web.Dockerfile . --quiet | tail -n 1)"
```
