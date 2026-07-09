from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api import (
    auth_controller,
    school_controller,
    command_controller,
    status_controller,
    kill_controller,
    config_controller
)
import app.models

app = FastAPI(
    title="EasyReach API",
    description="ISF MediaSync - On-Premise Media Server Management",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create all tables
Base.metadata.create_all(bind=engine)

# Routes
app.include_router(auth_controller.router, prefix="/api/auth", tags=["Auth"])
app.include_router(school_controller.router, prefix="/api/schools", tags=["Schools"])
app.include_router(command_controller.router, prefix="/api/commands", tags=["Commands"])
app.include_router(status_controller.router, prefix="/api/status", tags=["Status"])
app.include_router(kill_controller.router, prefix="/api/kill", tags=["Kill Switch"])
app.include_router(config_controller.router, prefix="/api/config", tags=["Config Generator"])

@app.get("/")
def root():
    return {"message": "EasyReach API Running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}