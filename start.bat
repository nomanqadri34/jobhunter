@echo off
echo Starting Job Hunting Application...

echo Starting Python Flask Service...
start cmd /k "cd pythonfilter && python app.py"

timeout /t 3

echo Starting Node.js Backend...
start cmd /k "cd backend && npm run dev"

timeout /t 3

echo Starting React Frontend...
start cmd /k "cd client && npm run dev"

echo All services started!
pause