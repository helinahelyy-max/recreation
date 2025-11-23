import { GoogleGenAI } from "@google/genai";
import { UploadedImage, LightingOptions } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PROMPT_TEMPLATE = `
Your task is to combine two images into a single, realistic AI-generated image.

Merge them seamlessly so the final image looks natural and cohesive — not like a collage.
- Use the main subject from Image 1.
- Use the background or environment from Image 2.
- Match lighting, color tones, and perspective for realism.
- Blend shadows, edges, and textures smoothly.

IMPORTANT: The final output image MUST have an aspect ratio of {ASPECT_RATIO}.

The final result should look like a genuine photograph, with a consistent style and atmosphere.

Apply the following lighting and style customizations:
{CUSTOMIZATIONS}
`;

const generateLightingPrompt = (options: LightingOptions): string => {
  const {
      ambientLightColor,
      ambientLightIntensity,
      directionalLightColor,
      directionalLightIntensity,
      lightDirection,
      shadowIntensity,
  } = options;

  return `
- Apply the following lighting conditions precisely:
- Ambient Light: A soft, subtle ambient light with the color ${ambientLightColor} and an intensity of ${Math.round(ambientLightIntensity * 100)}%.
- Directional Light: A primary directional light source with the color ${directionalLightColor} and a strong intensity of ${Math.round(directionalLightIntensity * 100)}%. This light should originate from the ${lightDirection.replace('-', ' ')}.
- Shadows: Render shadows with an intensity of ${Math.round(shadowIntensity * 100)}%. Higher intensity means darker, more defined shadows.
  `;
};

export const generateMergedImage = async (
  subjectImage: UploadedImage,
  backgroundImage: UploadedImage,
  customizations: string,
  aspectRatio: string,
  lightingOptions: LightingOptions
): Promise<string> => {
  const lightingPrompt = generateLightingPrompt(lightingOptions);
  const fullCustomizations = `${lightingPrompt}\n- Additional style notes from user: ${customizations}`;
  
  const promptWithRatio = PROMPT_TEMPLATE.replace('{ASPECT_RATIO}', aspectRatio);
  const fullPrompt = promptWithRatio.replace('{CUSTOMIZATIONS}', fullCustomizations);
  
  const model = 'gemini-2.5-flash-image';
  
  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              text: 'Image 1 (Subject):'
            },
            {
              inlineData: {
                data: subjectImage.base64,
                mimeType: subjectImage.mimeType,
              },
            },
            {
              text: 'Image 2 (Background):'
            },
            {
              inlineData: {
                data: backgroundImage.base64,
                mimeType: backgroundImage.mimeType,
              },
            },
            {
              text: fullPrompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
          }
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
    }
    
    throw new Error("No image was generated in the response.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("The AI model failed to generate an image. Please try again.");
  }
};