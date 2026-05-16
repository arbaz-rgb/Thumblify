import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import AuthRouter from "./routes/AuthRoutes.js";
import ThumbnailRouter from "./routes/ThumbnailRoutes.js";
import UserRouter from "./routes/UserRoutes.js";

declare module "express-session" {
  interface SessionData {
    isLoggedIn: boolean;
    userId: string;
  }
}

const app = express();

const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  ...allowedOrigins,
];

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required");
}

if (!process.env.MONGODB_URL) {
  throw new Error("MONGODB_URL is required");
}

await connectDB();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);

app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    name: "thumblify.sid",
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL as string,
      collectionName: "session",
    }),
  }),
);

app.use(express.json());

const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Server is Live!");
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", AuthRouter);
app.use("/api/thumbnail", ThumbnailRouter);
app.use("/api/user", UserRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
