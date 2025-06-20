# Hugging Face Text Generation API

A simple web application that integrates with Hugging Face's Inference API to generate text using the Zephyr-7b-beta model. This project demonstrates how to build a basic chat interface with a Node.js backend and vanilla JavaScript frontend.

## Features

- 🤖 Text generation using Hugging Face's Zephyr-7b-beta model
- 🌐 Express.js REST API backend
- 🎯 Simple frontend interface
- 🔒 Environment variable configuration for API keys
- ⚡ Real-time text generation with proper error handling

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A [Hugging Face account](https://huggingface.co/) with an API token

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hf-text-generation.git
   cd hf-text-generation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   touch .env
   ```
   
   Add your Hugging Face API token:
   ```env
   HF_TOKEN=your_hugging_face_api_token_here
   PORT=3000
   ```

4. **Get your Hugging Face API Token**
   - Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
   - Create a new token with "Read" permissions
   - Copy the token to your `.env` file

## Usage

1. **Start the backend server**
   ```bash
   node backend/server.js
   ```
   
   The server will start on `http://localhost:3000`

2. **Open the frontend**
   - Open `index.html` in your web browser
   - Or serve it using a simple HTTP server:
     ```bash
     # Using Python 3
     python -m http.server 8080
     
     # Using Node.js http-server (install globally first: npm install -g http-server)
     http-server -p 8080
     ```

3. **Test the application**
   - The page will automatically generate a response to "Hello! How are you today?"
   - Check the browser console for debugging information

## Project Structure

```
├── backend/
│   └── server.js          # Express.js server with HF API integration
├── index.html             # Simple frontend interface
├── index.js               # Frontend JavaScript logic
├── .env                   # Environment variables (create this)
├── package.json           # Node.js dependencies
└── README.md             # This file
```

## API Endpoints

### POST `/api/hf/generate`

Generates text using the Hugging Face Zephyr-7b-beta model.

**Request Body:**
```json
{
  "prompt": "Your text prompt here"
}
```

**Response:**
```json
[
  {
    "generated_text": "AI-generated response text"
  }
]
```

## Configuration

The application uses the following configuration options:

- **Model**: `HuggingFaceH4/zephyr-7b-beta`
- **Max New Tokens**: 150
- **Temperature**: 0.7
- **Chat Template**: Uses Zephyr's system/user/assistant format

You can modify these parameters in `backend/server.js`:

```javascript
parameters: {
  max_new_tokens: 150,    // Maximum tokens to generate
  temperature: 0.7,       // Creativity level (0.0 - 1.0)
  return_full_text: false // Only return generated text
}
```

## Dependencies

### Backend
- `express` - Web framework for Node.js
- `cors` - Enable Cross-Origin Resource Sharing
- `dotenv` - Load environment variables from .env file

### Frontend
- Vanilla JavaScript (no additional dependencies)

## Troubleshooting

### Common Issues

1. **"Missing HF_TOKEN" error**
   - Make sure your `.env` file exists and contains a valid Hugging Face API token
   - Ensure the token has proper permissions

2. **Model loading timeout**
   - The Zephyr model may take time to load on first request
   - Wait a few moments and try again

3. **CORS errors**
   - Ensure your backend server is running on port 3000
   - Check that CORS is properly configured in the Express app

4. **Rate limiting**
   - Hugging Face has rate limits for free accounts
   - Consider upgrading to a paid plan for higher limits

### Debug Mode

To enable more detailed logging, add this to your server.js:

```javascript
console.log('Request body:', req.body);
console.log('HF API Response:', data);
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Hugging Face](https://huggingface.co/) for providing the Inference API
- [Zephyr-7b-beta](https://huggingface.co/HuggingFaceH4/zephyr-7b-beta) model by Hugging Face H4 team

## Resources

- [Hugging Face Inference API Documentation](https://huggingface.co/docs/api-inference/index)
- [Zephyr Model Card](https://huggingface.co/HuggingFaceH4/zephyr-7b-beta)
- [Express.js Documentation](https://expressjs.com/)

---

**Note**: This is a demo application. For production use, consider implementing proper authentication, rate limiting, input validation, and error handling.
