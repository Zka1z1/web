import React, { useState, useEffect } from 'react'
import './App.css'

const API = "http://127.0.0.1:8000/cards";

function App() {
  const [cards, setCards] = useState([]);
  const [category, setCategory] = useState(null); 
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "", id: null });
  const [dragOverBox, setDragOverBox] = useState(null);
  const [todayFlipCount, setTodayFlipCount] = useState(0);
  const [flippedCardsToday, setFlippedCardsToday] = useState(new Set());

  useEffect(() => { load(); }, []);

  const load = () => {
    fetch(API).then(r => r.json()).then(data => {
      setCards(data);
      setIndex(0);
      setFlipped(false);
    });
  };

  const filtered = category === null ? cards : cards.filter(c => c.category === category);
  const current = filtered[index];

  const next = () => {
    if (index < filtered.length - 1) {
      setIndex(index + 1);
      setFlipped(false);
    } else if (index === filtered.length - 1 && filtered.length > 0) {
      setIndex(0);
      setFlipped(false);
    }
  };

  const prev = () => {
    if (index > 0) {
      setIndex(index - 1);
      setFlipped(false);
    } else if (index === 0 && filtered.length > 0) {
      setIndex(filtered.length - 1);
      setFlipped(false);
    }
  };

  const flip = () => {
    if (!flipped && current) {
      if (!flippedCardsToday.has(current.id)) {
        setFlippedCardsToday(prev => new Set([...prev, current.id]));
        setTodayFlipCount(prev => prev + 1);
      }
      setFlipped(true);
      
      setTimeout(() => {
        if (filtered.length > 1) {
          next();
        }
      }, 1500);
    } else if (!flipped) {
      setFlipped(true);
    }
  };


const updateCategory = async (cardId, newCategory) => {
  try {
    const response = await fetch(`${API}/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: newCategory })
    });
    
    if (response.ok) {
      load();
    } else {
      const errorText = await response.text();
      console.error('Update failed:', response.status, errorText);
    }
  } catch (err) {
    console.error('Network error:', err);
  }
};


  async function deleteCard() {
    if (!current) return;
    if (!window.confirm('Remove this card from your Memory Palace?')) return;

    await fetch(`${API}/${current.id}`, { method: "DELETE" });
    load();
  }

  const openAdd = () => {
    setForm({ question: "", answer: "", id: null });
    setShowModal(true);
  };

  const openEdit = () => {
    setForm({ question: current.question, answer: current.answer, id: current.id });
    setShowModal(true);
  };

const save = async () => {
  if (!form.question.trim()) {
    alert('Hi! What do you want to remember today?');
    return;
  }
  if (!form.answer.trim()) {
    alert('Oops! You need an answer to complete this card.');
    return;
  }

  try {
    if (form.id) {
      const response = await fetch(`${API}/${form.id}`, {
        method: "PATCH", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: form.question,
          answer: form.answer
        })
      });
      
      if (response.ok) {
        setShowModal(false);
        load();
      } else {
        console.error('Update failed:', response.status);
      }
    } else {

      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: form.question, 
          answer: form.answer, 
          category: "new" 
        })
      });
      
      if (response.ok) {
        setShowModal(false);
        load();
      }
    }
  } catch (err) {
    console.error('Failed to save card:', err);
  }
};

  const getCategoryCount = (cat) => {
    return cards.filter(c => c.category === cat).length;
  };

  const handleDragStart = (e, cardId) => {
    if (!flipped) {
      e.dataTransfer.setData('cardId', cardId);
      e.dataTransfer.effectAllowed = 'move';
    } else {
      e.preventDefault();
    }
  };

  const handleDragOver = (e, boxType) => {
    e.preventDefault();
    setDragOverBox(boxType);
  };

  const handleDragLeave = () => {
    setDragOverBox(null);
  };

  const handleDrop = async (e, targetBox) => {
    e.preventDefault();
    setDragOverBox(null);
    const cardId = parseInt(e.dataTransfer.getData('cardId'));
    await updateCategory(cardId, targetBox);
  };

  const toggleCategory = (cat) => {
    if (category === cat) {
      setCategory(null); 
    } else {
      setCategory(cat);
    }
    setIndex(0);
    setFlipped(false);
  };

  const getSelectedColor = () => {
    if (category === null) return "#e0e0e0";
    switch(category) {
      case "new": return "#ffeaa7";
      case "favorite": return "#81ecec";
      case "wrong": return "#fab1a0";
      default: return "#ffeaa7";
    }
  };

  const isCardVisible = (card) => {
    return category === null || card.category === category;
  };

  return (
    <div className="app">
      {/* HEADER */}
      <div className="header">
        <div className="header-left">
          <h1>Memory Palace</h1>
          <div className="stats-header">
            <span>🎯 Today completed: {todayFlipCount}</span>
            <span> Total: {cards.length}</span>
          </div>
        </div>
        <button className="add-btn" onClick={openAdd}>+ Add Card</button>
      </div>

      {/* MAIN */}
      <div className="main">
        {/* LEFT */}
        <div className="left">
          <div className="boxes">
            {["new", "favorite", "wrong"].map(c => (
              <div
                key={c}
                className={`box ${c} ${category === c ? "active" : ""}`}
                onClick={() => toggleCategory(c)}
                onDragOver={(e) => handleDragOver(e, c)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, c)}
                style={dragOverBox === c ? { transform: 'scale(1.02)', filter: 'brightness(1.05)' } : {}}
              >
                <span className="box-name">{c}</span>
                <span className="box-count">{getCategoryCount(c)}</span>
              </div>
            ))}
          </div>

          <div className="list">
            {cards.map((card, i) => (
              isCardVisible(card) && (
                <div
                  key={card.id}
                  className={`list-item ${current?.id === card.id ? "selected" : ""}`}
                  onClick={() => { 
                    const newIndex = filtered.findIndex(c => c.id === card.id);
                    setIndex(newIndex);
                    setFlipped(false);
                  }}
                  style={current?.id === card.id ? { backgroundColor: getSelectedColor(), borderLeftColor: getSelectedColor() } : {}}
                  draggable
                  onDragStart={(e) => handleDragStart(e, card.id)}
                >
                  <span className="list-number">{i + 1}.</span>
                  <span className="list-question">{card.question}</span>
                </div>
              )
            ))}
            {cards.length === 0 && (
              <div className="empty-list">No cards yet. Create your first memory!</div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="right">
          {current ? (
            <>
              <div className="hint">
                {!flipped ? "Click me to check the answer! 💡" : "Woohoo! Moving to next card..."}
              </div>

              <div className="card-wrapper">
                <button className="nav-arrow left-arrow" onClick={prev}>◀</button>

                <div 
                  className={`card ${flipped ? "flipped" : ""}`} 
                  onClick={flip}
                  draggable={!flipped}
                  onDragStart={(e) => handleDragStart(e, current.id)}
                >
                  <div className="card-inner">
                    <div className="card-front">
                      <div className="card-content">{current.question}</div>
                    </div>
                    <div className="card-back">
                      <div className="card-content">{current.answer}</div>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button className="card-edit" onClick={(e) => { e.stopPropagation(); openEdit(); }}>✏️</button>
                    <button className="card-delete" onClick={(e) => { e.stopPropagation(); deleteCard(); }}>🗑️</button>
                  </div>
                </div>

                <button className="nav-arrow right-arrow" onClick={next}>▶</button>
              </div>

              <div className="drag-hint">
                {!flipped ? "Tip: You can also drag this card to a category on the left!" : "You're on fire! Keep going! 🚀"}
              </div>
            </>
          ) : (
            <div className="no-card">
              <p>✨ Select a card from the left to start your journey ✨</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Create a New Memory</h3>
            <input
              placeholder="Enter your question here..."
              value={form.question}
              onChange={e => setForm({ ...form, question: e.target.value })}
            />
            <textarea
              placeholder="The answer is..."
              value={form.answer}
              onChange={e => setForm({ ...form, answer: e.target.value })}
              rows="4"
            />
            <div className="modal-buttons">
              <button className="save-btn" onClick={save}>Save to Palace</button>
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;