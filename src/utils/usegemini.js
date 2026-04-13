const { GoogleGenAI } = require("@google/genai");
const { GEMINI_API_KEY } = require("../config/serverConfig");

if (!GEMINI_API_KEY) {
    console.error("⚠️ WARNING: GEMINI_API_KEY is not set in .env file! GK Question generation will not work.");
}

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

async function genrateUniqueGKQuestion(retries = 3) {
    if (!ai) {
        console.error("❌ Gemini AI client not initialized. Set GEMINI_API_KEY in .env file.");
        return null;
    }

    const prompt = `
Generate 5 GK questions from UP Police Constable, UP SI, and PCS exams.

Return ONLY valid JSON in this exact format:

{
  "questions": [
    {
      "question": "",
      "option1": "",
      "option2": "",
      "option3": "",
      "option4": "",
      "answer": "",
      "explanation": ""
    }
  ],
  "message": ""
}

Rules:
- Questions must be real exam-level GK
- All content in Hindi
- Message should include:
  - Greeting based on current time (Good Morning / Evening / Night in Hindi)
  - Current date (dd/mm/yyyy)
  - One motivational quote in Hindi
- DO NOT add any extra text outside JSON
`;

    // Fallback models — agar ek busy ho to doosra try karo
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

    for (const modelName of models) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                console.log(`🔄 Trying model: ${modelName} (attempt ${attempt}/${retries})`);

                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: prompt
                });

                let text = response.text;

                // 🧠 Clean response (important)
                text = text.replace(/```json|```/g, "").trim();

                const data = JSON.parse(text);

                console.log(`✅ GK Questions generated successfully using ${modelName}.`);
                console.log(data);
                return data;

            } catch (err) {
                const errMsg = err.message || JSON.stringify(err);

                // 429 (rate limit) or 503 (overloaded) — wait and retry
                if ((err.status === 429 || err.status === 503 || errMsg.includes("503") || errMsg.includes("UNAVAILABLE")) && attempt < retries) {
                    const waitSec = Math.pow(2, attempt) * 10; // 20s, 40s
                    console.warn(`⚠️ ${modelName} unavailable (attempt ${attempt}/${retries}). Retrying in ${waitSec}s...`);
                    await new Promise(resolve => setTimeout(resolve, waitSec * 1000));
                } else if (err instanceof SyntaxError) {
                    console.error("❌ JSON Parse Error:", err.message);
                    break; // try next model
                } else {
                    console.error(`❌ ${modelName} Error (attempt ${attempt}/${retries}):`, errMsg);
                    if (attempt >= retries) break; // try next model
                }
            }
        }
        console.log(`⏭️ Switching to next model...`);
    }

    console.error("❌ All models failed. Could not generate GK questions.");
    return null;
}

module.exports = {
    genrateUniqueGKQuestion
}
