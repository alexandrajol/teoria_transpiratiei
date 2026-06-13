# Journalist Features Implementation

## Overview
Journalists can view and edit articles assigned to them by editors. They can edit content, images, author, and category but CANNOT edit title or publish articles.

## Backend Implementation

### New Route File
**[backend/routes/journalist-articles.js](backend/routes/journalist-articles.js)**

Protected routes (require journalist role):
- `GET /api/journalist/my-articles` - Get all articles assigned to logged-in journalist
- `GET /api/journalist/my-articles/:id` - Get single assigned article
- `PUT /api/journalist/my-articles/:id` - Update article content

### Route Registration
**[backend/server.js](backend/server.js:22)** - Added journalist routes

### Authorization Logic
Journalists can only access articles where:
- `main_journalist_id = user.userId` OR
- `secondary_journalist_id = user.userId`

### Fields Journalists Can Edit
- ✓ `content` - Article text/paragraphs
- ✓ `author` - Author name
- ✓ `category` - Article category
- ✓ `image` - Image URL

### Fields Journalists CANNOT Edit
- ✗ `title` - Only editor can change
- ✗ `status` - Only editor can publish/unpublish
- ✗ `main_journalist_id` - Only editor can reassign
- ✗ `secondary_journalist_id` - Only editor can reassign

## Frontend Implementation

### JournalistDashboard Component
**[frontend/src/components/JournalistDashboard.jsx](frontend/src/components/JournalistDashboard.jsx)**

Features:
- **Left Sidebar:** List of assigned articles
  - Shows article title (or "Fără titlu")
  - Badge indicating if journalist is "Principal" or "Secundar"
  - Status dot (green=published, orange=pending)
  - Date assigned
  
- **Main Panel:** Article preview
  - Article title, status, category
  - Current image (if any)
  - Author, journalists assigned, date
  - Full content preview
  - **"Editează Conținut"** button

**Styling:** [frontend/src/components/JournalistDashboard.css](frontend/src/components/JournalistDashboard.css)

### ArticleEditor Component
**[frontend/src/components/ArticleEditor.jsx](frontend/src/components/ArticleEditor.jsx)**

Two-mode editor:
1. **Edit Mode** (default)
   - Large textarea for article content
   - Sidebar with:
     - Read-only title display
     - Author input
     - Category dropdown
     - Image URL input with preview
     - Status display (read-only)
   
2. **Preview Mode**
   - Shows how article will look when published
   - Full article layout with image
   - Toggle back to edit mode

Features:
- **Auto-save functionality** - "💾 Salvează" button
- **Toggle preview** - "👁️ Previzualizare" / "✏️ Editare"
- **Paragraph support** - Double-newline creates paragraphs
- **Image preview** - Shows image before saving
- **Read-only title** - Shows title but can't edit
- **Status indicator** - Shows if published or pending

**Styling:** [frontend/src/components/ArticleEditor.css](frontend/src/components/ArticleEditor.css)

### App.jsx Updates
**[frontend/src/App.jsx](frontend/src/App.jsx:90-92)**

Added routing logic:
```javascript
if (user.role === 'journalist') {
  return <JournalistDashboard user={user} onLogout={handleLogout} />
}
```

## User Workflow

### Journalist Workflow
1. **Login** as journalist
2. **View assigned articles** in sidebar
3. **Select article** to preview
4. **Click "Editează Conținut"**
5. **Edit:**
   - Write/edit content in large textarea
   - Set author name
   - Choose category
   - Add image URL
6. **Toggle preview** to see how it looks
7. **Click "Salvează"** to save changes
8. **Return** to dashboard

### Editor Assigns Article to Journalist
1. Editor creates article
2. Editor sets title
3. Editor assigns main journalist (required)
4. Editor optionally assigns secondary journalist
5. Journalist receives article in their dashboard
6. Journalist writes content
7. Editor reviews and publishes

## Database Queries

### Get Journalist's Articles
```sql
SELECT
  a.*,
  u1.username as main_journalist_username,
  u2.username as secondary_journalist_username,
  creator.username as created_by_username
FROM articles a
LEFT JOIN users u1 ON a.main_journalist_id = u1.id
LEFT JOIN users u2 ON a.secondary_journalist_id = u2.id
LEFT JOIN users creator ON a.created_by = creator.id
WHERE a.main_journalist_id = ? OR a.secondary_journalist_id = ?
ORDER BY a.date DESC
```

### Update Article (with authorization check)
```sql
-- First verify assignment
SELECT id FROM articles
WHERE id = ? AND (main_journalist_id = ? OR secondary_journalist_id = ?)

-- Then update if authorized
UPDATE articles
SET content = ?, author = ?, category = ?, image = ?
WHERE id = ?
```

## Test Accounts

### Test Journalists
Created via `npm run seed-journalists`:
- **ion.popescu** / journalist123
- **maria.ionescu** / journalist123
- **alex.georgescu** / journalist123
- **elena.dumitrescu** / journalist123
- **mihai.popa** / journalist123

### Test Editor
- **editor@teoriatranspiratiei.ro** / admin123

## Testing Flow

1. **Login as editor** (`editor@teoriatranspiratiei.ro`)
2. **Create new article** (+ Articol Nou)
3. **Edit article:**
   - Add title: "Test Article"
   - Assign main journalist: `ion.popescu`
   - Save
4. **Logout**
5. **Login as journalist** (`ion.popescu` / `journalist123`)
6. **See "Test Article"** in sidebar
7. **Click on article** to preview
8. **Click "Editează Conținut"**
9. **Write content:**
   ```
   This is the first paragraph of the article.

   This is the second paragraph. Double newlines create new paragraphs.
   ```
10. **Set author:** "Ion Popescu"
11. **Choose category:** Știri
12. **Add image:** `https://picsum.photos/800/400`
13. **Toggle preview** to see result
14. **Click "Salvează"**
15. **Logout and login as editor** to publish

## Key Features

### Journalist Dashboard
- ✓ Shows only assigned articles
- ✓ Distinguishes between main/secondary role
- ✓ Shows article status
- ✓ Live preview before editing
- ✓ No articles message if none assigned

### Article Editor
- ✓ Large, comfortable textarea for writing
- ✓ Real-time image preview
- ✓ Toggle between edit and preview modes
- ✓ Read-only fields clearly marked
- ✓ Status indicator
- ✓ Clean, distraction-free interface
- ✓ Georgia serif font for better readability

## Security
- ✓ Authorization check on every update
- ✓ Can only edit assigned articles
- ✓ Cannot modify title or status
- ✓ Cannot access other journalists' articles
- ✓ JWT token required for all operations
