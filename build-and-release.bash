set -ex

turbo build

VERSION="$(git rev-parse HEAD)"

cp dist/index.html "dist/game-${VERSION}.html"
cp dist/index.html "dist/game.html"
cp dist/rendering-playground.html "dist/rendering-playground-${VERSION}.html"

ls -- dist

gsutil \
  -m \
  -h "Content-Type:text/plain" \
  cp \
  -Z \
  dist/assets/*.glsl \
  dist/assets/*.wgsl \
  gs://maze-playground/assets/

gsutil \
  -m \
  -h "Content-Type:application/json" \
  cp \
  -Z \
  dist/assets/*.js.map \
  gs://maze-playground/assets/

gsutil \
  -m \
  cp \
  -Z \
  dist/assets/*.wasm \
  dist/assets/*.js \
  dist/assets/*.css \
  gs://maze-playground/assets/

gsutil \
  -m \
  cp \
  -Z \
  dist/*.json \
  dist/*.svg \
  dist/*.png \
  gs://maze-playground/

gsutil \
  -m \
  cp \
  -Z \
  dist/*.html \
  gs://maze-playground/
