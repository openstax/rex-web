project_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"

lighthouse_paths=(
  /books/anatomy-and-physiology/pages/1-introduction
  /books/biology-2e/pages/1-introduction
  /books/introduction-sociology-3e/pages/1-introduction
  /books/psychology-2e/pages/1-introduction
  /books/us-history/pages/1-introduction
)

LIGHTHOUSE_PAGES=$(jq --compact-output --null-input '$ARGS.positional | map("https://openstax.org" + .)' \
                      --args -- "${lighthouse_paths[@]}") \
LIGHTHOUSE_TARGETS='{"accessibility":1,"best-practices":1,"customAccessibility":1,"seo":0.98}' \
REACT_APP_ENV=test \
SERVER_MODE=built \
yarn jest --config "$project_dir/jest-puppeteer.config.json" "$project_dir/src/lighthouse.prerenderspec.ts"
