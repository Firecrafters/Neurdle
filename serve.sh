#!/bin/sh

# Serves the game from the src directory on port 3000

# Create logs directory if it doesn't exist
mkdir -p /workspace/logs

echo "Starting Neurdle development server..."
echo "Game will be available at: http://localhost:3000"
echo "Logs will be saved to: /workspace/logs/serve.log"
echo "Press Ctrl+C to stop the server"
echo ""

cd /workspace/src

# Try different server options in order of preference
if command -v python3 >/dev/null 2>&1; then
    echo "Using Python 3 HTTP server"
    python3 -m http.server 3000 2>&1 | tee /workspace/logs/serve.log
elif command -v python >/dev/null 2>&1; then
    echo "Using Python HTTP server"
    python -m http.server 3000 2>&1 | tee /workspace/logs/serve.log
elif command -v node >/dev/null 2>&1; then
    echo "Using Node.js HTTP server"
    npx http-server -p 3000 -c-1 2>&1 | tee /workspace/logs/serve.log
else
    echo "Error: No suitable HTTP server found!"
    echo "Please install Python or Node.js to run the development server."
    exit 1
fi
