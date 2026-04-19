set -ex

echo $PATH
echo $GITHUB_PATH
ls -- "$GITHUB_PATH"

# rustup target add wasm32-unknown-unknown
# pnpm install

wasm-opt --version

which wasm-opt

pnpm exec turbo build --env-mode=loose

VERSION="$(git rev-parse HEAD)"

cp dist/index.html "dist/game-${VERSION}.html"
cp dist/index.html "dist/game.html"
cp dist/rendering-playground.html dist/rendering-playground-${VERSION}.html"

ls -- dist

gsutil \
  -m \
  -h "Content-Type:text/plain" \
  cp \
  -Z \
  dist/*.glsl \
  dist/*.wgsl \
  gs://maze-playground/

gsutil \
  -m \
  -h "Content-Type:application/json" \
  cp \
  -Z \
  dist/*.js.map \
  dist/*.css.map \
  gs://maze-playground/

gsutil \
  -m \
  cp \
  -Z \
  dist/*.wasm \
  dist/*.js \
  dist/*.css \
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
