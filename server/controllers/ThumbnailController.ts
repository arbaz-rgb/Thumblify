import { Request, Response } from "express";
import Thumbnail from "../model/Thumbnail.js";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import session from "express-session";
import axios from "axios";

const stylePrompts = {
  "Bold & Graphic":
    "eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style",

  "Tech/Futuristic":
    "futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere",

  Minimalist:
    "minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point",

  Photorealistic:
    "photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field",

  Illustrated:
    "illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style",
};

const colorSchemeDescriptions = {
  vibrant:
    "vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette",

  sunset:
    "warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow",

  forest:
    "natural green tones, earthy colors, calm and organic palette, fresh atmosphere",

  neon: "neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow",

  purple:
    "purple-dominant color palette, magenta and violet tones, modern and stylish mood",

  monochrome:
    "black and white color scheme, high contrast, dramatic lighting, timeless aesthetic",

  ocean:
    "cool blue and teal tones, aquatic color palette, fresh and clean atmosphere",

  pastel:
    "soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic",
};
export const generateThumbnail = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session;

    const {
      title,
      prompt: user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
    } = req.body;

    const thumbnail = await Thumbnail.create({
      userId,
      title,
      prompt_used: user_prompt,
      user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      isGenerating: true,
    });

    /////

    const styleText =
      stylePrompts[style as keyof typeof stylePrompts] ||
      "professional thumbnail";

    const colorText =
      colorSchemeDescriptions[
        color_scheme as keyof typeof colorSchemeDescriptions
      ] || "balanced color scheme";
    // creating a prompt

    let prompt = `Create a ${styleText} for: "${title}".`;

    if (color_scheme) {
      prompt += ` Use a ${colorText} color scheme.`;
    }

    if (user_prompt) {
      prompt += ` Additional details: ${user_prompt}.`;
    }

    prompt += ` The thumbnail should be ${aspect_ratio}, visually stunning, and designed to maximize click-through rate. Make it bold, professional, and impossible to ignore.`;

    //generater the image using the ai models
    const encodedPrompt = encodeURIComponent(prompt);

    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
    // download image

    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const finalBuffer = Buffer.from(imageResponse.data);

    const filename = `final-output-${Date.now()}.png`;
    const finalPath = path.join("images", filename);

    //create the image dir if it doesnot exist
    fs.mkdirSync("images", { recursive: true });
    fs.writeFileSync(finalPath, finalBuffer);

    const uploadResult = await cloudinary.uploader.upload(finalPath, {
      resource_type: "image",
    });

    // save cloudinary image url in DB
    thumbnail.image_url = uploadResult.secure_url;

    // generation completed
    thumbnail.isGenerating = false;

    // save updated thumbnail document
    await thumbnail.save();

    // send response to frontend
    res.json({
      message: "Thumbnail Generated",
      thumbnail,
    });

    // remove local image file after upload
    fs.unlinkSync(finalPath);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

/// controller function  for the delete the thumbnail

export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.session;

    const deletedThumbnail = await Thumbnail.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!deletedThumbnail) {
      return res.status(404).json({
        message: "Thumbnail not found",
      });
    }

    return res.status(200).json({
      message: "Thumbnail deleted successfully",
    });
  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};
