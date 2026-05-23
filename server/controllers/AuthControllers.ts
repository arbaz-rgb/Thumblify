import { Request, Response } from "express";
import User from "../model/User.js";
import bcrypt from "bcrypt";

const logAuthDebug = (event: string, details: Record<string, unknown>) => {
  console.log(`[auth:${event}]`, details);
};

//Controller for the User registration

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    logAuthDebug("register:body", {
      body: {
        ...req.body,
        password: password ? "[redacted]" : password,
      },
      contentType: req.headers["content-type"],
      origin: req.headers.origin,
    });

    if (!name || !email || !password) {
      logAuthDebug("register:validation_failed", {
        hasName: Boolean(name),
        hasEmail: Boolean(email),
        hasPassword: Boolean(password),
      });

      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    //find user by email

    const user = await User.findOne({ email });

    if (user) {
      logAuthDebug("register:validation_failed", {
        reason: "user_already_exists",
        email,
      });

      return res.status(400).json({ message: "User already exists" });
    }

    //Encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    //setting user data in session

    req.session.isLoggedIn = true;
    req.session.userId = newUser._id.toString();

    return res.json({
      message: "Account created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

//Controller for the user login

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    logAuthDebug("login:body", {
      body: {
        ...req.body,
        password: password ? "[redacted]" : password,
      },
      contentType: req.headers["content-type"],
      origin: req.headers.origin,
    });

    if (!email || !password) {
      logAuthDebug("login:validation_failed", {
        hasEmail: Boolean(email),
        hasPassword: Boolean(password),
      });

      return res.status(400).json({ message: "Email and password are required" });
    }

    //find user by email

    const user = await User.findOne({ email });

    if (!user) {
      logAuthDebug("login:auth_failed", {
        reason: "user_not_found",
        email,
      });

      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      logAuthDebug("login:auth_failed", {
        reason: "password_mismatch",
        userId: user._id.toString(),
        email,
      });

      return res.status(400).json({ message: "Invalid email or password" });
    }

    //setting user data in session

    req.session.isLoggedIn = true;
    req.session.userId = user._id.toString();

    logAuthDebug("login:success", {
      userId: user._id.toString(),
      sessionId: req.sessionID,
    });

    return res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Controllers For User Logout

export const logoutUser = async (req: Request, res: Response) => {
  req.session.destroy((error: any) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  });

  return res.json({ message: "Logout successful" });
};

// Controllers For User Verify
export const verifyUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(400).json({ message: "Invalid user" });
    }

    return res.json({ user });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
