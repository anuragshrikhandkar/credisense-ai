"""
create_structure.py
-------------------
Creates the full folder structure for the credisense-ai project.

Usage:
    python create_structure.py                 # creates ./credisense-ai
    python create_structure.py D:\\projects    # creates D:\\projects\\credisense-ai
"""

import sys
from pathlib import Path

PROJECT_NAME = "credisense-ai"

# Every folder to create, relative to the project root.
FOLDERS = [
    # ---------------- Frontend ----------------
    "frontend/public",
    "frontend/src/assets",
    "frontend/src/components/calculator",
    "frontend/src/components/chat",
    "frontend/src/components/documents",
    "frontend/src/components/layout",
    "frontend/src/components/offers",
    "frontend/src/components/status",
    "frontend/src/components/ui",
    "frontend/src/hooks",
    "frontend/src/i18n",
    "frontend/src/lib",
    "frontend/src/pages",
    "frontend/src/types",
    # ---------------- Backend ----------------
    "backend/app/api/routes",
    "backend/app/core",
    "backend/app/db",
    "backend/app/models",
    "backend/app/policies",
    "backend/app/services",
    "backend/app/utils",
    "backend/tests",
    # ---------------- AI ----------------
    "ai/agent/tools",
    "ai/evaluation/datasets",
    "ai/evaluation/results",
    "ai/extraction",
    "ai/guardrails",
    "ai/llm",
    "ai/prompts",
    "ai/rag/ingestion",
    "ai/rag/retrieval",
    # ---------------- Database ----------------
    "supabase/migrations",
    "supabase/seed",
    # ---------------- Data (policy documents) ----------------
    "data/common",
    "data/lender_a",
    "data/lender_b",
    "data/lender_c",
    "data/rbi",
    "data/samples",
    # ---------------- Docs, scripts, CI ----------------
    "docs/api",
    "docs/architecture",
    "docs/screenshots",
    "scripts",
    ".github/workflows",
]

# Files to create at the project root.
GITIGNORE = """\
# Secrets
.env
.env.*
!.env.example

# Python
__pycache__/
*.pyc
.venv/
venv/
.pytest_cache/

# Node
node_modules/
dist/
build/

# OS / IDE
.DS_Store
Thumbs.db
.vscode/
.idea/
"""


def create_structure(base_dir: Path) -> None:
    root = base_dir / PROJECT_NAME
    root.mkdir(parents=True, exist_ok=True)

    for folder in FOLDERS:
        path = root / folder
        path.mkdir(parents=True, exist_ok=True)
        # .gitkeep lets git track otherwise-empty folders
        (path / ".gitkeep").touch(exist_ok=True)

    gitignore = root / ".gitignore"
    if not gitignore.exists():
        gitignore.write_text(GITIGNORE, encoding="utf-8")

    print(f"Created {len(FOLDERS)} folders in: {root.resolve()}")


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.cwd()
    create_structure(target)