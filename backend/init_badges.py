# backend/init_badges.py
from database import SessionLocal, engine
from models import Base, Badge
from sqlalchemy.orm import Session

def init_badges():
    db = SessionLocal()
    try:
        # First check if badges are already initialized
        existing_badges = db.query(Badge).all()
        if existing_badges:
            print(f"Found {len(existing_badges)} existing badges. Skipping initialization.")
            return

        # Create badges
        badges = [
            Badge(
                name="Brainstormer",
                description="Awarded for your bright ideas and first sparks of insight!",
                image_path="/assets/brainstormer.png",
                kudos_cost=1
            ),
            Badge(
                name="Curious Cat",
                description="Paws-itively inquisitive! You’re always chasing new questions.",
                image_path="/assets/curiouscat.png",
                kudos_cost=5
            ),
            Badge(
                name="Rocket Learner",
                description="Blasting off into learning—you're on a fast track to success!",
                image_path="/assets/rocketlearner.png",
                kudos_cost=15
            ),
            Badge(
                name="Knowledge Seeker",
                description="For those who never stop asking, exploring, and understanding.",
                image_path="/assets/knowledgeseeker.png",
                kudos_cost=18
            ),
            Badge(
                name="Quiz Master",
                description=" You conquered quizzes like a champ—swift, sharp, and unstoppable!",
                image_path="/assets/quizmaster.png",
                kudos_cost=22
            ),
            Badge(
                name="Puzzle Pro",
                description="Every challenge is a piece of the puzzle—and you’re fitting it all together.",
                image_path="/assets/puzzlepro.png",
                kudos_cost=25
            ),
            Badge(
                name="Growth Champ",
                description="Your knowledge is blooming—proof that effort makes things grow!",
                image_path="/assets/growthchamp.png",
                kudos_cost=30
            ),
            Badge(
                name="Academic Royalty",
                description="The highest achievement for dedicated learners",
                image_path="/assets/academicroyalty.png",
                kudos_cost=50
            ),
        ]
        
        for badge in badges:
            db.add(badge)
        
        db.commit()
        print(f"Successfully initialized {len(badges)} badges.")
    
    except Exception as e:
        print(f"Error initializing badges: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    init_badges()