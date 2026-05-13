import { Request, Response } from "express";
import Thumbnail from "../model/Thumbnail.js";

// Controller to get  users thumbnails
export const getUsersThumbnails = async (req: Request, res: Response) => {
  try {
    // Getting userId from session
    const { userId } = req.session;

    // Find thumbnails of that user
    // Sort by newest first
    const thumbnail = await Thumbnail.find({ userId }).sort({ createdAt: -1 });

    // Send response
    res.json({ thumbnail });
  } catch (error: any) {
    console.log(error);

    // Send error response
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getThumbnailbyId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session;
    const { id } = req.params;

    const thumbnail = await Thumbnail.findOne({
      userId,
      _id: id,
    });

    res.json({ thumbnail });
  } catch (error: any) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
