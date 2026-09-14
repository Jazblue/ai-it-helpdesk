import os
import uuid
import json
import yaml
import requests
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# In-memory session storage
sessions = {}

# Default Ollama configuration
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434/api/chat")
DEFAULT_MODEL = os.environ.get("OLLAMA_MODEL", "gemma4:31b-cloud")

# Load prompt templates
def load_prompt_template():
    prompt_path = os.path.join(os.path.dirname(__file__), "prompts", "it_helpdesk.yaml")
    with open(prompt_path, "r") as f:
        return yaml.safe_load(f)

# Initialize session with prompt template
def init_session(session_id):
    prompt_template = load_prompt_template()
    sessions[session_id] = {
        "history": [
            {"role": "system", "content": prompt_template["system"]},
            {"role": "assistant", "content": prompt_template["initial_message"]}
        ],
        "steps_taken": [],
        "user_info": {}
    }
    return sessions[session_id]

# Call Ollama API
def call_ollama(messages, model=DEFAULT_MODEL):
    payload = {
        "model": model,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "max_tokens": 512
        }
    }
    
    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data["message"]["content"]
    except requests.exceptions.RequestException as e:
        return f"Error communicating with AI model: {str(e)}"
    except (KeyError, json.JSONDecodeError) as e:
        return f"Error parsing AI response: {str(e)}"

# Generate end-of-session report
def generate_report(session_id, problem_description):
    session = sessions.get(session_id, {})
    report = {
        "problem": problem_description,
        "user_info": session.get("user_info", {}),
        "steps_taken": session.get("steps_taken", []),
        "likely_cause": "Not enough information for definitive diagnosis",
        "recommended_action": "Please provide more details or contact human IT support",
        "human_support_recommended": True
    }
    
    return report

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/session", methods=["POST"])
def create_session():
    session_id = str(uuid.uuid4())
    session = init_session(session_id)
    return jsonify({
        "session_id": session_id,
        "response": session["history"][-1]["content"]
    })

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    session_id = data.get("session_id")
    user_message = data.get("message", "").strip()

    if not session_id or session_id not in sessions:
        return jsonify({"error": "Invalid session"}), 400
    
    if not user_message:
        return jsonify({"error": "Empty message"}), 400

    session = sessions[session_id]

    # Store user's initial problem description
    if not session.get("problem_description") and user_message:
        session["problem_description"] = user_message

    # Add user message to history
    session["history"].append({"role": "user", "content": user_message})

    # Track user information based on context
    if "?" in user_message and len(session["history"]) > 2:
        # This is an answer to a diagnostic question
        session["steps_taken"].append(f"Question asked: {session['history'][-2]['content']}")
        session["user_info"][f"answer_{len(session['steps_taken'])}"] = user_message

    # Call the AI model
    ai_response = call_ollama(session["history"])

    # Add AI response to history
    session["history"].append({"role": "assistant", "content": ai_response})

    # Check if session should end (AI suggests escalation or problem seems resolved)
    end_session = any(keyword in ai_response.lower() for keyword in ["recommend", "escalate", "human support", "cannot diagnose", "unable to diagnose", "end of this session"])

    # Generate report if session is ending
    report = None
    if end_session:
        report = generate_report(session_id, session.get("problem_description", ""))
        # Clean up session
        del sessions[session_id]

    return jsonify({
        "response": ai_response,
        "is_end_session": end_session,
        "report": report
    })

@app.route("/api/session/<session_id>", methods=["GET"])
def get_session(session_id):
    session = sessions.get(session_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404
    return jsonify({
        "session_id": session_id,
        "problem_description": session.get("problem_description", ""),
        "steps_taken": session.get("steps_taken", []),
        "user_info": session.get("user_info", {})
    })

@app.route("/api/session/<session_id>", methods=["DELETE"])
def delete_session(session_id):
    if session_id in sessions:
        del sessions[session_id]
        return jsonify({"message": "Session deleted"}), 200
    return jsonify({"error": "Session not found"}), 404

@app.route("/api/report", methods=["POST"])
def get_report():
    data = request.get_json()
    session_id = data.get("session_id")
    if session_id in sessions:
        report = generate_report(session_id, sessions[session_id].get("problem_description", ""))
        del sessions[session_id]
        return jsonify(report)
    return jsonify({"error": "Session not found"}), 404

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
