const { GoogleGenerativeAI } = require("@google/generative-ai");
const apiKey = process.env.GEMINI_API_KEY;

async function listModels() {
    if (!apiKey) {
        console.error("No API KEY found");
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    // There isn't a direct listModels method on the client instance in some versions, 
    // but let's try a direct fetch if the SDK doesn't expose it easily, 
    // or just try a known working model like 'gemini-1.5-flash-latest'

    // Actually, let's just try to generate with 'gemini-1.5-flash-latest' directly here.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    try {
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-1.5-flash-latest");
        console.log(result.response.text());
    } catch (e) {
        console.log("Failed with gemini-1.5-flash-latest: " + e.message);

        // Try gemini-1.0-pro
        try {
            const model2 = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
            const result2 = await model2.generateContent("Hello");
            console.log("Success with gemini-1.0-pro");
            console.log(result2.response.text());
        } catch (e2) {
            console.log("Failed with gemini-1.0-pro: " + e2.message);
        }
    }
}

listModels();
