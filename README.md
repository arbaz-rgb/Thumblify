# Thumblify

Thumblify is a full-stack AI thumbnail generator for creators. Users can sign up, generate thumbnails from a title and prompt, choose styles, aspect ratios, and color schemes, then manage their saved generations.

## Features

- AI thumbnail generation with NVIDIA FLUX through NVIDIA NIM
- User registration, login, logout, and session verification
- MongoDB-backed sessions with `connect-mongo`
- Thumbnail history per user
- Cloudinary image upload and hosted image URLs
- Style, aspect ratio, and color scheme controls
- Responsive React interface built with Vite and Tailwind CSS

## Tech Stack

**Client**

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router
- Axios
- Motion
- Lucide React

**Server**

- Node.js
- Express 5
- TypeScript
- MongoDB and Mongoose
- Express Session
- Connect Mongo
- Bcrypt
- Cloudinary
- NVIDIA NIM image generation API

## Project Structure

```text
thumblify/
├── client/                 # React + Vite frontend
│   ├── public/             # Static images and icons
│   └── src/
│       ├── assets/         # App assets and shared option data
│       ├── components/     # Reusable UI components
│       ├── configs/        # Axios API configuration
│       ├── context/        # Auth context
│       ├── data/           # Landing page content
│       ├── pages/          # Route pages
│       └── sections/       # Home page sections
└── server/                 # Express + TypeScript backend
    ├── config/             # Database and AI client config
    ├── controllers/        # Route handlers
    ├── middleware/         # Auth middleware
    ├── model/              # Mongoose models
    └── routes/             # API routes
```

## Prerequisites

- Node.js 20 or newer
- npm
- MongoDB database
- Cloudinary account
- NVIDIA API key with access to the FLUX endpoint

## Environment Variables

Create a `.env` file in `server/`:

```env
PORT=3000
MONGODB_URL=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
NVIDIA_API_KEY=your_nvidia_api_key
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

Create a `.env` file in `client/`:

```env
VITE_BASE_URL=http://localhost:3000
```

The backend enables CORS for `http://localhost:5173` and `http://localhost:3000` with credentials, so keep the client and server URLs aligned when changing ports.

## Installation

Install server dependencies:

```bash
cd server
npm install
```

Install client dependencies:

```bash
cd ../client
npm install
```

## Running Locally

Start the backend:

```bash
cd server
npm run server
```

Start the frontend in a second terminal:

```bash
cd client
npm run dev
```

Open the Vite URL, usually:

```text
http://localhost:5173
```

## Build

Build the backend TypeScript:

```bash
cd server
npm run build
```

Build the frontend:

```bash
cd client
npm run build
```

Preview the production frontend build:

```bash
cd client
npm run preview
```

## Available Scripts

### Client

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the frontend for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

### Server

| Script | Description |
| --- | --- |
| `npm start` | Run the server with `tsx` |
| `npm run server` | Run the server with Nodemon and `tsx` |
| `npm run build` | Compile TypeScript with `tsc` |

## API Overview

Base URL in local development:

```text
http://localhost:3000
```

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account and start a session |
| `POST` | `/api/auth/login` | Log in and start a session |
| `POST` | `/api/auth/verify` | Verify the current authenticated session |
| `POST` | `/api/auth/logout` | Destroy the current session |

### Thumbnails

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/thumbnail/generate` | Generate a thumbnail for the logged-in user |
| `DELETE` | `/api/thumbnail/delete/:id` | Delete a thumbnail owned by the logged-in user |

### User

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/user/thumbnails` | Get the logged-in user's thumbnails |
| `GET` | `/api/user/thumbnail/:id` | Get one thumbnail owned by the logged-in user |

Authenticated routes require the browser session cookie, so frontend requests use Axios with `withCredentials: true`.

## Thumbnail Generation Flow

1. The user enters a title and optional prompt details.
2. The user selects a style, aspect ratio, and color scheme.
3. The server creates a pending thumbnail record in MongoDB.
4. The server builds a generation prompt and calls NVIDIA FLUX.
5. The generated image is saved temporarily, uploaded to Cloudinary, and then removed locally.
6. The MongoDB thumbnail record is updated with the Cloudinary URL.
7. The client loads the saved thumbnail and displays the final result.

## Deployment Notes

- Set `VITE_BASE_URL` to the deployed backend URL before building the client.
- Update backend CORS origins to include the deployed frontend URL.
- Use a strong `SESSION_SECRET` in production.
- Use a persistent MongoDB database for users, thumbnails, and session storage.
- Keep all API keys and database credentials out of git.

## License

This project is currently licensed under the ISC license declared in the server package.
