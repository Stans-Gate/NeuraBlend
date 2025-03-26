# backend/models.py

from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Table, JSON

Base = declarative_base()

# Association table for many-to-many relationship between users and badges
user_badges = Table(
    "user_badges",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("badge_id", Integer, ForeignKey("badges.id"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)   # We treat name as "username"
    email = Column(String, unique=True, index=True)  # Not hashed here, just example
    total_points = Column(Integer, default=0)
    kudos = Column(Integer, default=0)  # New field for Kudos points

    # Relationships
    study_plans = relationship("StudyPlan", back_populates="owner")
    badges = relationship("Badge", secondary=user_badges, back_populates="users")

class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content_md = Column(Text)        # The raw markdown from GPT
    owner_id = Column(Integer, ForeignKey("users.id"))

    # Relationship
    owner = relationship("User", back_populates="study_plans")

class Badge(Base):
    __tablename__ = "badges"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    image_path = Column(String)  # Path to the badge image file
    kudos_cost = Column(Integer)
    
    # Relationship
    users = relationship("User", secondary=user_badges, back_populates="badges")