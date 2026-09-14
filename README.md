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

## Quick Start (Running Locally)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Jazblue/ai-it-helpdesk.git
   cd ai-it-helpdesk
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Ensure Ollama is running**:
   ```bash
   ollama serve
   ```
   Make sure you have the `gemma4:31b-cloud` model installed (or change the model in `app.py`).

4. **Run the application**:
   ```bash
   python app.py
   ```
   The app will be available on [http://localhost:5000](http://localhost:5000).

5. **Open your browser** and navigate to `http://localhost:5000`.

## Publishing to GitHub

1. **Initialize Git repository** (if cloning from existing):
   ```bash
   git init
   ```

2. **Add files and commit**:
   ```bash
   git add .
   git commit -m "Initial commit"
   ```

3. **Create GitHub repository** (via GitHub CLI):
   ```bash
   gh repo create Jazblue/ai-it-helpdesk --public
   ```

4. **Push to GitHub**:
   ```bash
   git push -u origin master
   ```

5. **Enable GitHub Pages** (optional, for public hosting):
   ```bash
   gh repo edit --enable-pages
   ```
   After a few minutes, your site will be live at `https://jazblue.github.io/ai-it-helpdesk/`.

## Environment Variables (Optional)

- `OLLAMA_URL`: Base URL for Ollama API (default: http://127.0.0.1:11434/api/chat)
- `OLLAMA_MODEL`: Model name to use (default: gemma4:31b-cloud)

## Prompt Engineering

The AI assistant is guided by a YAML prompt template (`prompts/it_helpdesk.yaml`) that enforces:
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
└── requirements.txt        # Python dependencies
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
