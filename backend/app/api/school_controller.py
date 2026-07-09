from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import date
import secrets
from app.core.database import get_db
from app.models.school_model import School
from app.models.status_model import SchoolStatus
from app.models.log_model import SchoolLog
from app.api.auth_controller import get_current_user
from app.models.user_model import User

router = APIRouter()

class SchoolCreate(BaseModel):
    name: str
    code: str
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    erp_domain: Optional[str] = None
    storage_domain: Optional[str] = None
    public_ip: Optional[str] = None
    lan_ip: Optional[str] = None
    storage_path: Optional[str] = "D:\\MediaStorage"
    nginx_port: Optional[int] = 9006
    https_port: Optional[int] = 9000
    ssl_thumbprint: Optional[str] = None
    sync_interval_min: Optional[int] = 15
    db_name: Optional[str] = None
    contract_end_date: Optional[date] = None

class SchoolUpdate(SchoolCreate):
    pass

@router.get("/")
def get_all_schools(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    schools = db.query(School).all()
    result = []
    for school in schools:
        status = db.query(SchoolStatus).filter(SchoolStatus.school_id == school.id).first()
        result.append({
            "id": school.id,
            "name": school.name,
            "code": school.code,
            "public_ip": school.public_ip,
            "storage_domain": school.storage_domain,
            "status": school.status,
            "kill_level": school.kill_level,
            "agent_online": status.agent_online if status else 0,
            "nginx_running": status.nginx_running if status else 0,
            "storage_used_gb": status.storage_used_gb if status else 0,
            "file_count": status.file_count if status else 0,
            "last_sync_at": status.last_sync_at if status else None,
            "last_seen_at": status.last_seen_at if status else None,
        })
    return result

@router.post("/")
def create_school(school_data: SchoolCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
     existing = db.query(School).filter(School.code == school_data.code).first()