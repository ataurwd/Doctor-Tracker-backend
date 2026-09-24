# Doctor Tracker — Backend API

RESTful API backend for **Doctor Tracker** built with Node.js, Express, TypeScript, and MongoDB.

## Features
- Scalable RESTful API structure with Express and TypeScript
- MongoDB with Mongoose ODM (indexes and aggregation pipelines)
- Secure JWT authentication & authorization
- Zod request validation and error handling
- Docker & local development ready

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm start
```
