# Explainability Assistant Frontend

A Next.js-based web application providing an interactive conversational interface to the Explainability Assistant backend. The frontend enables users to chat with AI assistants powered by Large Language Models (LLMs) to understand and analyze machine learning models.

## 🚀 Features

- **Conversational Interface**: A modern chat UI for interacting with the AI assistant.
- **Context-Aware**: Sends current conversation history to the backend for assistant responses.
- **Access-Code Login**: Supports demo access via configured access codes and signed session cookies.
- **Backend Integration**: Seamlessly communicates with the Explainability Assistant Backend via REST APIs.
- **Responsive Design**: Clean and usable styling across devices.

## 🛠️ Tech Stack

- **Framework**: Next.js
- **Package Manager**: npm
- **Styling**: CSS Modules
- **Integration**: REST APIs to backend

## 📋 Prerequisites

- Node.js (version 18 or higher recommended)
- npm or yarn

## 🔧 Installation

### Local Development Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd explainability-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the root directory. You can use `.env.example` as a template. If the backend is running locally, use the default values:
   
   ```bash
   BACKEND_HOST="http://127.0.0.1"
   BACKEND_PORT="8080" # Make sure this matches your backend port (default: 8080 or 5000)
   DEMO_ACCESS_CODES='{"example1":"Energy Consumption","example2":"Heart Disease"}'
   SESSION_SECRET="replace-with-a-long-random-secret"
   ```

   `DEMO_ACCESS_CODES` should be a JSON object that maps each access code to one of the supported demo chat use cases.
   `SESSION_SECRET` is used to sign and verify the frontend session cookie.

## 🏃 Running the Application

### Start Development Server

Start the Next.js development server:

```bash
npm run dev
```

### Accessing the App

Once running, navigate to the demo access page in your browser and enter a valid access code, or open a shareable demo link with the code embedded in the URL:

- **Demo Access**: [http://localhost:3000/demo](http://localhost:3000/demo)
- **Shared Demo Link**: `http://localhost:3000/demo/<accessCode>`
- **Protected Chat**: [http://localhost:3000/chat](http://localhost:3000/chat)

## 📡 API Integration

The frontend primarily communicates with the backend via the `/getAssistantResponse` endpoint. It structures user input and current conversation state before submitting to the backend API.

For assistant requests, the frontend also sends observability headers to the backend:

- `X-Session-ID`: stable per chat session in the browser
- `X-User-ID`: the access code used to log in
- `X-Request-ID`: a unique id for each backend request
