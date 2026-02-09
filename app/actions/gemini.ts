'use server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateGroceryList(imageBase64: string | null, description: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY is not set");
        return [];
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        let prompt = "Analyze the input and generate a structured grocery list of items the user is likely to need. Return ONLY a valid JSON array of objects with 'name' (string) and 'quantity' (string, e.g., '1L', '2x') properties. Do not wrap in markdown code blocks.";

        const parts: any[] = [];

        if (description) {
            parts.push(description);
        }

        if (imageBase64) {
            // Remove header if present (e.g., "data:image/jpeg;base64,")
            const base64Data = imageBase64.split(',')[1] || imageBase64;

            parts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg", // Assuming JPEG for simplicity, can abstract
                },
            });
            prompt += " Analyze the image (refrigerator/pantry) to see what is missing or low.";
        }

        parts.push(prompt);

        const result = await model.generateContent(parts);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown if Gemini adds it despite instruction
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Error generating grocery list:", error);
        return [];
    }
}

export async function getNutritionInfo(itemName: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY is missing from environment");
        throw new Error("GEMINI_API_KEY is not set");
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `Estimate the calories and protein content for: "${itemName}". Return ONLY a valid JSON object with 'calories' (string, e.g., '120 kcal') and 'protein' (string, e.g., '10 g') properties. If unknown, return reasonable estimates. Do not wrap in markdown code blocks.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log(`Gemini Nutrition Response for ${itemName}:`, text);

        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            return JSON.parse(jsonString);
        } catch (parseError) {
            console.error("Failed to parse Gemini response:", text);
            // Attempt to extract JSON if it's buried in text
            const match = text.match(/\{[\s\S]*\}/);
            if (match) {
                return JSON.parse(match[0]);
            }
            throw parseError;
        }

    } catch (error) {
        console.error("Error fetching nutrition info:", error);
        return { calories: '???', protein: '???' };
    }
}

export async function chatWithGemini(messages: { role: 'user' | 'model'; content: string }[]) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY is not set");
        return "I'm sorry, I'm having trouble connecting to my brain right now. Please check the API key configuration.";
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const history = messages.slice(0, -1).map(m => ({
            role: m.role,
            parts: [{ text: m.content }],
        }));

        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const lastMessage = messages[messages.length - 1];
        const result = await chat.sendMessage(lastMessage.content);
        const response = await result.response;
        const text = response.text();

        return text;

    } catch (error) {
        console.error("Error in chatWithGemini:", error);
        return "I'm having a bit of trouble thinking right now. Error: " + (error instanceof Error ? error.message : String(error));
    }
}
