// Global variables
let sessionId = null;

// DOM Elements
const conversationEl = document.getElementById('conversation');
const userInputEl = document.getElementById('user-input');
const sendBtnEl = document.getElementById('send-btn');
const newSessionBtnEl = document.getElementById('new-session-btn');
const typingIndicatorEl = document.getElementById('typing-indicator');
const reportModalEl = document.getElementById('report-modal');

// Bootstrap modal
let reportModal = null;
if (reportModalEl) {
    reportModal = new bootstrap.Modal(reportModalEl);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Create a new session
    createSession();
    
    // Event listeners
    sendBtnEl.addEventListener('click', sendMessage);
    newSessionBtnEl.addEventListener('click', createSession);
    
    userInputEl.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    userInputEl.focus();
});

// Create a new session
async function createSession() {
    try {
        const response = await fetch('/api/session', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
        });
        
        const data = await response.json();
        sessionId = data.session_id;
        
        // Clear conversation
        conversationEl.innerHTML = '';
        
        // Add initial AI message
        addMessage('ai', data.response);
        
        userInputEl.value = '';
        userInputEl.focus();
    } catch (error) {
        console.error('Error creating session:', error);
        addMessage('ai', 'Sorry, there was an error starting your session. Please try again.');
    }
}

// Send message
async function sendMessage() {
    const message = userInputEl.value.trim();
    if (!message || !sessionId) return;
    
    // Add user message
    addMessage('user', message);
    
    // Clear input
    userInputEl.value = '';
    
    // Show typing indicator
    showTypingIndicator(true);
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                session_id: sessionId,
                message: message
            })
        });
        
        const data = await response.json();
        
        // Hide typing indicator
        showTypingIndicator(false);
        
        if (data.error) {
            addMessage('ai', 'Sorry, there was an error: ' + data.error);
        } else {
            addMessage('ai', data.response);
            
            // If session is ending, show report
            if (data.is_end_session && data.report) {
                showReport(data.report);
            }
        }
    } catch (error) {
        showTypingIndicator(false);
        console.error('Error sending message:', error);
        addMessage('ai', 'Sorry, there was a network error. Please try again.');
    }
}

// Add message to conversation
function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ' + role + '-message';
    messageDiv.innerHTML = formatMessage(content);
    conversationEl.appendChild(messageDiv);
    scrollToBottom();
}

// Format message content
function formatMessage(text) {
    // Convert URLs to links
    const urlRegex =/(https?:\/\/[^\s]+)/g;
    text = text.replace(urlRegex, function(url) {
        return '<a href="' + url + '" target="_blank" rel="noopener">' + url + '</a>';
    });
    
    // Convert line breaks to paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    return paragraphs.map(p => '<p class="mb-2">' + p.trim().replace(/\n/g, '<br>') + '</p>').join('');
}

// Show/hide typing indicator
function showTypingIndicator(show) {
    typingIndicatorEl.classList.toggle('d-none', !show);
    scrollToBottom();
}

// Scroll to bottom
function scrollToBottom() {
    conversationEl.scrollTop = conversationEl.scrollHeight;
}

// Show end-of-session report
function showReport(report) {
    const reportContent = document.getElementById('report-content');
    
    let html = '';
    
    // Problem
    html += '<div class="report-section">';
    html += '<h6>Reported Problem</h6>';
    html += '<div class="report-item confirmed">' + escapeHtml(report.problem) + '</div>';
    html += '</div>';
    
    // User Information
    if (report.user_info && Object.keys(report.user_info).length > 0) {
        html += '<div class="report-section">';
        html += '<h6>Information Provided</h6>';
        for (const [key, value] of Object.entries(report.user_info)) {
            html += '<div class="report-item confirmed">' + escapeHtml(value) + '</div>';
        }
        html += '</div>';
    }
    
    // Steps Taken
    if (report.steps_taken && report.steps_taken.length > 0) {
        html += '<div class="report-section">';
        html += '<h6>Troubleshooting Steps Performed</h6>';
        report.steps_taken.forEach(step => {
            html += '<div class="report-item">' + escapeHtml(step) + '</div>';
        });
        html += '</div>';
    }
    
    // Likely Cause
    html += '<div class="report-section">';
    html += '<h6>Likely Cause</h6>';
    html += '<div class="report-item">' + escapeHtml(report.likely_cause) + '</div>';
    html += '</div>';
    
    // Recommended Action
    html += '<div class="report-section">';
    html += '<h6>Recommended Next Action</h6>';
    html += '<div class="report-item recommended">' + escapeHtml(report.recommended_action) + '</div>';
    html += '</div>';
    
    // Human Support Recommendation
    html += '<div class="alert ' + (report.human_support_recommended ? 'alert-warning' : 'alert-info') + '">';
    if (report.human_support_recommended) {
        html += '<strong>⚠️ Human IT Support Recommended</strong><br>';
        html += 'This issue may require assistance from a human IT professional.';
    } else {
        html += '<strong>✅ No human support needed</strong><br>';
        html += 'This issue can likely be resolved with the steps above.';
    }
    html += '</div>';
    
    reportContent.innerHTML = html;
    
    if (reportModal) {
        reportModal.show();
    }
    
    // Disable further messages
    userInputEl.disabled = true;
    sendBtnEl.disabled = true;
    newSessionBtnEl.textContent = 'Start New Session';
    newSessionBtnEl.onclick = function() {
        if (reportModal) reportModal.hide();
        createSession();
        userInputEl.disabled = false;
        sendBtnEl.disabled = false;
        newSessionBtnEl.textContent = 'New Session';
        newSessionBtnEl.onclick = createSession;
    };
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
