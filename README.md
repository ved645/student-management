# Student Management System

A full-stack Student Management System built with Node.js, Express, MongoDB, and React (Vite).

## Features

- Student Record Management (Create, Read, Update, Delete)
- RESTful API with Express and Mongoose
- React frontend built with Vite
- MongoDB schema validation for student details (name, email, roll number, branch, year)

## Project Structure

```
├── client/          # Frontend React application (Vite)
├── models/          # Mongoose data models
│   └── Student.js   # Student schema definition
├── routes/          # Express API route handlers
│   └── studentRoutes.js
├── server.js        # Main Express server entry point
├── package.json     # Backend dependencies and scripts
└── README.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas)

### Backend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   ```

3. Start the backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
