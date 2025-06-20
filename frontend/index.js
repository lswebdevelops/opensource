// index.js
async function getGeneratedText() {
  try {
    const response = await fetch('http://localhost:3000/api/hf/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: "The definition of machine learning inference is " })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      document.getElementById('response-text').textContent = `Error: ${errorData.error}`;
      return;
    }
    
    const data = await response.json();
    console.log('Full response:', data); // Debug log
    
    // Handle conversational response format
    let generatedText;
    if (data.conversation && data.conversation.generated_responses && data.conversation.generated_responses.length > 0) {
      generatedText = data.conversation.generated_responses[data.conversation.generated_responses.length - 1];
    } else if (data.generated_text) {
      generatedText = data.generated_text;
    } else {
      generatedText = JSON.stringify(data, null, 2); // Show formatted raw response for debugging
    }
    
    document.getElementById('response-text').textContent = generatedText;
    
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('response-text').textContent = 'Error: Could not reach server.';
  }
}

// Call the function when page loads
getGeneratedText();