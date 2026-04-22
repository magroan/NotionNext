# Root cause summary

The tag and category flow had two route-handling weaknesses.

1. URL handling was inconsistent.
   - Many category links rendered raw labels directly into /category/... URLs.
   - Tag links were encoded in some places, but the logic was not centralized.
   - Japanese labels could therefore travel through mixed encoded and non-encoded paths.

2. Matching logic was inconsistent.
   - Category pages used string includes(), which is a substring check, not an exact taxonomy match.
   - Route params were not normalized before comparison.
   - This made category resolution fragile and could mis-match or fail when encoded labels were involved.

# What was changed

- Added lib/utils/taxonomy.js
  - decode and normalize route values
  - encode taxonomy URL segments
  - compare route values by exact normalized equality
- Updated components/SmartLink.js
  - normalize /tag/... and /category/... href values before rendering
- Updated tag and category route pages
  - decode params before use
  - compare using exact normalized equality
- Updated remaining plain category anchors in theme components
  - route through SmartLink so encoding is handled centrally
- Added Ubuntu automation
  - scripts/verify-taxonomy-routes.cjs
  - scripts/taxonomy-smoke.cjs
  - scripts/ubuntu-taxonomy-repair.sh

# Verification in this container

- Static source verification: passed
- Full dependency install and Next build: not completed here because node_modules was not available in the container
- The Ubuntu automation script is ready to run in a real project environment with dependencies available

# Ubuntu command

bash scripts/ubuntu-taxonomy-repair.sh
