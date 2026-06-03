# 🎨 Thumblify

![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react&logoColor=111827)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-111827?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Thumblify is a full-stack AI thumbnail generator for creators. It lets users register, log in, generate thumbnails from a title and prompt, choose visual styles, aspect ratios, and color schemes, preview the result in a YouTube-style layout, and manage saved generations.

---

## ✨ Features

| Area | Implemented Capability |
| --- | --- |
| 🔐 Authentication | Email/password registration and login with bcrypt password hashing |
| 🍪 Sessions | Express session authentication persisted with MongoDB via `connect-mongo` |
| 🎨 AI generation | Thumbnail generation through NVIDIA NIM FLUX endpoint |
| ☁️ Image hosting | Generated images are uploaded to Cloudinary |
| 🖼️ Customization | Title, additional prompt, style, aspect ratio, color scheme, and text overlay payload |
| 🧾 User library | Authenticated users can list, view, download, and delete their thumbnails |
| ▶️ Preview | Generated thumbnails can be viewed inside a YouTube-style preview page |
| 🏠 Landing page | Hero, features, testimonials, pricing, contact, and CTA sections |
| 🚦 Health check | Backend exposes `/health` for deployment checks |
| 🌐 SPA routing | Vercel rewrites and Netlify-style `_redirects` are included |

---

## 🧰 Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS 4 |
| Routing/UI | React Router DOM 7, Lucide React, Motion, Lenis, React Hot Toast, React Fast Marquee |
| HTTP Client | Axios with `withCredentials: true` |
| Backend | Node.js, Express 5, TypeScript |
| Database | MongoDB, Mongoose |
| Auth | Express Session, Connect Mongo, bcrypt |
| AI/Image | NVIDIA NIM FLUX image generation, Cloudinary |
| Tooling | ESLint, tsx, nodemon |
| Deployment Config | Render backend blueprint, Vercel frontend rewrites, Docker Compose |

---

## 🏗️ Project Architecture

```mermaid
flowchart LR
  User["👤 User"] --> Client["⚛️ React + Vite Client"]
  Client -->|Axios + cookies| API["🚀 Express API"]
  API -->|Session store| Mongo[(🍃 MongoDB)]
  API -->|User + thumbnail docs| Mongo
  API -->|Generate image| NVIDIA["🧠 NVIDIA NIM FLUX"]
  NVIDIA --> API
  API -->|Upload image| Cloudinary["☁️ Cloudinary"]
  Cloudinary --> API
  API --> Client
```

```text
thumblify/
├── client/                     # React + Vite frontend
│   ├── public/                 # Static assets, SPA redirects, icons
│   └── src/
│       ├── assets/             # Imported images, app option data, shared types
│       ├── components/         # Reusable UI components
│       ├── configs/            # Axios API client
│       ├── context/            # Auth context and auth actions
│       ├── data/               # Landing-page content
│       ├── pages/              # Route-level pages
│       └── sections/           # Home page sections
├── server/                     # Express + TypeScript backend
│   ├── config/                 # MongoDB and NVIDIA OpenAI-compatible client config
│   ├── controllers/            # Request handlers
│   ├── middleware/             # Session auth guard
│   ├── model/                  # Mongoose models
│   └── routes/                 # API route definitions
├── docker-compose.yml
└── render.yaml
```

---

## 🧭 Frontend Routes

| Route | Component | Purpose |
| --- | --- | --- |
| `/` | `HomePage` | Landing page |
| `/generate` | `Generate` | Create a new thumbnail |
| `/generate/:id` | `Generate` | View an existing generation |
| `/my-generation` | `MyGeneration` | View, download, preview, and delete generated thumbnails |
| `/preview` | `YtPreview` | Render a YouTube-style preview using query params |
| `/login` | `Login` | Authentication screen |

---

## 🔌 API Endpoints

Base path is served by the backend. In local development the server defaults to `http://localhost:3000` unless `PORT` is set.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | No | Plain text server status: `Server is Live!` |
| `GET` | `/health` | No | JSON health check: `{ "status": "ok" }` |
| `POST` | `/api/auth/register` | No | Create a user and start a session |
| `POST` | `/api/auth/login` | No | Authenticate a user and start a session |
| `GET` | `/api/auth/verify` | Yes | Return the current session user |
| `POST` | `/api/auth/verify` | Yes | Return the current session user |
| `POST` | `/api/auth/logout` | Yes | Destroy the current session |
| `POST` | `/api/thumbnail/generate` | Yes | Generate a thumbnail, upload it to Cloudinary, and save the record |
| `DELETE` | `/api/thumbnail/delete/:id` | Yes | Delete one owned thumbnail |
| `GET` | `/api/user/thumbnails` | Yes | List thumbnails for the current user, newest first |
| `GET` | `/api/user/thumbnail/:id` | Yes | Fetch one owned thumbnail |

### `POST /api/thumbnail/generate` Payload

| Field | Source in Client | Notes |
| --- | --- | --- |
| `title` | Required text input | Used as the main thumbnail topic |
| `prompt` | Optional textarea | Additional generation details |
| `style` | Style selector | `Bold & Graphic`, `Minimalist`, `Photorealistic`, `Illustrated`, `Tech/Futuristic` |
| `aspect_ratio` | Aspect selector | Client options: `16:9`, `1:1`, `9:16` |
| `color_scheme` | Color selector | `vibrant`, `sunset`, `ocean`, `forest`, `purple`, `monochrome`, `neon`, `pastel` |
| `text_overlay` | Client sends `true` | Stored on the thumbnail document |

---

## 🧬 Data Models

<details>
<summary><strong>👤 User</strong></summary>

| Field | Type | Notes |
| --- | --- | --- |
| `name` | `string` | Required, trimmed |
| `email` | `string` | Required, unique, lowercase, trimmed |
| `password` | `string` | Required, bcrypt hashed |
| `createdAt` / `updatedAt` | `Date` | Added by Mongoose timestamps |

</details>

<details>
<summary><strong>🖼️ Thumbnail</strong></summary>

| Field | Type | Notes |
| --- | --- | --- |
| `userId` | `string` | Required, references the owner |
| `title` | `string` | Required, trimmed |
| `description` | `string` | Optional |
| `style` | `string` | Required enum |
| `aspect_ratio` | `string` | Enum with default `16:9` |
| `color_scheme` | `string` | Optional enum |
| `text_overlay` | `boolean` | Default `false` |
| `image_url` | `string` | Cloudinary URL, default empty string |
| `prompt_used` | `string` | Stored from request prompt |
| `user_prompt` | `string` | Stored from request prompt |
| `isGenerating` | `boolean` | Default `true` |
| `createdAt` / `updatedAt` | `Date` | Added by Mongoose timestamps |

</details>

---

## 🔐 Environment Variables

### Server `.env`

| Variable | Required | Used For |
| --- | --- | --- |
| `MONGODB_URL` | Yes | MongoDB connection and Mongo-backed session storage |
| `SESSION_SECRET` | Yes | Express session signing secret |
| `NVIDIA_API_KEY` | Yes for generation | Authorization for NVIDIA NIM image generation |
| `CLOUDINARY_URL` | Yes for upload | Cloudinary SDK configuration |
| `NODE_ENV` | No | Enables production cookie settings when set to `production` |
| `PORT` | No | Backend port; defaults to `3000` |
| `CLIENT_URL` | No | Allowed CORS origin |
| `CLIENT_URLS` | No | Comma-separated allowed CORS origins |

### Client `.env`

| Variable | Required | Used For |
| --- | --- | --- |
| `VITE_BASE_URL` | Yes | Axios base URL for backend API requests |

Example:

```env
# server/.env
NODE_ENV=development
PORT=3000
MONGODB_URL=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
CLIENT_URL=http://localhost:5173
CLIENT_URLS=http://localhost:5173
NVIDIA_API_KEY=your_nvidia_api_key
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

```env
# client/.env
VITE_BASE_URL=http://localhost:3000
```

---

## ⚙️ Installation Steps

### 1. Clone and Install

```bash
git clone <repository-url>
cd thumblify
```

```bash
cd server
npm install
```

```bash
cd ../client
npm install
```

### 2. Configure Environment

Create `server/.env` and `client/.env` using the variables listed above.

### 3. Start Development Servers

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

Open the frontend at:

```text
http://localhost:5173
```

---

## 📜 Available Scripts

| App | Script | Description |
| --- | --- | --- |
| Client | `npm run dev` | Start Vite dev server |
| Client | `npm run build` | Build frontend into `dist/` |
| Client | `npm run lint` | Run ESLint |
| Client | `npm run preview` | Preview the production frontend build |
| Server | `npm run dev` | Run API with nodemon and `tsx` |
| Server | `npm run server` | Same command as `npm run dev` |
| Server | `npm run build` | Compile TypeScript with `tsc` |
| Server | `npm start` | Run `node dist/server.js` |

---

## 🐳 Docker Setup

The repository includes:

| File | Current Implementation |
| --- | --- |
| `docker-compose.yml` | Builds `client` and `server`, maps frontend `5173:5173`, maps backend `4000:4000`, and loads `./server/.env` for backend |
| `client/Dockerfile` | Uses `node:22-alpine`, installs dependencies, exposes `5173`, runs Vite dev server with `--host` |
| `server/Dockerfile` | Currently has the same contents as the client Dockerfile: exposes `5173` and runs `npm run dev -- --host` |

Run with:

```bash
docker compose up --build
```

Current Docker-related implementation notes:

| Item | Observed State |
| --- | --- |
| Frontend container | Matches Vite dev server usage on port `5173` |
| Backend compose port | Maps host/container `4000:4000` |
| Backend app default port | `PORT` env var or `3000` |
| Backend Dockerfile | Does not run the compiled production server |

Because the backend port depends on `PORT`, ensure `server/.env` matches the compose mapping if using Docker:

```env
PORT=4000
```

---

## 🚀 Deployment Details

### Render Backend

`render.yaml` defines one web service:

| Setting | Value |
| --- | --- |
| Service name | `thumblify-api` |
| Runtime | Node |
| Root directory | `server` |
| Plan | Free |
| Build command | `npm install && npm run build` |
| Start command | `npm start` |
| Health check path | `/health` |

Render environment variables declared in `render.yaml`:

```text
NODE_ENV=production
MONGODB_URL
SESSION_SECRET
CLIENT_URL
CLIENT_URLS
NVIDIA_API_KEY
CLOUDINARY_URL
```

In production, the backend sets session cookies with:

| Cookie Setting | Production Value |
| --- | --- |
| `sameSite` | `none` |
| `secure` | `true` |
| `httpOnly` | `true` |
| `maxAge` | 7 days |

### Vercel Frontend

`client/vercel.json` rewrites all routes to `index.html`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Use:

| Setting | Value |
| --- | --- |
| Root directory | `client` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Required env var | `VITE_BASE_URL=<deployed-backend-url>` |

### Static SPA Redirects

`client/public/_redirects` contains:

```text
/* /index.html 200
```

This supports SPA fallback routing on platforms that use Netlify-style redirects.

---

## 🔄 Thumbnail Generation Flow

```mermaid
sequenceDiagram
  participant U as User
  participant C as React Client
  participant A as Express API
  participant M as MongoDB
  participant N as NVIDIA NIM
  participant CL as Cloudinary

  U->>C: Submit title, prompt, style, ratio, color
  C->>A: POST /api/thumbnail/generate
  A->>M: Create thumbnail with isGenerating=true
  A->>N: Request FLUX image generation
  N-->>A: Return base64 image or image URL
  A->>CL: Upload generated image
  CL-->>A: Return secure URL
  A->>M: Save image_url and isGenerating=false
  A-->>C: Return thumbnail document
  C->>A: GET /api/user/thumbnail/:id
  A-->>C: Return saved thumbnail
```

---

## 🧪 Verification

The implementation includes lint/build scripts, but no dedicated test suite is present in the repository.

Useful checks:

```bash
cd client
npm run lint
npm run build
```

```bash
cd server
npm run build
```

---

## 📄 License

The server package declares the project license as `ISC`.
