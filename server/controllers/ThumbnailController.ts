import { Request, Response } from "express";
import Thumbnail from "../model/Thumbnail.js";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
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

const toNvidiaImageSize = (aspectRatio?: string) => {
  const sizes: Record<string, { width: number; height: number }> = {
    "1:1": { width: 1024, height: 1024 },
    "16:9": { width: 1344, height: 768 },
    "9:16": { width: 768, height: 1344 },
    "4:3": { width: 1152, height: 896 },
    "3:4": { width: 896, height: 1152 },
  };

  return sizes[aspectRatio || ""] || sizes["16:9"];
};

type NvidiaImageResult = {
  url?: string;
  b64_json?: string;
  base64?: string;
  image?: string;
};

type NvidiaImageResponse = NvidiaImageResult & {
  data?: NvidiaImageResult[];
  images?: NvidiaImageResult[];
  artifacts?: NvidiaImageResult[];
  output?: NvidiaImageResult[];
};

const NVIDIA_IMAGE_GENERATION_URL =
  "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell";

const getGeneratedImage = (response: NvidiaImageResponse) => {
  return (
    response.data?.[0] ||
    response.images?.[0] ||
    response.artifacts?.[0] ||
    response.output?.[0] ||
    response
  );
};

const getGeneratedImageBuffer = async (image: NvidiaImageResult) => {
  const base64Image = image.b64_json || image.base64 || image.image;

  if (base64Image) {
    console.log("NVIDIA returned a base64 image");
    return Buffer.from(
      base64Image.replace(/^data:image\/\w+;base64,/, ""),
      "base64",
    );
  }

  if (image.url) {
    console.log("NVIDIA returned an image URL:", image.url);
    const imageResponse = await axios.get(image.url, {
      responseType: "arraybuffer",
    });
    return Buffer.from(imageResponse.data);
  }

  throw new Error("NVIDIA NIM did not return image data");
};

export const generateThumbnail = async (req: Request, res: Response) => {
  let thumbnail: InstanceType<typeof Thumbnail> | null = null;
  let finalPath = "";

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

    thumbnail = await Thumbnail.create({
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

    if (!process.env.NVIDIA_API_KEY) {
      throw new Error("NVIDIA_API_KEY is missing in .env");
    }

    console.log("Generating thumbnail with NVIDIA FLUX");
    console.log("NVIDIA endpoint:", NVIDIA_IMAGE_GENERATION_URL);
    console.log("NVIDIA model:", "black-forest-labs/flux.1-schnell");

    const { width, height } = toNvidiaImageSize(aspect_ratio);
    const nvidiaResponse = await axios.post<NvidiaImageResponse>(
      NVIDIA_IMAGE_GENERATION_URL,
      {
        prompt,
        width,
        height,
        cfg_scale: 0,
        mode: "base",
        samples: 1,
        seed: 0,
        steps: 4,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 120000,
      },
    );

    console.log("NVIDIA image generation status:", nvidiaResponse.status);

    const generatedImage = getGeneratedImage(nvidiaResponse.data);
    const finalBuffer = await getGeneratedImageBuffer(generatedImage);

    const filename = `final-output-${Date.now()}.png`;
    finalPath = path.join("images", filename);

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
  } catch (error: any) {
    console.error("Thumbnail generation failed");
    console.error("Error message:", error?.message);

    if (axios.isAxiosError(error)) {
      console.error("Axios status:", error.response?.status);
      console.error("Axios response:", error.response?.data);
    } else {
      console.error(error);
    }

    if (thumbnail) {
      thumbnail.isGenerating = false;
      await thumbnail.save();
    }

    return res.status(500).json({
      message:
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to generate thumbnail",
    });
  } finally {
    if (finalPath && fs.existsSync(finalPath)) {
      fs.unlinkSync(finalPath);
    }
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
