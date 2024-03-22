FROM docker.io/library/rust:1.76 AS builder
RUN rustup target add wasm32-unknown-unknown
RUN apt-get update && apt-get install nodejs npm --assume-yes --no-install-recommends --no-install-suggests

WORKDIR /app/
COPY ./package.json ./package-lock.json ./pnpm-lock.yaml /app/
RUN npm ci

COPY ./computer/ /app/computer/
WORKDIR /app/computer/
RUN cargo build --target=wasm32-unknown-unknown --release

WORKDIR /app/
COPY ./  /app
RUN node build.mjs

FROM docker.io/library/nginx:1.25 
COPY --from=builder ./app/build/ /usr/share/nginx/html
