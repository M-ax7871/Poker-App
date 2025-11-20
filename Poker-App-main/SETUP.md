#!/bin/bash

echo "Setting up backend..."
cd backend && poetry install

echo "Setting up frontend..." 
cd ../frontend && npm install

echo "Starting both servers..."
echo "Backend: http://localhost:8000"
echo "Backend Docs: http://localhost:8000/docs"
echo "Frontend: http://localhost:3000"
echo ""

cd ../backend && poetry run uvicorn main:app --reload &
cd ../frontend && npm run dev