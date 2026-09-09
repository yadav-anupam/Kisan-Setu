import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send } from 'lucide-react';
import { getChatbotResponse, getSuggestedQuestions } from '../../services/chatbotService';
import './KisanChatbot.css';

// ─── Types ───────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

const WELCOME_MESSAGE: string =
  'Namaste! 🙏 I am the Kisan Setu Assistant. I can help you with questions about registration, crop procurement, payments, gate pass, and more.\n\nFor specific account data (payments, status), please login to your Farmer Dashboard.';

// Generate unique message ID
let msgCounter = 0;
function genId(): string {
  return `msg-${Date.now()}-${++msgCounter}`;
}

// ─── Component ───────────────────────────────────────────────
const KisanChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const suggestions = getSuggestedQuestions();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  // Initialize welcome message on first open
  useEffect(() => {
    if (isOpen && !hasOpenedOnce) {
      setHasOpenedOnce(true);
      setMessages([
        {
          id: genId(),
          role: 'bot',
          text: WELCOME_MESSAGE,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, hasOpenedOnce]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isOpen, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  const sendUserMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      // Add user message
      const userMsg: Message = {
        id: genId(),
        role: 'user',
        text: trimmed,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMsg]);
      setInputValue('');
      setShowSuggestions(false); // hide chips after first interaction
      setIsTyping(true);
      scrollToBottom();

      // Simulate natural typing delay (400–800ms)
      const delay = 400 + Math.random() * 400;
      await new Promise(res => setTimeout(res, delay));

      // Get response from chatbot service
      const response = getChatbotResponse(trimmed);

      const botMsg: Message = {
        id: genId(),
        role: 'bot',
        text: response.message,
        timestamp: new Date(),
      };

      setIsTyping(false);
      setMessages(prev => [...prev, botMsg]);
    },
    [scrollToBottom],
  );

  const handleSend = () => {
    if (inputValue.trim()) {
      sendUserMessage(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChipClick = (question: string) => {
    sendUserMessage(question);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
  };

  // Format message text (preserve newlines)
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <>
      {/* ── Chat Panel ──────────────────────────────────────── */}
      <div
        className={`ks-chat-panel ${isOpen ? 'ks-panel-open' : 'ks-panel-closed'}`}
        role="dialog"
        aria-label="Kisan Setu Assistant"
        aria-modal="false"
      >
        {/* Header */}
        <div className="ks-chat-header">
          <div className="ks-chat-header-icon">
            <img src="/chatbot-avatar.png" alt="Kisan Setu Bot" className="ks-chat-header-avatar" />
          </div>
          <div className="ks-chat-header-info">
            <p className="ks-chat-header-title">Kisan Setu Assistant</p>
            <p className="ks-chat-header-subtitle">
              <span className="ks-chat-status-dot" />
              किसान सहायक • Always here to help
            </p>
          </div>
          <button
            className="ks-chat-header-close"
            onClick={toggleChat}
            aria-label="Close chatbot"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="ks-chat-messages" role="log" aria-live="polite">
          {messages.map(msg => (
            <div key={msg.id} className={`ks-msg ks-${msg.role}`}>
              {msg.role === 'bot' && (
                <div className="ks-msg-avatar" aria-hidden="true">
                  <img src="/chatbot-avatar.png" alt="" className="ks-msg-avatar-img" />
                </div>
              )}
              <div className="ks-msg-bubble">
                {formatText(msg.text)}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="ks-msg ks-bot">
              <div className="ks-msg-avatar" aria-hidden="true">
                  <img src="/chatbot-avatar.png" alt="" className="ks-msg-avatar-img" />
                </div>
              <div className="ks-msg-bubble" aria-label="Assistant is typing">
                <div className="ks-typing-indicator">
                  <span className="ks-typing-dot" />
                  <span className="ks-typing-dot" />
                  <span className="ks-typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={scrollAnchorRef} className="ks-scroll-anchor" />
        </div>

        {/* Suggestion Chips — shown only before first user message */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="ks-suggestions">
            <span className="ks-suggestions-label">Quick Questions</span>
            {suggestions.map(q => (
              <button
                key={q}
                className="ks-chip"
                onClick={() => handleChipClick(q)}
                type="button"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="ks-chat-input-area">
          <textarea
            ref={inputRef}
            className="ks-chat-input"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your question… (Enter to send)"
            rows={1}
            maxLength={400}
            aria-label="Type your message"
          />
          <button
            className="ks-send-btn"
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            aria-label="Send message"
            type="button"
          >
            <Send size={16} />
          </button>
        </div>

        {/* Disclaimer */}
        <div className="ks-chat-disclaimer">
          ℹ️ General info only • Cannot access your personal account data
        </div>
      </div>

      {/* ── FAB Toggle Button ───────────────────────────────── */}
      <button
        className={`ks-chat-fab ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        aria-label={isOpen ? 'Close Kisan Setu Assistant' : 'Open Kisan Setu Assistant'}
        title="Kisan Setu Assistant"
        type="button"
      >
        <span className="ks-chat-fab-icon">
          {isOpen
            ? <X size={22} />
            : <img src="/chatbot-avatar.png" alt="Kisan Setu Bot" className="ks-fab-avatar-img" />
          }
        </span>
      </button>
    </>
  );
};

export default KisanChatbot;
