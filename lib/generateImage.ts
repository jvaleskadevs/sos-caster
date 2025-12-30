"use server";

type ImageRequestVeniceAPI = {
  // required
  prompt: string;
  // optional
  model: string;
  height?: number;
  width?: number;
  steps?: number;
  cfg_scale?: number;
  seed?: number;
  lora_strength?: number;
  safe_mode?: boolean;
  return_binary?: boolean;
  hide_watermark?: boolean;
  style_preset?: string;
  negative_prompt?: string;
  format?: "png" | "webp" | "jpeg";
}

const IMAGE_VENICE_API = "https://api.venice.ai/api/v1/image/generate";
const EDIT_IMAGE_VENICE_API = "https://api.venice.ai/api/v1/image/edit";

enum models {
  Fluently = "fluently-xl",
  StableDiffusion = "venice-sd35",
  Lustify = "lustify-sdxl",
  HiDream = "hidream",
  Waifu = "wai-Illustrious",
  Qwen = "qwen-image"
}

type GenerateImageProps = {
  prompt: string;
  model?: string; 
  steps?: number; 
  seed?: number;
  style?: string; 
  negativePrompt?: string; 
  isBanner?: boolean;
  isNsfw?: boolean;
  uploadImage?: string;
}

export async function generateImage({
  prompt,
  model,
  steps,
  seed,
  style,
  negativePrompt,
  isBanner = false,
  isNsfw = false,
  uploadImage = ""
}: GenerateImageProps): Promise<string> {
  //console.log(prompt);
  if (!prompt) return "";
  try {  
    const currentModel = isNsfw ? models.Lustify : (model ?? models.Qwen);
    const currentSteps = currentModel === models.Qwen ? 8 :
      (currentModel === models.StableDiffusion || currentModel === models.Waifu) ? 30 
        : (isNsfw ? 50 : (steps ?? 33));
    
    const requestBody: ImageRequestVeniceAPI = {
      model: currentModel,
      prompt: prompt,
      height: isBanner ? 480 : 1024,
      width: isBanner ? 1280 : 1024,
      steps: currentSteps,
      cfg_scale: 7.5,
      seed: seed ?? Math.floor(Math.random() * 9999999),
      lora_strength: 75,
      safe_mode: false,
      return_binary: false,
      hide_watermark: true,
      style_preset: (style && style !== "none" && style !== "CUSTOM") ? style : undefined,
      negative_prompt: negativePrompt ?? undefined,
      format: "png"
    } 
    
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VENICE_API_KEY}`, 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(!!uploadImage ? {
        prompt,
        image: uploadImage
      } : requestBody)
    };
    console.log(options.body);

    const response = await fetch(uploadImage ? EDIT_IMAGE_VENICE_API : IMAGE_VENICE_API, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OBIGEN: Failed to generate image", errorText);
      throw new Error(`OBIGEN: Failed to generate image: ${errorText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const imageData = await response?.json();
      return imageData?.images?.[0] ?? "";
    } else if (contentType?.includes('image/png')) {
      // edited image returns a file instead a json object
      const imageBuffer = await response?.arrayBuffer();
      const base64String = Buffer.from(imageBuffer).toString('base64');
      return base64String;
    }
    //`data:image/png;base64,${imageData?.images?.[0]}`; // base64
  } catch (err) {
    console.error("OBIGEN: Failed to generate image: ", err);
  }
  
  return "";
}
