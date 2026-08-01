Frontend admin client (static)

Open frontend/index.html in a browser on the same host/port as the backend (or serve with a static server).
It expects the backend to be available at the same origin (http://localhost:3000). To test quickly:

cd frontend
python -m http.server 8000
# then open http://localhost:8000 and the page will call http://localhost:3000/users

This simple client is a starting point for a React or admin UI.
