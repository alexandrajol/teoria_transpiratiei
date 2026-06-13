# Editor Features Implementation

## Overview
Implemented editor-specific dashboard with full article management capabilities.

## Backend Changes

### Database Schema
- Added `status` column to articles table: `'pending' | 'published'`
- Updated [backend/database/init.js](backend/database/init.js:42-57)
- Seed script now creates 10 published and 5 pending articles

### API Endpoints (Protected)

#### Editor/Admin Only Routes:
- `GET /api/articles/editor/all` - Get all articles (including pending)
- `POST /api/articles` - Create new article (status: 'pending' by default)
- `PUT /api/articles/:id` - Update article
- `PATCH /api/articles/:id/status` - Publish/unpublish article
- `DELETE /api/articles/:id` - Delete article

#### Public Routes (Changed):
- `GET /api/articles` - Only returns published articles
- `GET /api/articles/:id` - Only returns published articles

**File:** [backend/routes/articles.js](backend/routes/articles.js)

## Frontend Changes

### New Components

#### EditorDashboard Component
**File:** [frontend/src/components/EditorDashboard.jsx](frontend/src/components/EditorDashboard.jsx)

Features:
- Grid view of all articles with status badges
- Filter tabs: All, Pending, Published
- Actions per article:
  - **Publish** - Makes pending article visible to public
  - **Retrage** (Unpublish) - Changes published article to pending
  - **Editează** - Opens edit form
  - **Șterge** - Deletes article (with confirmation)
- **+ Articol Nou** button for creating articles

**Styling:** [frontend/src/components/EditorDashboard.css](frontend/src/components/EditorDashboard.css)

#### ArticleForm Component
**File:** [frontend/src/components/ArticleForm.jsx](frontend/src/components/ArticleForm.jsx)

Features:
- Modal overlay form
- Fields:
  - Title (required)
  - Author (required, defaults to username)
  - Category (dropdown: Știri, Sport, Cultură, Știință, Evenimente)
  - Image URL (with preview)
  - Content (multiline textarea)
- Works for both creating new articles and editing existing ones

**Styling:** [frontend/src/components/ArticleForm.css](frontend/src/components/ArticleForm.css)

### App.jsx Updates
**File:** [frontend/src/App.jsx](frontend/src/App.jsx:87-90)

- Added routing logic: editors and admins see EditorDashboard
- Other users (journalist, viewer) see the original article reading interface

## User Roles & Permissions

| Role       | Can Create | Can Edit | Can Publish | Can Delete | Public View |
|------------|-----------|----------|-------------|-----------|-------------|
| Admin      | ✓         | ✓        | ✓           | ✓         | Only published |
| Editor     | ✓         | ✓        | ✓           | ✓         | Only published |
| Journalist | ✗         | ✗        | ✗           | ✗         | Only published |
| Viewer     | ✗         | ✗        | ✗           | ✗         | Only published |

## Testing

### Test Credentials
- **Editor:** `editor@teoriatranspiratiei.ro` / `admin123`
- **Admin:** `admin@teoriatranspiratiei.ro` / `admin123`
- **Viewer:** `viewer@teoriatranspiratiei.ro` / `admin123`

### Test Flow
1. Login as editor
2. See EditorDashboard with article grid
3. Use filter tabs to view pending/published articles
4. Create new article → Status: pending
5. Publish a pending article → Visible to public
6. Edit an existing article
7. Delete an article (with confirmation)
8. Logout and login as viewer → See only published articles

## Current Database Status
- Total articles: 15
- Published: 10 (visible to all users)
- Pending: 5 (only visible to editors/admins)
