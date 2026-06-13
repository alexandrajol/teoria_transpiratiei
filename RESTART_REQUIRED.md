# Backend Restart Required

## Issue Fixed
The like/dislike feature had a bug where `req.user.userId` was being used instead of `req.user.id`. This has been fixed in the code.

## Action Required
**You must restart the backend server** for the changes to take effect.

### Steps to Restart:

1. **Stop the current backend server:**
   - Press `Ctrl+C` in the terminal where the backend is running
   - Or close the terminal window

2. **Start the backend again:**
   ```bash
   cd backend
   npm start
   ```
   
   Or if using the batch file:
   ```bash
   start-backend.bat
   ```

3. **Verify the server started:**
   - You should see: "Backend server running on http://localhost:3000"

4. **Test the like/dislike feature:**
   - Login as a viewer
   - Select a published article
   - Click the 👍 or 👎 button
   - The page should no longer turn blank

## What Was Fixed

### Before (Bug):
```javascript
const userId = req.user.userId;  // ❌ undefined - caused errors
```

### After (Fixed):
```javascript
const userId = req.user.id;  // ✅ correct - matches JWT token structure
```

The JWT token stores the user ID as `id`, not `userId`. This mismatch caused `userId` to be `undefined`, which made the database queries fail and the page to turn blank.

## Database Status
✅ The `article_reactions` table has been created successfully
✅ The database can accept reactions
✅ All API routes are properly configured

Once you restart the backend, everything should work perfectly!
