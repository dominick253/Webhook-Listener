#!/bin/bash

# Navigate to your Node.js app directory
cd /root/webhook-listener 

# Fetch the latest code
git pull origin master

# Remove old files and node_modules
rm -rf node_modules/

# Install dependencies and build the app
npm install
npm run build

# Restart the Express server (assuming you're using the systemd service)
systemctl restart webhook-listener

echo "Deployment completed."
