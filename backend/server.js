// backend/server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { HfInference } = require("@huggingface/inference");

const app = express();
const port = process.env.PORT || 3000;

// Init HuggingFace client
const hf = new HfInference(process.env.HF_TOKEN);

console.log(hf);

app.use(cors());
app.use(express.json());

app.post("/api/hf/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Missing "prompt" in request body' });
    }

    // Para geração de texto, use um modelo como: "HuggingFaceH4/zephyr-7b-beta"
    const model = "HuggingFaceH4/zephyr-7b-beta";

    const result = await hf.textGeneration({
      model,
      inputs: prompt,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.7,
      },
    });

    res.json(result);
  } catch (error) {
    console.error("Error generating text:", error.message);
    res.status(500).json({ error: error.message });
  }
});





app.get("/", (req, res) => {
  res.send("HuggingFace API backend is running.");
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
