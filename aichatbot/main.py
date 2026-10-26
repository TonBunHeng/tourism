"""Compatibility entrypoint for deployment and local project-root startup.

This module allows the app to be launched with either:
- uvicorn backend.main:app
- cd backend && python run.py
"""

import os
import sys

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.main import app

__all__ = ["app"]
