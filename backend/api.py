# backend/api.py

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .database import SessionLocal, engine
from .models import Base, User, StudyPlan
from .openai_utils import (
    generate_study_plan_text, 
    generate_step_quiz, 
    generate_fallback_material
)

Base.metadata.create_all(bind=engine)
app = FastAPI(title="AI Tutor Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UserCreate(BaseModel):
    name: str
    email: str

class PlanCreate(BaseModel):
    user_id: int
    grade: int
    subject: str
    goal: str

class QuizRequest(BaseModel):
    step_content: str

class ScoreRequest(BaseModel):
    user_id: int
    attempt_number: int

@app.get("/")
def root():
    return {"message": "Welcome to AI Tutor API"}

# ----------------------------
# 1) User Endpoints
# ----------------------------
@app.post("/users/", response_model=dict)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.name == payload.name).first()
    if existing:
        return {
            "id": existing.id,
            "name": existing.name,
            "email": existing.email,
            "total_points": existing.total_points
        }
    new_user = User(name=payload.name, email=payload.email)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "total_points": new_user.total_points
    }

@app.get("/users/{user_id}", response_model=dict)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "total_points": user.total_points
    }

# ----------------------------
# 2) Study Plan Endpoints
# ----------------------------
@app.post("/study_plans/", response_model=dict)
def create_study_plan(plan: PlanCreate, db: Session = Depends(get_db)):
    user = db.query(User).get(plan.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # If GPT returns a link that is known to be broken, we will use fallback logic within openai_utils
    plan_md = generate_study_plan_text(user.name, plan.grade, plan.subject, plan.goal)
    
    new_plan = StudyPlan(
        title=f"Plan for {plan.subject}",
        content_md=plan_md,
        owner_id=plan.user_id
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    return {
        "id": new_plan.id,
        "title": new_plan.title,
        "content_md": new_plan.content_md
    }

@app.get("/study_plans/{user_id}", response_model=list)
def list_study_plans(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    plans = db.query(StudyPlan).filter(StudyPlan.owner_id == user_id).all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "content_md": p.content_md
        }
        for p in plans
    ]

@app.get("/study_plans/{user_id}/{plan_id}", response_model=dict)
def get_study_plan(user_id: int, plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(StudyPlan).filter(
        StudyPlan.owner_id == user_id,
        StudyPlan.id == plan_id
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    return {
        "id": plan.id,
        "title": plan.title,
        "content_md": plan.content_md
    }

# New Endpoint: DELETE plan
@app.delete("/study_plans/{plan_id}", response_model=dict)
def delete_study_plan(plan_id: int, db: Session = Depends(get_db)):
    """
    Delete a study plan by its ID.
    """
    plan = db.query(StudyPlan).get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Study plan not found")

    db.delete(plan)
    db.commit()

    return {"detail": f"Study plan {plan_id} deleted"}

# ----------------------------
# 3) Quiz Generation & Scoring
# ----------------------------
@app.post("/generate_quiz", response_model=dict)
def generate_quiz(payload: QuizRequest):
    quiz_data = generate_step_quiz(payload.step_content)
    # If the link was broken or not found, we might use fallback data from openai_utils.
    return quiz_data

@app.post("/score_quiz", response_model=dict)
def score_quiz(payload: ScoreRequest, db: Session = Depends(get_db)):
    user = db.query(User).get(payload.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Attempt => points mapping
    if payload.attempt_number == 1:
        points_awarded = 3
    elif payload.attempt_number == 2:
        points_awarded = 2
    elif payload.attempt_number == 3:
        points_awarded = 1
    else:
        points_awarded = 0

    user.total_points += points_awarded
    db.commit()
    db.refresh(user)
    return {
        "points_awarded": points_awarded,
        "new_total_points": user.total_points
    }
