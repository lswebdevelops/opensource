const BACKEND_URL = window.location.hostname.includes("localhost")
  ? ""
  : "https://opensource-mj5g.onrender.com"; // ← CHANGE THIS
async function getGeneratedText() {
  const prompt = document.getElementById("prompt-input").value.trim();
  const responseElement = document.getElementById("response-text");
  const button = document.querySelector("button");

  if (!prompt) {
    responseElement.textContent = "Please enter a prompt.";
    return;
  }

  // Show loading state
  responseElement.textContent = "Generating response...";
  button.disabled = true;
  button.textContent = "Generating...";

  try {
    // 1. Generate text
    const response = await fetch(`${BACKEND_URL}/api/hf/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      responseElement.textContent = `Error: ${errorData.error}`;
      if (errorData.suggestion) {
        responseElement.textContent += `\n\nSuggestion: ${errorData.suggestion}`;
      }
      return;
    }

    const data = await response.json();
    let generatedText = "";

    // Handle different response formats
    if (data.generated_text) {
      // Standard text generation response
      generatedText = data.generated_text;
    } else if (data.generated_response) {
      // Conversational model response
      generatedText = data.generated_response;
    } else if (Array.isArray(data) && data.length > 0) {
      // Array response format
      generatedText =
        data[0].generated_text || JSON.stringify(data[0], null, 2);
    } else {
      // Fallback to raw JSON
      generatedText = JSON.stringify(data, null, 2);
    }

    responseElement.textContent = generatedText;
  } catch (error) {
    console.error("Error:", error);
    responseElement.textContent =
      "Error: Could not reach server. Make sure the server is running.";
  } finally {
    // Reset button state
    button.disabled = false;
    button.textContent = "Generate";
  }
}

// Add Enter key support
document
  .getElementById("prompt-input")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      getGeneratedText();
    }
  });

// Check server health on page load
async function checkServerHealth() {
  try {
    const response = await fetch("/api/health");
    const data = await response.json();
    console.log("Server health:", data);

    if (!data.hasToken) {
      document.getElementById("response-text").textContent =
        "Warning: No HuggingFace token detected. Please add HF_TOKEN to your .env file.";
    }
  } catch (error) {
    console.log("Could not check server health:", error.message);
  }
}

// Run health check when page loads
window.addEventListener("load", checkServerHealth);
