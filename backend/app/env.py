"""Load .env by absolute path, imported first by database.py/auth.py.

uvicorn is launched from the repo root with --app-dir backend, so a bare
load_dotenv() would search from the process CWD and silently find nothing.
"""

from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")
