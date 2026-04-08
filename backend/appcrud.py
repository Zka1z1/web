import sqlmodel
from typing import Optional, List
from datetime import datetime
from enum import Enum

# ============ Database ============
DATABASE_URL = "mysql+pymysql://root:@localhost/flashcard_db"
engine = sqlmodel.create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    sqlmodel.SQLModel.metadata.create_all(engine)

def get_session():
    with sqlmodel.Session(engine) as session:
        yield session

# ============ Models ============
class Category(str, Enum):
    NEW = "new"
    WRONG = "wrong"
    FAVORITE = "favorite"

class Flashcard(sqlmodel.SQLModel, table=True):
    __tablename__ = "flashcards"
    id: Optional[int] = sqlmodel.Field(default=None, primary_key=True)
    question: str
    answer: str
    category: Category = sqlmodel.Field(default=Category.NEW)
    created_at: datetime = sqlmodel.Field(default_factory=datetime.now)
    updated_at: datetime = sqlmodel.Field(default_factory=datetime.now)

class FlashcardCreate(sqlmodel.SQLModel):
    question: str
    answer: str
    category: Category = Category.NEW

class FlashcardUpdate(sqlmodel.SQLModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    category: Optional[Category] = None


class FlashcardCRUD:
    def __init__(self, session: sqlmodel.Session):
        self.session = session
    
    def get_all(self) -> List[Flashcard]:
        return self.session.exec(sqlmodel.select(Flashcard).order_by(Flashcard.id.desc())).all()
    
    def get_by_id(self, card_id: int) -> Optional[Flashcard]:
        return self.session.exec(sqlmodel.select(Flashcard).where(Flashcard.id == card_id)).first()
    
    def create(self, card: FlashcardCreate) -> Flashcard:
        db_card = Flashcard(question=card.question, answer=card.answer, category=card.category)
        self.session.add(db_card)
        self.session.commit()
        self.session.refresh(db_card)
        return db_card

    def update(self, card_id: int, card_update: FlashcardUpdate) -> Optional[Flashcard]:
        db_card = self.get_by_id(card_id)
        if not db_card:
            return None
        
        update_data = card_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_card, key, value)
        
        db_card.updated_at = datetime.now()
        self.session.commit()
        self.session.refresh(db_card)
        return db_card
    
    def delete(self, card_id: int) -> bool:
        db_card = self.get_by_id(card_id)
        if not db_card:
            return False
        self.session.delete(db_card)
        self.session.commit()
        return True
    
    def get_total_count(self) -> int:
        return len(self.session.exec(sqlmodel.select(Flashcard)).all())