# Teoria Transpiratiei - University Newspaper Web Application

For those who did not already guess from the title, this is the exam at **MPP/Systems Design and Implementation** given by **Gabi Mircea** (2026). The exam lasted for just under 10 hours, and this is a brief breakdown of the technical parts of it.

A full-stack web application for managing a university newspaper with role-based access control, article management, comments, and sentiment analysis.

## Features

- **Role-Based Access Control**: Four user roles with different permissions
  - *Admin*: 
    - Statistics Dashboard: Analytics and charts for article engagement
  - *Editor*: 
    - Add new articles
    - Publish finished articles
    - Arrange the paragraphs written by the journalists
    - Add and resolve comments to the unfinished articles
    - Assign journalists to each article 
  - *Journalist*: 
    - Edit the articles assigned to them
  - *Viewer (Authenticated)*: 
    - View published articles
    - Add comments
    - Like or dislike an article
  - *User (Unauthenticated)*:
    - View published articles
- **Sentiment Analysis**: Used a local LLM (Qwen2.5:0.5b via Ollama) to categorize all of the comments into a category based on the emotion, then color them accordingly:
  - happy: green
  - angry: red
  - sad: blue
  - neutral: gray
  - intrigued: orange
- **Authentication**: JWT-based authentication with secure token handling
- **HTTPS Support**: Secure communication with self-signed certificates
- **Viewer Pattern Recommendations**: a from-scratch recommendation systems algorithm that suggests three unread articles to each viewer based on their activity (likes, dislikes, comments) - ***not implemented***


## Tech Stack

**Frontend:**
- React 19
- Vite
- Recharts for data visualization

**Backend:**
- Node.js with Express 5
- SQLite3 database
- JWT authentication
- Ollama for sentiment analysis
- bcryptjs for password hashing

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Ollama (optional, for sentiment analysis)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/alexandrajol/teoria_transpiratiei.git
cd teoria_transpiratiei
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Set Up Environment Variables

Create a `.env` file in the `backend` directory:

```env
JWT_SECRET=your-secret-key-here
PORT=5000
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

### 5. Initialize Database

The database will be created automatically on first run. To seed with sample data:

```bash
cd backend
npm run seed
npm run seed-journalists
```

## Running the Application

### Development Mode

**Start the backend server:**

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

**Start the frontend development server:**

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

### Production Build

**Build the frontend:**

```bash
cd frontend
npm run build
```

**Preview the production build:**

```bash
npm run preview
```

## Default Users

The database automatically creates these default accounts on first run:

- **Admin**: username: `admin` / password: `admin123`
- **Editor**: username: `editor` / password: `admin123`
- **Journalist**: username: `journalist` / password: `admin123`
- **Viewer**: username: `viewer` / password: `admin123`

Note: Login uses the username field, not email.

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Articles
- `GET /articles` - Get all published articles
- `GET /articles/:id` - Get single article
- `POST /journalist-articles` - Create article (journalist)
- `PUT /journalist-articles/:id` - Update article (journalist)
- `DELETE /journalist-articles/:id` - Delete article (journalist)

### Comments
- `GET /comments/:articleId` - Get comments for article
- `POST /comments` - Add comment (authenticated)
- `POST /public-comments` - Add public comment

### Reactions
- `POST /reactions` - Add like/dislike
- `GET /reactions/:articleId` - Get reactions for article

### Statistics
- `GET /statistics` - Get article statistics (admin/editor)

## Project Structure

```
teoria_transpiratiei/
├── backend/
│   ├── database/          # Database initialization and seeding
│   ├── middleware/        # Authentication middleware
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic (sentiment analysis)
│   └── server.js         # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── utils/        # API utilities
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   └── public/           # Static assets
└── README.md
```

## Database Schema

The SQLite database includes the following tables:

- **users**: User accounts with roles
- **articles**: Article content and metadata
- **paragraphs**: Article paragraphs with ordering
- **comments**: User comments with sentiment scores
- **reactions**: Like/dislike data

## Troubleshooting

**Port already in use:**
Change the port in the backend `.env` file or kill the process using the port.

**Database errors:**
Delete the `backend/database` folder and re-run the seed commands.

**CORS errors:**
Ensure the backend URL in frontend `.env` matches the running backend server.

**Sentiment analysis not working:**
Install and run Ollama locally, or disable sentiment features in the code.

## License

This project is for educational purposes as part of the MPP course.

## Contributors

- Alexandra Joldes (alexandrajol)
