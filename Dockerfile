FROM docker.io/library/rust:1.76 AS builder
RUN rustup target add wasm32-unknown-unknown
RUN apt-get update && apt-get install golang --assume-yes --no-install-recommends --no-install-suggests

COPY ./esbuild/ /app/esbuild/
WORKDIR /app/esbuild/
RUN go build

COPY ./computer/ /app/computer/
WORKDIR /app/computer/
RUN cargo build --target=wasm32-unknown-unknown --release

WORKDIR /app/esbuild/
COPY ./  /app
RUN go run .

FROM docker.io/library/nginx:1.25 
COPY --from=builder ./app/build/ /usr/share/nginx/html
