# AI IT Helpdesk Assistant

A simple web application that helps non-technical users troubleshoot common computer and IT problems using AI.

## Features

- Conversational interface for IT troubleshooting
- Asks one diagnostic question at a time
- Tracks conversation history and answers
- Provides simple, beginner-friendly instructions
- Generates end-of-session reports
- Recommends escalation to human IT support when appropriate

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript (Bootstrap)
- **Backend**: Python/Flask
- **AI Model**: Ollama (gemma4:31b-cloud)
- **Session Storage**: In-memory (dictionary)

## Setup Instructions

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the application**:
   ```bash
   cd it-helpdesk
   python app.py
   ```
   The app will run on [http://localhost:5000](http://localhost:5000)

3. **Ensure Ollama is running**:
   ```bash
   ollama serve
   ```
   This needs to be running on port 11434

## Environment Variables (Optional)

- `OLLAMA_URL`: Base URL for Ollama API (default: http://127.0.0.1:11434/api/chat)
- `OLLAMA_MODEL`: Model name to use (default: gemma4:31b-cloud)

## AI Prompt Engineering

The AI assistant is guided by a YAML prompt template that enforces:
- Beginner-friendly explanations
- One question at a time
- Clear tracking of troubleshooting steps
- Distinction between confirmed information and possible causes
- Recommendations for human support

## Project Structure

```
.
├── app.py                  # Flask backend
├── templates/              # HTML templates
│   └── index.html          # Chat interface
├── static/                 # CSS and JavaScript
│   ├── style.css           # Main stylesheet
│   └── script.js           # Chat functionality
├── prompts/                # Prompt templates
│   └── it_helpdesk.yaml    # AI assistant prompt
└── requirements.txt       # Python dependencies
```

## Testing

Test the following scenarios:
- "My Windows laptop is really slow"
- "I can't connect to Wi-Fi"
- "My printer isn't working"

## How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

## License

Distributed under the MIT License. See `LICENSE` for more information.
