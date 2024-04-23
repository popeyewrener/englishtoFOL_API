const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const fs = require('fs');
const env = require('dotenv').config();  

// Define the path to the .txt file
const contextPath = './context.txt';
const primingPath = './priming.txt';

// Read the file asynchronously

  
const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.GOOGLE_API_KEY;
  
async function run() {
    context = "";
    priming = "";
    fs.readFile(primingPath, 'utf8', (err, data) => {
        if (err) {
            // Handle the error if the file cannot be read
            console.error('Error reading file:', err);
        } else {
            
            priming = data;
        }
    });
    fs.readFile(contextPath, 'utf8', (err, data) => {
        if (err) {
            // Handle the error if the file cannot be read
            console.error('Error reading file:', err);
        } else {
            
            context = data;
        }
    });
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
    };

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];
    const prompt = "First-Order Predicate Logic: Every apple is red";
    const final_prompt = priming + context + prompt;

    

    const parts = [
        {text: final_prompt},

    ];

    const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig,
        safetySettings,
    });

    const response = result.response;
    console.log(response.text());
}

run();