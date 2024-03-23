# maze-playground

## Run in Docker

```bash
# podman
podman container run --rm -p 8080:80 "$(podman image build . --quiet | tail -n 1)"
# docker
docker container run --rm -p 8080:80 "$(docker image build . --quiet | tail -n 1)"
```
