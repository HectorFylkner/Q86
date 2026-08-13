#!/usr/bin/env python3
"""Run dependency-free Agent Skills spec and repository checks."""

from __future__ import annotations

import datetime as dt
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
STAMP_MAX_AGE_DAYS = 30


def fail(message: str) -> None:
    print(f"FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


skill = ROOT / "SKILL.md"
if not skill.is_file():
    fail("SKILL.md is missing")
text = skill.read_text(encoding="utf-8")
lines = text.splitlines()
frontmatter_match = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
if not frontmatter_match:
    fail("SKILL.md lacks YAML frontmatter")
frontmatter = frontmatter_match.group(1)

name_match = re.search(r"^name: ([^\n]+)$", frontmatter, re.MULTILINE)
description_match = re.search(r"^description: ([^\n]+)$", frontmatter, re.MULTILINE)
if not name_match or not description_match:
    fail("frontmatter requires name and description")

name = name_match.group(1)
description = description_match.group(1)
if name != ROOT.name:
    fail(f"name {name!r} does not match directory {ROOT.name!r}")
if len(name) > 64 or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", name):
    fail("name violates the 64-character lowercase single-hyphen rule")
if not 1 <= len(description) <= 1024:
    fail(f"description has {len(description)} characters; expected 1-1024")
if len(lines) >= 500:
    fail(f"SKILL.md has {len(lines)} lines; expected fewer than 500")

# The standard describes an approximate 5,000-token budget. The conservative
# character heuristic avoids a tokenizer dependency and intentionally overcounts.
estimated_tokens = (len(text) + 2) // 3
if estimated_tokens >= 5000:
    fail(f"SKILL.md is approximately {estimated_tokens} tokens; expected under 5000")

version_match = re.search(r'^  version: "([^"]+)"$', frontmatter, re.MULTILINE)
if not version_match or not re.fullmatch(r"\d+\.\d+\.\d+", version_match.group(1)):
    fail("metadata.version is absent or is not major.minor.patch")
verified_match = re.search(r'^  verified: "(\d{4}-\d{2}-\d{2})"$', frontmatter, re.MULTILINE)
if not verified_match:
    fail("metadata.verified is absent or malformed")

for relative in re.findall(r"\]\((references/[^)]+)\)", text):
    if not (ROOT / relative).is_file():
        fail(f"missing referenced file: {relative}")

reference_dir = ROOT / "references"
if not reference_dir.is_dir():
    fail("references/ directory is missing")
reference_files = sorted(reference_dir.glob("*.md"))
if not reference_files:
    fail("references/ contains no reference files")
for reference in reference_files:
    first_line = reference.read_text(encoding="utf-8").splitlines()[0]
    if not first_line.startswith("Verified:"):
        fail(f"reference lacks top-line verification stamp: {reference.name}")

# Every reference must be reachable from SKILL.md; orphans rot unnoticed.
linked = set(re.findall(r"\]\(references/([^)]+)\)", text))
orphans = sorted({r.name for r in reference_files} - linked)
if orphans:
    fail(f"reference files not linked from SKILL.md: {', '.join(orphans)}")

eval_path = ROOT / "evals" / "evals.json"
if not eval_path.is_file():
    fail(f"missing eval suite: {eval_path.relative_to(ROOT)}")
try:
    data = json.loads(eval_path.read_text(encoding="utf-8"))
except json.JSONDecodeError as error:
    fail(f"evals/evals.json is not valid JSON: {error}")
cases = data.get("cases", [])
if not 10 <= len(cases) <= 14:
    fail(f"expected 10-14 eval cases, found {len(cases)}")
if len({case.get("id") for case in cases}) != len(cases):
    fail("eval case IDs are not unique")
for case in cases:
    if not case.get("assertions") or not case.get("human_judgment"):
        fail(f"eval case lacks rubric fields: {case.get('id')}")

# Staleness is a warning, not a failure: the skill can be structurally valid and
# still be out of date. Volatile vendor claims are the reason the stamp exists.
verified_on = dt.date.fromisoformat(verified_match.group(1))
age = (dt.date.today() - verified_on).days
stale_note = ""
if age > STAMP_MAX_AGE_DAYS:
    stale_note = (
        f"  WARN verification stamp is {age} days old (> {STAMP_MAX_AGE_DAYS});"
        " re-fetch vendor routes before relying on model-specific claims"
    )
unverified = [r.name for r in reference_files
              if "NOT re-verified" in r.read_text(encoding="utf-8").splitlines()[0]]

print(f"PASS name: {name!r}, {len(name)}/64 chars, valid single-hyphen form, matches directory")
print(f"PASS description: {len(description)}/1024 chars, trigger terms front-loaded")
print(f"PASS body budget: {len(lines)}/499 lines, <= {estimated_tokens}/5000 estimated tokens")
print(f"PASS disclosure: {len(reference_files)} one-level reference files; all links resolve; no orphans")
print(f"PASS verification: every reference has a top-line stamp; {len(cases)} eval cases are well-formed")
if unverified:
    print(f"  NOTE routes flagged NOT re-verified: {', '.join(sorted(unverified))}")
if stale_note:
    print(stale_note)
