# Articles Database Setup

## What Changed

Articles have been migrated from in-memory faker data to SQLite database storage.

## Files Modified

- [backend/server.js](backend/server.js) - Removed in-memory articles import, added articles route
- [backend/package.json](backend/package.json) - Added `seed` script

## Files Created

- [backend/database/seed-articles.js](backend/database/seed-articles.js) - Script to populate articles table
- [backend/routes/articles.js](backend/routes/articles.js) - Database-backed articles routes

## Database Schema

The articles table includes:
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `title` (TEXT NOT NULL)
- `content` (TEXT NOT NULL)
- `author` (TEXT NOT NULL)
- `category` (TEXT)
- `image` (TEXT)
- `date` (DATETIME DEFAULT CURRENT_TIMESTAMP)
- `created_by` (INTEGER, foreign key to users)

## Usage

### Seed/Re-seed Articles
```bash
cd backend
npm run seed
```

### API Endpoints
- `GET /api/articles` - Get all articles (sorted by date desc)
- `GET /api/articles/:id` - Get single article by ID

## Current Status

✓ 15 articles seeded to database
✓ Server serving articles from database
✓ Both endpoints tested and working
