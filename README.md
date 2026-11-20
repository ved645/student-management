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
├── render.yaml      # Render Blueprint deployment specification
├── package.json     # Backend dependencies and scripts
└── README.md
```

## Getting Started Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or a local MongoDB instance

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

---

## Deploying on Render

### Step 1: Prepare MongoDB Atlas (Crucial)
1. Go to your [MongoDB Atlas Dashboard](https://cloud.mongodb.com/).
2. Under **Security** > **Network Access**, ensure IP `0.0.0.0/0` (Allow Access from Anywhere) is added. Render uses dynamic IP addresses, so this is required for Render to connect to your database.
3. Under **Database** > **Connect** > **Drivers**, copy your MongoDB connection URI (e.g., `mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/student-management?retryWrites=true&w=majority`).

---

### Step 2: Deploy to Render (Recommended: Single Web Service)

This runs both the Express backend and Vite React frontend together on a single Render free-tier Web Service.

1. Go to the [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository: `ved645/student-management`.
4. Configure the settings:
   - **Name**: `student-management` (or any name you prefer)
   - **Region**: Choose the closest region to you (e.g., Singapore, Frankfurt, Oregon)
   - **Branch**: `main`
   - **Root Directory**: *(leave blank)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Under **Environment Variables**, add:
   - `MONGO_URI`: *(Paste your MongoDB Atlas connection string)*
   - `NODE_ENV`: `production`
6. Click **Deploy Web Service**.

Render will install dependencies, build the React frontend, and launch the server. Once the build finishes, your site will be live at `https://<your-service-name>.onrender.com`.

---

### Alternative: Deploy Using Render Blueprint (`render.yaml`)

Because this repository includes a `render.yaml` file:
1. In Render, click **New +** > **Blueprint**.
2. Select `ved645/student-management`.
3. Enter your `MONGO_URI` when prompted.
4. Click **Apply**.
