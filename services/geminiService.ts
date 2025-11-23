import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCarDescription = async (make: string, model: string, year: number, location: string): Promise<string> => {
  try {
    const prompt = `
      Write a short, attractive, and professional listing description for a car rental application.
      Car: ${year} ${make} ${model}.
      Location: ${location}.
      Target Audience: Tourists and local travelers.
      Tone: Welcoming, trustworthy, and exciting.
      Length: Max 2 sentences.
      Do not include placeholders.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "A great car for your journey.";
  } catch (error) {
    console.error("Gemini generation failed", error);
    return `Experience the comfort of this ${year} ${make} ${model} in ${location}. Perfect for your trip!`;
  }
};

export const getCarHighlights = async (car: any): Promise<string[]> => {
  try {
    const prompt = `
      Analyze this car for a rental app and provide 3 short, punchy highlights (max 5 words each) explaining why it's a great choice.
      Car: ${car.year} ${car.make} ${car.model}
      Features: ${car.features?.join(', ')}
      Location: ${car.location}
      Price: ${car.pricePerDayIdr} IDR
      
      Return JSON format: { "highlights": ["highlight1", "highlight2", "highlight3"] }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            highlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || "{}");
    return json.highlights || ["Great value", "Comfortable ride", "Top rated host"];
  } catch (error) {
    console.error("Gemini highlights failed", error);
    return ["Perfect for city driving", "Fuel efficient", "Host recommended"];
  }
};

export const parseSearchQuery = async (query: string): Promise<{location: string, date: string} | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract the location and date intent from this car rental search query: "${query}". If no date is mentioned, ignore it. Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            location: { type: Type.STRING, description: "The city or place mentioned" },
            date: { type: Type.STRING, description: "The date mentioned, or empty string if none" }
          }
        }
      }
    });

    const json = JSON.parse(response.text || "{}");
    return json;
  } catch (error) {
    console.error("Gemini search parsing failed", error);
    return null;
  }
}