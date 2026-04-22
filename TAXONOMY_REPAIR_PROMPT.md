# Purpose
Repair NotionNext so that tag and category pages work correctly, especially with Japanese labels and encoded URLs.

# Required outcome
- Identify the root cause of tag and category failures.
- Apply fixes without breaking existing routes or themes.
- Ensure internal links to /tag/... and /category/... are URL-safe.
- Ensure route params are decoded and matched by exact normalized value.
- Verify the result on Ubuntu with lint, type-check, build, local start, and smoke tests.
- Stop immediately on any error and print the failing step.

# Constraints
- Preserve existing behavior outside tag and category routing.
- Do not change Notion property names unless required by evidence.
- Prefer shared helpers over copy-paste fixes.
- Keep source changes ASCII-only where newly added.
- Make the process idempotent.

# Execution steps
1. Inspect current tag and category route handling, including links rendered by themes.
2. Reproduce the problem or prove the faulty path handling by code inspection.
3. Introduce a shared taxonomy URL helper for normalization and encoding.
4. Update route pages so params are decoded and compared by exact normalized value.
5. Update link generation so Japanese tag and category labels are encoded consistently.
6. Add Ubuntu automation that runs:
   - source verification
   - lint
   - type-check
   - build
   - local start
   - smoke tests against /tag and /category pages
7. Report changed files, root cause, verification results, and any remaining risks.

# Ubuntu command
bash scripts/ubuntu-taxonomy-repair.sh
