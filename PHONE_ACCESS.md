# 📱 Access from Your Phone

## ✅ Setup Complete!

Your app is now configured to work on your phone when connected to the same WiFi network.

## 🚀 How to Use

### Step 1: Start the Servers
On your computer, run:
1. Double-click **[start-backend.bat](start-backend.bat)**
2. Double-click **[start-frontend.bat](start-frontend.bat)**

### Step 2: Connect from Your Phone
Make sure your phone is on the **same WiFi network** as your computer.

Then open your phone's browser and go to:
```
http://10.94.233.226:5173
```

### Step 3: Login
Use any of the test accounts:
- Username: `admin`, `editor`, `journalist`, or `viewer`
- Password: `admin123`

Or register a new account!

## 🔧 Troubleshooting

### Can't Connect?

1. **Check if both devices are on the same WiFi**
   - Computer and phone must be on the same network

2. **Check Windows Firewall**
   - Windows might be blocking the ports
   - Run these commands in PowerShell as Administrator:
   ```powershell
   New-NetFirewallRule -DisplayName "Node Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "Vite Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
   ```

3. **Verify your IP hasn't changed**
   - Open Command Prompt and run: `ipconfig`
   - Look for "IPv4 Address" under your WiFi adapter
   - If it's different from `10.94.233.226`, update [frontend/.env](frontend/.env) with the new IP

4. **Try accessing from computer first**
   - On your computer, go to http://10.94.233.226:5173
   - If this doesn't work, the issue is with the network configuration, not your phone

### If Your IP Address Changes

If your computer's IP address changes (e.g., after restart), you need to:

1. Find your new IP:
   ```bash
   ipconfig
   ```

2. Update [frontend/.env](frontend/.env):
   ```
   VITE_API_URL=http://YOUR_NEW_IP:3000/api
   ```

3. Update [backend/server.js](backend/server.js) (line 46):
   ```javascript
   console.log(`Network access: http://YOUR_NEW_IP:${PORT}`);
   ```

4. Restart both frontend and backend

## 🌐 Alternative: Use Your Computer's Name

Instead of the IP address, you can also try accessing via your computer's hostname:
```
http://YOUR-COMPUTER-NAME:5173
```

Find your computer name with:
```bash
hostname
```

## 📝 Notes

- The app works completely offline - no internet needed, just WiFi
- Your phone and computer must stay on the same network
- If you restart your router, the IP might change
- For production deployment, you'd use a real domain/hosting service

## 🎨 Role Colors on Phone

After logging in, you'll see your role badge:
- 🔴 **Admin** - Red
- 🟡 **Editor** - Yellow
- 🔵 **Journalist** - Blue
- 🟢 **Viewer** - Green

The interface is fully responsive and works great on mobile! 📱✨
