# backend/api.py

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List

from .database import SessionLocal, engine
from .models import Base, User, StudyPlan, Badge, user_badges
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
    is_correct: bool

class BadgePurchaseRequest(BaseModel):
    user_id: int
    badge_id: int

class BadgeCreate(BaseModel):
    name: str
    description: str
    image_path: str
    kudos_cost: int

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
            "total_points": existing.total_points,
            "kudos": existing.kudos
        }
    new_user = User(name=payload.name, email=payload.email)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "total_points": new_user.total_points,
        "kudos": new_user.kudos
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
        "total_points": user.total_points,
        "kudos": user.kudos
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
        # Award kudos for correct first attempt
        kudos_awarded = 1 if payload.is_correct else 0
    elif payload.attempt_number == 2:
        points_awarded = 2
        kudos_awarded = 0
    elif payload.attempt_number == 3:
        points_awarded = 1
        kudos_awarded = 0
    else:
        points_awarded = 0
        kudos_awarded = 0

    # Only award points if the answer is correct
    if payload.is_correct:
        user.total_points += points_awarded
        user.kudos += kudos_awarded
        db.commit()
        db.refresh(user)
        return {
            "points_awarded": points_awarded,
            "kudos_awarded": kudos_awarded,
            "new_total_points": user.total_points,
            "new_kudos": user.kudos
        }
    else:
        return {
            "points_awarded": 0,
            "kudos_awarded": 0,
            "new_total_points": user.total_points,
            "new_kudos": user.kudos
        }

# ----------------------------
# 4) Badge Endpoints
# ----------------------------
@app.post("/badges/", response_model=dict)
def create_badge(badge: BadgeCreate, db: Session = Depends(get_db)):
    """
    Create a new badge (admin function).
    """
    existing = db.query(Badge).filter(Badge.name == badge.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Badge with this name already exists")
    
    new_badge = Badge(
        name=badge.name,
        description=badge.description,
        image_path=badge.image_path,
        kudos_cost=badge.kudos_cost
    )
    db.add(new_badge)
    db.commit()
    db.refresh(new_badge)
    
    return {
        "id": new_badge.id,
        "name": new_badge.name,
        "description": new_badge.description,
        "image_path": new_badge.image_path,
        "kudos_cost": new_badge.kudos_cost
    }

@app.get("/badges/", response_model=List[dict])
def list_badges(db: Session = Depends(get_db)):
    """
    List all available badges.
    """
    badges = db.query(Badge).all()
    return [
        {
            "id": b.id,
            "name": b.name,
            "description": b.description,
            "image_path": b.image_path,
            "kudos_cost": b.kudos_cost
        }
        for b in badges
    ]

@app.get("/users/{user_id}/badges", response_model=List[dict])
def get_user_badges(user_id: int, db: Session = Depends(get_db)):
    """
    Get all badges owned by a user.
    """
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return [
        {
            "id": badge.id,
            "name": badge.name,
            "description": badge.description,
            "image_path": badge.image_path,
            "kudos_cost": badge.kudos_cost
        }
        for badge in user.badges
    ]

@app.post("/users/{user_id}/purchase_badge", response_model=dict)
def purchase_badge(user_id: int, badge_id: int, db: Session = Depends(get_db)):
    """
    User purchases a badge with kudos.
    """
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    badge = db.query(Badge).get(badge_id)
    if not badge:
        raise HTTPException(status_code=404, detail="Badge not found")
    
    # Check if user already has this badge
    if badge in user.badges:
        raise HTTPException(status_code=400, detail="User already owns this badge")
    
    # Check if user has enough kudos
    if user.kudos < badge.kudos_cost:
        raise HTTPException(status_code=400, detail="Not enough kudos to purchase this badge")
    
    # Perform the purchase
    user.kudos -= badge.kudos_cost
    user.badges.append(badge)
    db.commit()
    db.refresh(user)
    
    return {
        "success": True,
        "new_kudos_balance": user.kudos,
        "badge": {
            "id": badge.id,
            "name": badge.name,
            "description": badge.description,
            "image_path": badge.image_path,
            "kudos_cost": badge.kudos_cost
        }
    }