import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CITY_COORDS: Record<string, {latitude: number, longitude: number}> = {
  'Bali, Indonesia': { latitude: -8.3405, longitude: 115.0920 },
  'Jakarta, Indonesia': { latitude: -6.2088, longitude: 106.8456 },
  'Kuala Lumpur, Malaysia': { latitude: 3.1390, longitude: 101.6869 },
  'Singapore': { latitude: 1.3521, longitude: 103.8198 },
  'Toronto, Canada': { latitude: 43.651070, longitude: -79.347015 },
  'Vancouver, Canada': { latitude: 49.2827, longitude: -123.1207 },
  'New York, USA': { latitude: 40.7128, longitude: -74.0060 },
  'Los Angeles, USA': { latitude: 34.0522, longitude: -118.2437 }
};

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

export const getNearbyDestinations = async (location: string) => {
  const coords = CITY_COORDS[location] || { latitude: -6.2088, longitude: 106.8456 }; // Default Jakarta
  
  try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Suggest 3 specific, popular driving destinations or attractions near ${location} that would be great to visit with a rental car. Provide a 1 sentence description for each.`,
          config: {
              tools: [{ googleMaps: {} }],
              toolConfig: {
                  retrievalConfig: {
                      latLng: coords
                  }
              }
          }
      });
      
      return {
          text: response.text || "Explore the city with your car!",
          chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };
  } catch (e) {
      console.error("Gemini Maps Grounding failed", e);
      return { text: "Could not load suggestions.", chunks: [] };
  }
}