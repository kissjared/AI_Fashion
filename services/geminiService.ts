import { GoogleGenAI } from "@google/genai";
import { cleanBase64, getMimeType } from "../utils/imageHelper";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Use the Nano Banana model (gemini-2.5-flash-image)
const MODEL_NAME = 'gemini-2.5-flash-image';

/**
 * Generate a clothing image based on text prompt.
 */
export const generateClothingImage = async (prompt: string): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("未配置 API Key");

  const fullPrompt = `Professional fashion photography, flat lay photo of ${prompt} clothing, clean white background, studio lighting, high resolution, 4k, highly detailed texture.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [{ text: fullPrompt }]
      },
      config: {
         imageConfig: {
            aspectRatio: "1:1",
            // imageSize: "1K" // Optional, might not be supported on all variants yet
         }
      }
    });

    // Iterate to find image part
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("未生成有效的图片数据");
  } catch (error) {
    console.error("Gemini API Error (Clothing):", error);
    throw error;
  }
};

/**
 * Generate the Try-On result.
 * Input: Person Base64, Cloth Base64
 */
export const generateTryOnResult = async (personBase64: string, clothBase64: string): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("未配置 API Key");

  // Construct the prompt to guide the model to perform a "swap" or "generation" based on reference.
  const prompt = `Generate a high-quality, photorealistic full-body photo of the person shown in the first image wearing the clothing shown in the second image. 
  
  Requirements:
  1. Preserve the identity, facial features, pose, and body shape of the person from the first image exactly.
  2. Fit the clothing from the second image naturally onto the person.
  3. Maintain high resolution and realistic lighting.
  4. Clean background or background matching the original person's photo.
  5. Full body shot.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: getMimeType(personBase64),
              data: cleanBase64(personBase64)
            }
          },
          {
            inlineData: {
              mimeType: getMimeType(clothBase64),
              data: cleanBase64(clothBase64)
            }
          },
          { text: prompt }
        ]
      },
      config: {
          imageConfig: {
             aspectRatio: "3:4", // Portrait for full body
          }
      }
    });

     for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("未生成有效的试穿图片");
  } catch (error) {
    console.error("Gemini API Error (TryOn):", error);
    throw error;
  }
};