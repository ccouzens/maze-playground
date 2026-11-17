set -ex

turbo build

VERSION="$(git rev-parse HEAD)"

cp dist/index.html "dist/game-${VERSION}.html"
cp dist/index.html "dist/game.html"
cp dist/rendering-playground.html "dist/rendering-playground-${VERSION}.html"

ls -- dist

gcloud storage cp \
  --content-type="text/plain" \
  --gzip-local-all \
  dist/assets/*.glsl \
  dist/assets/*.wgsl \
  gs://maze-playground/assets/

gcloud storage cp \
  --content-type="application/json" \
  --gzip-local-all \
  dist/assets/*.js.map \
  gs://maze-playground/assets/

gcloud storage cp \
  --gzip-local-all \
  dist/assets/*.wasm \
  dist/assets/*.js \
  dist/assets/*.css \
  gs://maze-playground/assets/

gcloud storage cp \
  --gzip-local=json,svg \
  dist/*.json \
  dist/*.svg \
  dist/*.png \
  gs://maze-playground/

gcloud storage cp \
  --gzip-local-all \
  dist/*.html \
  gs://maze-playground/
