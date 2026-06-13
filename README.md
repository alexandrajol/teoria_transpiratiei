# Teoria Transpirației - Ziarul Școlar

O aplicație web pentru ziarul școlar cu arhitectură client-server.

## Structura Proiectului

- **backend/** - Server Node.js cu Express
- **frontend/** - Client React cu Vite

## Pornire Aplicație

### Backend (Port 3000)

```bash
cd backend
npm install
npm start
```

Backend-ul va rula pe `http://localhost:3000`

### Frontend (Port 5173)

```bash
cd frontend
npm install
npm run dev
```

Frontend-ul va rula pe `http://localhost:5173`

## API Endpoints

- `GET /api/articles` - Obține toate articolele
- `GET /api/articles/:id` - Obține un articol specific

## Tehnologii

### Backend
- Node.js
- Express
- CORS
- Faker.js (pentru date mock)

### Frontend
- React
- Vite
- CSS3

## Culori

- **#CB769E** - Roz (accent)
- **#F5F5F4** - Alb-crem (background)
- **#011F28** - Albastru închis (text și sidebar)
