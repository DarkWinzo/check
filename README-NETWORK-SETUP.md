# Network Host Setup Guide

This guide will help you run the Student Registration System on your network so other devices can access it.

## Quick Start

### Windows Users
1. Double-click `start-network.bat`
2. The script will automatically detect your network IP and start both servers
3. Access the application at `http://YOUR_NETWORK_IP:3000`

### Linux/Mac Users
1. Make the script executable: `chmod +x start-network.sh`
2. Run: `./start-network.sh`
3. Access the application at `http://YOUR_NETWORK_IP:3000`

## Manual Setup

### 1. Find Your Network IP
**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

**Linux/Mac:**
```bash
hostname -I
# or
ifconfig
```

### 2. Start Backend Server
```bash
cd Backend
npm start
```

### 3. Start Frontend Server (Network Mode)
```bash
cd Frontend
npm run dev -- --host 0.0.0.0
```

### 4. Access the Application
Open your browser and go to: `http://YOUR_NETWORK_IP:3000`

## Default Admin Login
- **Email:** admin@example.com
- **Password:** admin123

## Troubleshooting

### Issue: Login page loads but dashboard doesn't load after login
**Solution:** Make sure both frontend and backend are using the same network IP. The system now automatically detects and configures this.

### Issue: Other devices can't access the application
**Solutions:**
1. Check Windows Firewall or your system's firewall
2. Make sure ports 3000 and 5000 are not blocked
3. Verify your network allows device-to-device communication

### Issue: CORS errors in browser console
**Solution:** The system now automatically configures CORS for network access. If you still see errors, check that both servers are running on the same network IP.

### Issue: API calls failing
**Solution:** 
1. Check that backend is running on port 5000
2. Verify the network IP is correctly detected
3. Check browser developer tools for specific error messages

## Manual Configuration

If automatic detection doesn't work, you can manually configure:

### Frontend (.env file)
```
VITE_API_URL=http://YOUR_NETWORK_IP:5000/api
```

### Backend (.env file)
```
CLIENT_URL=http://YOUR_NETWORK_IP:3000
ALLOWED_ORIGINS=http://YOUR_NETWORK_IP:3000,http://YOUR_NETWORK_IP:5173
```

Replace `YOUR_NETWORK_IP` with your actual network IP address.

## Security Notes

- This setup is for development/local network use only
- For production deployment, additional security measures are required
- Change the default admin password after first login
- Consider using HTTPS for production environments