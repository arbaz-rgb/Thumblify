# Thumblify

Thumblify is a full-stack AI thumbnail generator for creators. Users can create an account, generate thumbnails from a title and prompt, choose visual styles, aspect ratios, and color schemes, then manage their saved generations.

## Features

- AI thumbnail generation with NVIDIA FLUX through NVIDIA NIM
- Email and password auth with encrypted passwords
- Session-based authentication with MongoDB session storage
- Per-user thumbnail history
- Cloudinary image hosting
- Style, aspect ratio, and color scheme controls
- Production-ready CORS and secure cookie configuration
- Vite SPA routing support for hosted frontend deployments

## Tech Stack

**Frontend**

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router
- Axios
- Motion
- Lucide React

**Backend**

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
|-- client/                 # React + Vite frontend
|   |-- public/             # Static images, redirects, and icons
|   `-- src/
|       |-- assets/         # App assets and shared option data
|       |-- components/     # Reusable UI components
|       |-- configs/        # Axios API configuration
|       |-- context/        # Auth context
|       |-- data/           # Landing page content
|       |-- pages/          # Route pages
|       `-- sections/       # Home page sections
|-- server/                 # Express + TypeScript backend
|   |-- config/             # Database and AI client config
|   |-- controllers/        # Route handlers
|   |-- middleware/         # Auth middleware
|   |-- model/              # Mongoose models
|   `-- routes/             # API routes
`-- render.yaml             # Render backend blueprint
```

## Prerequisites

- Node.js 20 or newer
- npm
- MongoDB database
- Cloudinary account
- NVIDIA API key with access to the FLUX endpoint

## Environment Variables

Copy the example env files before running locally:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### Backend

Create `server/.env`:

```env
NODE_ENV=development
PORT=3000
MONGODB_URL=your_mongodb_connection_string
SESSION_SECRET=your_long_random_session_secret
CLIENT_URL=http://localhost:5173
CLIENT_URLS=http://localhost:5173
NVIDIA_API_KEY=your_nvidia_api_key
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

`CLIENT_URLS` supports a comma-separated list, for example:

```env
CLIENT_URLS=http://localhost:5173,https://your-frontend-domain.com
```

### Frontend

Create `client/.env`:

```env
VITE_BASE_URL=http://localhost:3000
```

For production, set `VITE_BASE_URL` to your deployed Render backend URL.

## Local Development

Install backend dependencies:

```bash
cd server
npm install
```

Install frontend dependencies:

```bash
cd ../client
npm install
```

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

Open:

```text
http://localhost:5173
```

## Build

Build the backend:

```bash
cd server
npm run build
```

Start the compiled backend:

```bash
npm start
```

Build the frontend:

```bash
cd client
npm run build
```

Preview the frontend build:

```bash
npm run preview
```

## Deployment

### Backend on Render

The repository includes `render.yaml` for a Render web service.

Manual Render setup:

1. Create a new Web Service from this GitHub repository.
2. Set the root directory to `server`.
3. Set the build command:

```bash
npm install && npm run build
```

4. Set the start command:

```bash
npm start
```

5. Add environment variables:

```env
NODE_ENV=production
MONGODB_URL=your_mongodb_connection_string
SESSION_SECRET=your_long_random_session_secret
CLIENT_URL=https://your-frontend-domain.com
CLIENT_URLS=https://your-frontend-domain.com
NVIDIA_API_KEY=your_nvidia_api_key
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

6. Use `/health` as the health check path.

Important: the backend uses secure cross-site cookies in production. The frontend must be served over HTTPS and its exact origin must be listed in `CLIENT_URLS`.

### Frontend on Vercel

1. Import this GitHub repository into Vercel.
2. Set the root directory to `client`.
3. Set the build command:

```bash
npm run build
```

4. Set the output directory:

```text
dist
```

5. Add environment variable:

```env
VITE_BASE_URL=https://your-render-backend.onrender.com
```

The included `client/vercel.json` rewrites all routes to `index.html`, so direct refreshes on React routes work.

### Frontend on Netlify or Render Static Site

Use these settings:

```text
Base directory: client
Build command: npm run build
Publish directory: dist
```

Set:

```env
VITE_BASE_URL=https://your-render-backend.onrender.com
```

The included `client/public/_redirects` file enables SPA fallback routing.

## Available Scripts

### Frontend

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the frontend for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

### Backend

| Script | Description |
| --- | --- |
| `npm run dev` | Run the API with Nodemon and `tsx` |
| `npm run server` | Alias for local Nodemon development |
| `npm run build` | Compile TypeScript into `dist/` |
| `npm start` | Run the compiled production server |

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
| `GET` | `/api/auth/verify` | Verify the current authenticated session |
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

Authenticated routes require the session cookie, and the frontend Axios client sends requests with `withCredentials: true`.

## Thumbnail Generation Flow

1. The user enters a title and optional prompt details.
2. The user selects a style, aspect ratio, and color scheme.
3. The backend creates a pending thumbnail record in MongoDB.
4. The backend builds a generation prompt and calls NVIDIA FLUX.
5. The generated image is saved temporarily, uploaded to Cloudinary, and removed locally.
6. The MongoDB thumbnail record is updated with the Cloudinary URL.
7. The frontend loads the saved thumbnail and displays the result.

## Production Checklist

- Set `NODE_ENV=production` on Render.
- Set `VITE_BASE_URL` to the deployed Render backend URL before building the frontend.
- Add the deployed frontend URL to `CLIENT_URLS` on Render.
- Use HTTPS for frontend and backend.
- Use a strong `SESSION_SECRET`.
- Keep `.env` files out of git.
- Confirm MongoDB network access allows Render to connect.
- Confirm Cloudinary and NVIDIA credentials are valid.

## License

This project is currently licensed under the ISC license declared in the server package.
