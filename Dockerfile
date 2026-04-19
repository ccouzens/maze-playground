FROM docker.io/library/rust:1.95 AS builder
RUN rustup target add wasm32-unknown-unknown
RUN apt-get update && apt-get install binaryen nodejs node-corepack --assume-yes --no-install-recommends --no-install-suggests
RUN corepack enable

WORKDIR /app/
COPY ./package.json ./pnpm-lock.yaml  /app/
RUN corepack pnpm install

COPY ./  /app/
RUN corepack pnpm exec turbo build

FROM docker.io/library/nginx:1.25 
COPY --from=builder ./app/dist/ /usr/share/nginx/html
