# Paragraph Reordering Feature

## Overview
Editors can visually reorder paragraphs written by journalists using drag-and-drop or arrow buttons.

## Implementation

### Frontend Components

#### ParagraphEditor Component
**File:** [frontend/src/components/ParagraphEditor.jsx](frontend/src/components/ParagraphEditor.jsx)

Full-screen modal editor for reordering paragraphs.

**Features:**
- **Drag & Drop:** Drag paragraphs to new positions
- **Arrow Buttons:** ↑ ↓ to move paragraphs up/down
- **Visual Handle:** ⋮⋮ drag handle on each paragraph
- **Live Preview:** See changes immediately
- **Save/Cancel:** Persist changes or discard

**How it works:**
1. Splits article content by `\n\n` (double newline = paragraph separator)
2. Each paragraph becomes a draggable card
3. Reordering updates internal state
4. Clicking "Save" joins paragraphs with `\n\n` and saves to database

**Styling:** [frontend/src/components/ParagraphEditor.css](frontend/src/components/ParagraphEditor.css)

#### Integration in EditorArticleView
**File:** [frontend/src/components/EditorArticleView.jsx](frontend/src/components/EditorArticleView.jsx)

Added:
- **"⇅ Reordonează Paragrafe"** button (purple)
- Only visible when article has content
- Opens ParagraphEditor modal
- Refreshes article after save

### Backend API

#### New Route
**File:** [backend/routes/articles.js](backend/routes/articles.js:132-154)

```javascript
PATCH /api/articles/:id/content
```

**Authorization:** Editor or Admin only

**Request Body:**
```json
{
  "content": "First paragraph.\n\nSecond paragraph.\n\nThird paragraph."
}
```

**Response:**
```json
{
  "id": 18,
  "title": "Article Title",
  "content": "Reordered paragraphs...",
  ...
}
```

Updates only the `content` field, preserving all other article metadata.

## User Interface

### EditorArticleView - Action Buttons

```
┌────────────────────────────────────────────────────────┐
│ ← Înapoi la listă                                      │
│                                                         │
│ [📢 Publică] [✏️ Editează Titlu] [⇅ Reordonează] [🗑️] │
└────────────────────────────────────────────────────────┘
```

**Button Visibility:**
- **"⇅ Reordonează Paragrafe"** - Only shows if `article.content` is not empty

### ParagraphEditor Modal

```
┌─────────────────────────────────────────────────────────┐
│  Reordonare Paragrafe                [Anulează] [💾]    │
│  Trage și plasează paragrafele pentru a le reordona     │
├─────────────────────────────────────────────────────────┤
│  📝 Instrucțiuni:                                       │
│  • Trage un paragraf pentru a-l muta                    │
│  • Sau folosește butoanele ↑ ↓                          │
│  • Modificările vor fi salvate când apeși "Salvează"    │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │ Paragraf 1                    [↑] [↓] [⋮⋮]      │   │
│  │ This is the first paragraph content...          │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Paragraf 2                    [↑] [↓] [⋮⋮]      │   │
│  │ This is the second paragraph...                 │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Paragraf 3                    [↑] [↓] [⋮⋮]      │   │
│  │ Third paragraph here...                         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Drag & Drop Mechanics

### HTML5 Drag API
Each paragraph card has:
- `draggable={true}` - Makes element draggable
- `onDragStart` - Records which paragraph is being dragged
- `onDragOver` - Calculates new position and reorders array
- `onDragEnd` - Clears drag state

### State Management
```javascript
const [paragraphs, setParagraphs] = useState([]);
const [draggedIndex, setDraggedIndex] = useState(null);
```

### Reorder Algorithm
```javascript
const handleDragOver = (e, index) => {
  e.preventDefault();
  
  if (draggedIndex === null || draggedIndex === index) return;
  
  const newParagraphs = [...paragraphs];
  const draggedItem = newParagraphs[draggedIndex];
  
  // Remove from old position
  newParagraphs.splice(draggedIndex, 1);
  // Insert at new position
  newParagraphs.splice(index, 0, draggedItem);
  
  setParagraphs(newParagraphs);
  setDraggedIndex(index);
};
```

## Visual Feedback

### Dragging State
```css
.paragraph-item.dragging {
  opacity: 0.5;
  transform: scale(0.98);
  border-color: #667eea;
  background: #f0f4ff;
}
```

### Hover Effect
```css
.paragraph-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}
```

### Disabled Buttons
- **↑ button** disabled on first paragraph
- **↓ button** disabled on last paragraph
- Grayed out with `opacity: 0.3`

## Workflow

### Complete Editor Flow
1. **View Article**
   ```
   Editor Dashboard → Click "👁️ Vizualizează"
   ```

2. **Check Content**
   ```
   Article has content? 
   ✓ Yes → "⇅ Reordonează Paragrafe" button visible
   ✗ No → Button hidden
   ```

3. **Open Paragraph Editor**
   ```
   Click "⇅ Reordonează Paragrafe"
   → Modal opens with all paragraphs
   ```

4. **Reorder Using Drag & Drop**
   ```
   Click and hold paragraph card
   → Drag to new position
   → Release mouse
   → Paragraph moves to new location
   ```

5. **OR Reorder Using Buttons**
   ```
   Click ↑ button → Moves paragraph up one position
   Click ↓ button → Moves paragraph down one position
   ```

6. **Save Changes**
   ```
   Click "💾 Salvează Ordinea"
   → PATCH /api/articles/:id/content
   → Article content updated in database
   → Modal closes
   → Article view refreshes
   ```

### Journalist Perspective
Journalists **cannot** reorder paragraphs. They can only:
- Write content in ArticleEditor
- Content is split into paragraphs by double-newlines
- Editor has full control over final paragraph order

## Paragraph Format

### How Paragraphs Are Stored
```
"First paragraph text here.\n\nSecond paragraph text.\n\nThird paragraph."
```

- Separator: `\n\n` (two newlines)
- Each paragraph is continuous text
- No empty paragraphs (filtered out)

### Splitting Logic
```javascript
const paragraphs = article.content.split('\n\n').filter(p => p.trim());
```

### Joining Logic
```javascript
const newContent = paragraphs.join('\n\n');
```

## Edge Cases Handled

### No Content
- Button "⇅ Reordonează" is hidden
- Modal shows: "Acest articol nu are conținut încă"

### Single Paragraph
- Can still open editor
- Both ↑ ↓ buttons disabled
- Drag does nothing (no other positions)

### Empty Paragraphs
- Filtered out during split
- Won't create blank cards

### Very Long Paragraphs
- Modal is scrollable
- Each card has `word-wrap: break-word`
- Content is `white-space: pre-wrap`

## Styling Details

### Color Scheme
- **Purple Theme:** `#9b59b6` for reorder button
- **Blue Theme:** `#667eea` for drag indicators
- **Instructions Box:** Light blue `#e3f2fd`

### Card Borders
- Default: `#e0e0e0` (gray)
- Hover: `#667eea` (blue)
- Dragging: `#667eea` (blue) with lighter background

### Button States
```css
.move-button:hover:not(:disabled) {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}
```

## Testing Scenarios

### Test Case 1: Basic Reordering
1. Login as editor
2. View article with 3+ paragraphs
3. Click "⇅ Reordonează"
4. Drag Paragraph 1 to position 3
5. Click "💾 Salvează"
6. Verify order changed in article view

### Test Case 2: Button Navigation
1. Open paragraph editor
2. Select middle paragraph
3. Click ↑ button multiple times
4. Paragraph should move to top
5. ↑ button becomes disabled
6. Save and verify

### Test Case 3: Cancel Without Saving
1. Open paragraph editor
2. Reorder paragraphs
3. Click "Anulează"
4. Verify original order preserved

### Test Case 4: Empty Article
1. View article with no content
2. Verify "⇅ Reordonează" button not visible
3. Editor should see "Articolul nu are conținut încă"

## Files Modified/Created

### Frontend
- ✓ [frontend/src/components/ParagraphEditor.jsx](frontend/src/components/ParagraphEditor.jsx) - New component
- ✓ [frontend/src/components/ParagraphEditor.css](frontend/src/components/ParagraphEditor.css) - Styling
- ✓ [frontend/src/components/EditorArticleView.jsx](frontend/src/components/EditorArticleView.jsx) - Added button & integration
- ✓ [frontend/src/components/EditorArticleView.css](frontend/src/components/EditorArticleView.css) - Button style

### Backend
- ✓ [backend/routes/articles.js](backend/routes/articles.js) - Added PATCH /:id/content route

## Permissions

| Role       | Can Reorder Paragraphs? |
|------------|------------------------|
| Admin      | ✓ Yes                  |
| Editor     | ✓ Yes                  |
| Journalist | ✗ No                   |
| Viewer     | ✗ No                   |

## Future Enhancements (Not Implemented)

Potential improvements:
- Split/merge paragraphs
- Edit paragraph text inline
- Add new paragraphs between existing ones
- Undo/redo stack
- Keyboard shortcuts (Alt+↑, Alt+↓)
- Preview mode before saving

## Important Notes

1. **Backend restart required** for new `/content` route
2. **Paragraph separator is `\n\n`** - journalists must use double-newline
3. **Content-only update** - doesn't affect title, journalists, status, etc.
4. **No validation** on paragraph content - accepts any text
5. **Drag handle** (⋮⋮) is visual only - entire card is draggable

## Browser Compatibility

Drag & Drop uses HTML5 Drag API:
- ✓ Chrome/Edge
- ✓ Firefox
- ✓ Safari
- ⚠️ Mobile browsers have limited drag support (use arrow buttons instead)
