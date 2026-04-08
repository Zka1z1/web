Flashcard Learning App: Memory Palace

** Introduction **
Memory Palace is a efficient flashcard learning app. 
Traditional memorisation methods are often disorganised and lack interactivity. 
It is difficult for users to keep track of which content they have mastered, which they frequently get wrong, and which require extra attention.
Memory Palace helps users quickly browse and revise their flashcards through three smart categories: New, Wrong and Favourites. At the same time, it creates an engaging learning experience through interactions such as clicking and dragging.

** Technical Stack **
Frontend: React
Styling: Custom CSS
Routing: Single-page application 
Backend: FastAPI
Database: SQLModel
API Communication: MySQL
Deployment: Local development

** Features **
1- Categorization system: Cards organised into "New", "Favorite", and "Wrong" boxes
2- Dynamic filtering: Click category boxes to filter
3- Interactive Flip Cards: Click to reveal answers with smooth 3D flip animation
4- Automatic Card Progression: The card will automatically turn to the next one when flipped
5- CRUD Operations: Create, Read, Update, Delete flashcards
6- Inline Card Editing: Edit question/answer directly from card interface
7- Persistent Storage: All cards saved to MySQL database
8- Real-time card count display: Counter showing how many cards flipped today

** Folder Structure **

│
├── backend/
│ ├── app.py
│ ├── appcrud.py
│ ├── flashcards.db
│
├── frontend/
│ ├── src/
│ │ ├── App.jsx
│ │ ├── App.css
│ │ ├── main.jsx
│ │ └── index.css
│ ├── index.html
│ ├── package.json
│ └── vite.config.js
│
└── README.md

** Challenges Overcome **

A key challenge was designing a smooth and intuitive user experience, such as automatic switching after flipping a card and updating the count after categorising cards. Therefore, I carried out extensive front-end and back-end debugging to ensure consistent interface behaviour. 
Also, implementing the edit feature, submitting changes caused no visible update to the card content. This was resolved by properly structuring the PATCH request payload and refreshing the local state after a successful API response.
Similarly, submitting blank cards triggered no response, so signifiers were added.
Another important point was maintaining synchronisation between the frontend state and the backend data after each CRUD operation.
Through continuous improvement, this app aims to provide users a more engaging learning experience.
