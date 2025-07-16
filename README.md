# AI Assistant - ChatGPT-like Interface

A modern, dark-mode chat interface built with React and Vite that allows you to ask questions and upload PDF files for AI-powered responses.

## Features

- 🤖 **ChatGPT-like Interface**: Clean, modern chat interface with dark mode
- 📄 **PDF Upload**: Upload PDF files and ask questions about their content
- 💬 **Real-time Chat**: Send messages and receive responses
- 🌙 **Dark Mode**: Beautiful dark theme optimized for long conversations
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Fast & Lightweight**: Built with Vite for quick development and fast builds

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Configuration

### API Configuration

The application is configured to work with a FastAPI backend:

- **Base URL**: `http://localhost:8000`
- **Question Route**: `/ask` (POST)
- **Upload Route**: `/upload` (POST)

The API is already configured and ready to use. If you need to modify the endpoints or add authentication:

1. Open `src/utils/api.js` to modify the API configuration
2. Update the `API_BASE_URL` if your FastAPI runs on a different port
3. Add any required headers (API keys, etc.) in the fetch requests

For testing without the backend, you can switch to mock responses in `src/App.jsx`:

```javascript
// Comment out the real API call:
// const response = await sendMessage(inputMessage, uploadedFile)

// Uncomment the mock API call:
const response = await mockApiCall(inputMessage, uploadedFile)
```

### API Response Format

Your API should return responses in this format:

```json
{
  "success": true,
  "response": "Your AI response here",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Usage

1. **Ask Questions**: Type your question in the input field and press Enter
2. **Upload PDFs**: Click the 📎 button to upload a PDF file
3. **Send Messages**: Press Enter to send, or Shift+Enter for a new line
4. **View History**: All messages are displayed in the chat history

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies Used

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **ESLint** - Code linting

## Customization

### Styling
- Modify `src/index.css` for global styles
- Update `src/App.css` for component-specific styles
- Customize Tailwind classes in the components

### Features
- Add new message types in `src/App.jsx`
- Extend API functionality in `src/utils/api.js`
- Add authentication or user management

## License

This project is open source and available under the MIT License.
