# backend/models.py

from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, Integer, String, Text, ForeignKey

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)   # We treat name as "username"
    email = Column(String, unique=True, index=True)  # Not hashed here, just example
    total_points = Column(Integer, default=0)

    # Relationship
    study_plans = relationship("StudyPlan", back_populates="owner")

class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content_md = Column(Text)        # The raw markdown from GPT
    owner_id = Column(Integer, ForeignKey("users.id"))

    # Relationship
    owner = relationship("User", back_populates="study_plans")
