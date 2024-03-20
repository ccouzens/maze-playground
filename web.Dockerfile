FROM docker.io/library/rust:1.76 AS wasmBuilder
RUN apt-get update && apt-get install binaryen --assume-yes
RUN rustup target add wasm32-unknown-unknown

COPY ./  /app
WORKDIR /app/www
RUN ls
RUN bash ./build.bash

FROM docker.io/library/node:21 as nodeBuilder
COPY ./www /app
WORKDIR /app
RUN npm install
RUN npm run build

FROM docker.io/library/nginx:1.25 
COPY ./www/public/ /usr/share/nginx/html
COPY --from=wasmBuilder /app/www/public/computer-LATEST.wasm /usr/share/nginx/html
COPY --from=nodeBuilder /app/public/script-LATEST.js /app/public/script-LATEST.js.map /usr/share/nginx/html/
