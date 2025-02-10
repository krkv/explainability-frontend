# XAI LLM chat frontend

## About

The purpose of this Next.js application is to provide an example frontend client to interact with XAI LLM backend over API.

The application sends current conversation history to the backend with every request for context.

## Development

Navigate to the root directory of the application.

### Install app dependencies

```
npm install
```

### Create .env file and set the HF token

You can use `.env.example` file as an example of a `.env` file.

If you are using the `explainability-backed` in development mode, you can keep the values from the `.env.example`.

```
BACKEND_HOST="http://127.0.0.1"
BACKEND_PORT="5000"
```

### Start dev server

```
npm run dev
```

### Navigate to the chat

http://localhost:3000/chat
