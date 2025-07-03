const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve frontend
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Simple text generation using the FREE HuggingFace Inference API
async function generateTextWithFreeAPI(model, prompt) {
  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HF_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.7,
        do_sample: true,
        return_full_text: false,
        pad_token_id: 50256 // For GPT models
      },
      options: {
        wait_for_model: true,
        use_cache: false
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  return result;
}

// Alternative: Use a simple mock API for testing
function generateMockResponse(prompt) {
  const responses = [
    `That's an interesting question about "${prompt}". Let me think about it...`,
    `Regarding "${prompt}", I would say that it's a fascinating topic that deserves more exploration.`,
    `You asked about "${prompt}". This is something that many people wonder about.`,
    `"${prompt}" is indeed worth discussing. There are many perspectives on this topic.`,
    `I appreciate you asking about "${prompt}". It's a thought-provoking subject.`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

app.post("/api/hf/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Missing "prompt" in request body' });
    }

    // Free models that work with the standard API (not Inference Providers)
    const freeModels = [
      "microsoft/DialoGPT-medium",
      "microsoft/DialoGPT-small",
      "gpt2",
      "distilgpt2",
      "facebook/blenderbot-400M-distill",
      "facebook/blenderbot_small-90M"
    ];

    let result = null;
    let successfulModel = null;
    let lastError = null;

    // Try each free model
    for (const model of freeModels) {
      try {
        console.log(`🔄 Trying free model: ${model}`);
        
        const response = await generateTextWithFreeAPI(model, prompt);
        
        // Handle different response formats
        if (Array.isArray(response) && response.length > 0) {
          result = {
            generated_text: response[0].generated_text || response[0].text || JSON.stringify(response[0])
          };
        } else if (response.generated_text) {
          result = { generated_text: response.generated_text };
        } else {
          result = { generated_text: JSON.stringify(response) };
        }
        
        successfulModel = model;
        console.log(`✅ Success with model: ${model}`);
        break;
        
      } catch (error) {
        console.log(`❌ Model ${model} failed: ${error.message}`);
        lastError = error;
        
        // If we get a specific error about model loading, wait and try again
        if (error.message.includes("loading") && !error.message.includes("403")) {
          console.log("⏳ Model is loading, waiting 3 seconds...");
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          try {
            const response = await generateTextWithFreeAPI(model, prompt);
            if (Array.isArray(response) && response.length > 0) {
              result = {
                generated_text: response[0].generated_text || response[0].text || JSON.stringify(response[0])
              };
            } else if (response.generated_text) {
              result = { generated_text: response.generated_text };
            } else {
              result = { generated_text: JSON.stringify(response) };
            }
            successfulModel = model;
            console.log(`✅ Success with model after waiting: ${model}`);
            break;
          } catch (retryError) {
            console.log(`❌ Retry failed for ${model}: ${retryError.message}`);
            continue;
          }
        }
        continue;
      }
    }

    // If all models failed, use mock response
    if (!result) {
      console.log("🤖 All models failed, using mock response");
      result = {
        generated_text: generateMockResponse(prompt),
        _mock: true
      };
      successfulModel = "mock";
    }

    res.json({
      ...result,
      _meta: {
        model: successfulModel,
        timestamp: new Date().toISOString(),
        isMock: successfulModel === "mock"
      }
    });
    
  } catch (error) {
    console.error("API Error:", error.message);
    
    // Always return a mock response as fallback
    res.json({
      generated_text: generateMockResponse(req.body.prompt || "your question"),
      _meta: {
        model: "mock",
        timestamp: new Date().toISOString(),
        isMock: true,
        error: error.message
      }
    });
  }
});

// Simple token test endpoint
app.get("/api/test-token", async (req, res) => {
  if (!process.env.HF_TOKEN) {
    return res.json({ 
      valid: false, 
      error: "No HF_TOKEN found in environment variables" 
    });
  }

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: "Hello",
        parameters: { max_new_tokens: 1 }
      })
    });

    if (response.ok) {
      res.json({ valid: true, status: "Token works with free API" });
    } else {
      const errorText = await response.text();
      res.json({ 
        valid: false, 
        error: `HTTP ${response.status}: ${errorText}`,
        suggestion: "Your token might not have the right permissions for the free Inference API"
      });
    }
  } catch (error) {
    res.json({ 
      valid: false, 
      error: error.message,
      suggestion: "Check your internet connection and token format"
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok",
    api: "Free HuggingFace Inference API (no Inference Providers)",
    timestamp: new Date().toISOString(),
    hasToken: !!process.env.HF_TOKEN,
    tokenPreview: process.env.HF_TOKEN ? 
      `${process.env.HF_TOKEN.substring(0, 7)}...` : 'Not provided'
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`🔑 Token available: ${!!process.env.HF_TOKEN}`);
  console.log(`📝 Using FREE HuggingFace Inference API (not Inference Providers)`);
  console.log(`💡 If models fail, app will use mock responses for testing`);
});