# Shim entrypoint for Render when Root Directory is set to "backend"
from .app.main import app

__all__ = ["app"]
