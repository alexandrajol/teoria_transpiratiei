# 🔧 Fix Blank Page - Quick Guide

## The Problem
You see a blank page at `https://localhost:5173` after accepting the certificate warning.

## The Solution (2 Easy Steps)

### ✅ Step 1: Accept Backend Certificate
1. Open your browser
2. Go to: **`https://localhost:3000/api/articles`**
3. You'll see "Your connection is not private" - **this is normal**
4. Click **"Advanced"** (or "Show Details")
5. Click **"Proceed to localhost (unsafe)"** (or "Continue to site")
6. You should see JSON data (article information)

### ✅ Step 2: Reload Frontend
1. Go to: **`https://localhost:5173`**
2. **Refresh the page** (press F5 or Ctrl+R)
3. ✨ The page should now load properly!

---

## Why This Happens?

Your browser needs to trust **TWO** certificates:
1. ✅ Frontend certificate (`https://localhost:5173`) - You already accepted this
2. ❌ Backend certificate (`https://localhost:3000`) - **You need to accept this too**

When the frontend tries to fetch data from the backend, the browser blocks it because you haven't accepted the backend certificate yet.

---

## Alternative Method (If Above Doesn't Work)

### Use the Test Page

1. Go to: **`https://localhost:5173/test.html`**
2. Follow the instructions on that page
3. Click "Open Backend in New Tab" button
4. Accept the certificate in the new tab
5. Come back and click "Test Backend Connection"
6. If successful, go back to main page: `https://localhost:5173`

---

## Quick Chrome Trick

If you're using Chrome or Edge:
1. When you see "Your connection is not private"
2. Just click anywhere on the page
3. Type: **`thisisunsafe`** (no spaces, the text won't appear while typing)
4. The page will load immediately!

---

## Checklist

Before trying the fix, make sure:

- [ ] Backend is running
  ```bash
  cd backend
  npm start
  ```
  Should show: "Backend server running on https://localhost:3000"

- [ ] Frontend is running
  ```bash
  cd frontend  
  npm run dev
  ```
  Should show: "Local: https://localhost:5173/"

- [ ] Both servers are using HTTPS (not HTTP)

---

## Test Backend is Running

Open terminal and run:
```bash
curl -k https://localhost:3000/api/articles
```

✅ **Should show:** JSON data with articles
❌ **If error:** Backend is not running or not using HTTPS

---

## Still Blank? Check Browser Console

1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Look for red error messages

### Common Errors and Fixes:

**Error:** `net::ERR_CERT_AUTHORITY_INVALID`
- **Fix:** Accept backend certificate (Step 1 above)

**Error:** `Failed to fetch` or `net::ERR_CONNECTION_REFUSED`
- **Fix:** Backend is not running. Start it with `cd backend && npm start`

**Error:** `Cannot find module './utils/api'`
- **Fix:** The file was created. Restart the frontend server.

**Error:** `Mixed Content: The page was loaded over HTTPS, but requested an insecure resource`
- **Fix:** Check that frontend `.env` has `VITE_API_URL=https://localhost:3000/api` (https not http)

---

## Emergency: Revert to HTTP

If HTTPS is causing too many issues, you can temporarily use HTTP:

### 1. Stop both servers (Ctrl+C)

### 2. Backend: Comment out HTTPS in `server.js`

Replace the HTTPS section with:
```javascript
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
```

### 3. Frontend: Update `.env`
```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Frontend: Remove HTTPS from `vite.config.js`

Change:
```javascript
server: {
  host: '0.0.0.0',
  port: 5173,
  // Remove the https section
}
```

### 5. Restart both servers

Then access at: **`http://localhost:5173`** (no certificate warnings!)

---

## Need Visual Help?

### Screenshots showing what you should see:

**Step 1 - Backend Certificate Warning:**
```
⚠️ Your connection is not private
   Attackers might be trying to steal your information...
   
   [Advanced] [Go Back]
   
   → Click "Advanced"
   → Click "Proceed to localhost (unsafe)"
```

**Step 2 - After accepting:**
```
[
  {
    "id": 16,
    "title": "Article Title Here...",
    "content": "Article content...",
    ...
  }
]
```

**Step 3 - Reload Frontend:**
```
Press F5 or click the refresh button in your browser
```

---

## Success Indicators

✅ **Everything is working when you see:**
- Teoria Transpirației logo and title at the top
- List of articles on the left sidebar
- Login/Register buttons on the right
- No errors in browser console (F12)
- 🔒 HTTPS lock icon in browser address bar

---

## Summary: The 30-Second Fix

1. **Open:** `https://localhost:3000/api/articles`
2. **Accept** the certificate warning
3. **Go back to:** `https://localhost:5173`  
4. **Refresh** the page (F5)
5. **Done!** 🎉

---

Still stuck? See [TROUBLESHOOTING_BLANK_PAGE.md](TROUBLESHOOTING_BLANK_PAGE.md) for detailed troubleshooting.
