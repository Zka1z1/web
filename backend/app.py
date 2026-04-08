from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from contextlib import asynccontextmanager

from appcrud import create_db_and_tables, get_session, FlashcardCRUD, FlashcardCreate, FlashcardUpdate, Category

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_crud(session: Session = Depends(get_session)):
    return FlashcardCRUD(session)

@app.get("/cards")
async def get_cards(crud: FlashcardCRUD = Depends(get_crud)):
    return crud.get_all()

@app.post("/cards", status_code=201)
async def create_card(card: FlashcardCreate, crud: FlashcardCRUD = Depends(get_crud)):
    return crud.create(card)

@app.patch("/cards/{card_id}")
async def update_card_patch(card_id: int, card_update: FlashcardUpdate, crud: FlashcardCRUD = Depends(get_crud)):
    updated = crud.update(card_id, card_update)
    if not updated:
        raise HTTPException(404, "Card not found")
    return updated

@app.delete("/cards/{card_id}", status_code=204)
async def delete_card(card_id: int, crud: FlashcardCRUD = Depends(get_crud)):
    if not crud.delete(card_id):
        raise HTTPException(404, "Card not found")

@app.get("/stats/today")
async def get_stats(crud: FlashcardCRUD = Depends(get_crud)):
    return {"today_count": 0, "total_count": crud.get_total_count()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)