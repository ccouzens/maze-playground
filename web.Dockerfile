FROM docker.io/library/rust:1.76 AS wasmBuilder
RUN apt-get update && apt-get install binaryen --assume-yes
RUN rustup target add wasm32-unknown-unknown

COPY ./  /app
WORKDIR /app/wasm/www
RUN ls
RUN bash ./build.bash

FROM docker.io/library/node:21 as nodeBuilder
COPY ./wasm/www /app
WORKDIR /app
RUN npm install
RUN npm run build

FROM docker.io/library/nginx:1.25 
COPY ./wasm/www/public/ /usr/share/nginx/html
COPY --from=wasmBuilder /app/wasm/www/public/computer.wasm /usr/share/nginx/html
COPY --from=nodeBuilder /app/public/bundle.js /usr/share/nginx/html
