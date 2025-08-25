#!/bin/bash

echo "Starting Student Registration System for Network Access..."
echo

# Get network IP (works on most Unix systems)
NETWORK_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)

if [ -z "$NETWORK_IP" ]; then
    NETWORK_IP="localhost"
    echo "Could not detect network IP, using localhost"
else
    echo "Network IP detected: $NETWORK_IP"
fi

echo
echo "Frontend will be available at: http://$NETWORK_IP:3000"
echo "Backend will be available at: http://$NETWORK_IP:5000"
echo

# Start backend in background
echo "Starting Backend Server..."
cd Backend && export NODE_ENV=development && npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting Frontend Server..."
cd ../Frontend && npm run dev -- --host 0.0.0.0 &
FRONTEND_PID=$!

echo
echo "Both servers are starting..."
echo "Please wait a moment and then open: http://$NETWORK_IP:3000"
echo
echo "Admin Login:"
echo "Email: admin@example.com"
echo "Password: admin123"
echo
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait