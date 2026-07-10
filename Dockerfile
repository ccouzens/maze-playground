FROM docker.io/library/rust:1.97 AS builder
RUN rustup target add wasm32-unknown-unknown

RUN curl --silent -L https://github.com/WebAssembly/binaryen/releases/download/version_130/binaryen-version_130-x86_64-linux.tar.gz | tar -xz
ENV PATH="${PATH}:$PWD/binaryen-version_130/bin"
RUN apt-get update && apt-get install nodejs node-corepack --assume-yes --no-install-recommends --no-install-suggests
RUN corepack enable

WORKDIR /app/
COPY ./package.json ./pnpm-lock.yaml /app/
RUN corepack pnpm install

COPY ./ /app/
RUN corepack pnpm exec turbo build

FROM docker.io/library/nginx:1.31 
COPY --from=builder ./app/dist/ /usr/share/nginx/html
