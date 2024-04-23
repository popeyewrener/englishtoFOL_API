const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const fs = require('fs');
const env = require('dotenv').config();  
const express = require('express');
const http = require('http');

// Define the path to the .txt file
const contextPath = './context.txt';
const primingPath = './priming.txt';

// Read the file asynchronously

  
const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.GOOGLE_API_KEY;
  
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const httpServer = http.createServer(app);
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

async function run() {
    
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
    //console.log(final_prompt);

    

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

const apicall = async (data) => {
    const {prompt}= data;
    let p = prompt;
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
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
    ];
     p = "First-Order Predicate Logic: "+p.toString();
     p2 = p.toString();
     
    const final_prompt = priming + context + p2;
    //console.log(final_prompt);

    

    const parts = [
        {text: final_prompt},

    ];

    const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig,
        safetySettings,
    });
    if (result.response.candidates[0].finishReason === "HARM_BLOCKED" || result.response.candidates[0].finishReason === "SAFETY"|| result.response.candidates[0].finishReason === "STOPPING_CRITERIA") {
        return "Sorry, I can't generate content based on the prompt. Please try another prompt."
    }

    return result.response.text();

};
//run();
app.post('/generate', async (req, res) => {
    const data = req.body;
    const response = await apicall(data);
  res.json({ response });
});

httpServer.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000');
});