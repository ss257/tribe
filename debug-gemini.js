require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function debugGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY is not set in .env file");
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    // Test exact nutrition prompt with Gemini 3 Flash Preview
    console.log("🔍 Testing Specific Prompt with 'gemini-3-flash-preview'...");

    // Explicitly using the model requested by user
    const modelName = "gemini-3-flash-preview";

    try {
        const model = genAI.getGenerativeModel({ model: modelName });

        const itemName = "1kg Chicken Breast";
        const prompt = `Estimate the calories and protein content for: "${itemName}". Return ONLY a valid JSON object with 'calories' (string, e.g., '120 kcal') and 'protein' (string, e.g., '10 g') properties. If unknown, return reasonable estimates. Do not wrap in markdown code blocks.`;

        console.log(`Prompting for: ${itemName}...`);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log(`\n--- Raw Response Start ---\n${text}\n--- Raw Response End ---`);

        // Test parsing logic simulating what's in app/actions/gemini.ts
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
            const json = JSON.parse(jsonString);
            console.log("\n✅ JSON Parsing Successful:", json);
            if (json.calories && json.protein) {
                console.log("✅ Data structure matches expectations.");
            } else {
                console.log("⚠️ JSON valid but missing keys:", json);
            }
        } catch (e) {
            console.error("\n❌ JSON Parsing Failed:", e.message);
            console.log("Attempting fallback regex extraction...");
            const match = text.match(/\{[\s\S]*\}/);
            if (match) {
                try {
                    const fallbackJson = JSON.parse(match[0]);
                    console.log("✅ Fallback Extraction Successful:", fallbackJson);
                } catch (err) {
                    console.error("❌ Fallback Extraction Failed:", err.message);
                }
            } else {
                console.error("❌ No JSON object found in text.");
            }
        }

    } catch (error) {
        console.error(`❌ Prompt Test Failed for ${modelName}:`);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Data: ${JSON.stringify(error.response.data)}`);
        }
        console.error(`   Message: ${error.message}`);
    }
}

debugGemini();
