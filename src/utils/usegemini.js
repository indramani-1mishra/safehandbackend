const { GoogleGenAI } = require("@google/genai");
const { GEMINI_API_KEY } = require("../config/serverConfig");

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function genrateUniqueGKQuestion(retries = 3) {
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

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt
            });

            let text = response.text;

            // 🧠 Clean response (important)
            text = text.replace(/```json|```/g, "").trim();

            const data = JSON.parse(text);

            console.log("✅ GK Questions generated successfully.");
            console.log(data);
            return data;

        } catch (err) {
            if (err.status === 429 && attempt < retries) {
                const waitSec = Math.pow(2, attempt) * 15; // 30s, 60s, 120s
                console.warn(`⚠️ Gemini rate limit hit (attempt ${attempt}/${retries}). Retrying in ${waitSec}s...`);
                await new Promise(resolve => setTimeout(resolve, waitSec * 1000));
            } else if (err instanceof SyntaxError) {
                console.error("❌ JSON Parse Error:", err.message);
                return null;
            } else {
                console.error(`❌ Gemini API Error (attempt ${attempt}/${retries}):`, err.message || err);
                if (attempt >= retries) return null;
            }
        }
    }
    return null;
}

module.exports = {
    genrateUniqueGKQuestion
}
