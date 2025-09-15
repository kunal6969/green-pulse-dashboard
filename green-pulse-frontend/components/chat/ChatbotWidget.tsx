import React, { useState, useRef, useEffect, useContext } from 'react';
import { Bot, X, Send, Cpu, AlertTriangle, CheckCircle, LogOut } from 'lucide-react';
import { ChatMessage, EnergyDataPoint } from '../../types';
import { AI_SUGGESTIONS } from '../../constants';
import { streamChatResponse } from '../../services/geminiService';
import { SimulationContext } from '../../contexts/SimulationContext';

const useSystemStatus = () => {
  const { buildingData } = useContext(SimulationContext);
  
  if (!buildingData || buildingData.length === 0) {
    return { status: 'ok', summary: "Hello! I'm GreenPulse AI. Data is loading. How can I help you today?" };
  }

  const latestPoint = buildingData[buildingData.length - 1];
  let status: 'ok' | 'warning' | 'critical' = 'ok';
  let summary = "Hello! I'm GreenPulse AI. All systems are currently stable.";

  if (latestPoint && latestPoint.actual !== null && latestPoint.predicted !== null) {
    const deviation = (latestPoint.actual - latestPoint.predicted) / latestPoint.predicted;
    if (deviation > 0.20) { // Over 20% deviation
      status = 'critical';
      summary = `Hello! I'm GreenPulse AI. Heads up: Current energy usage is significantly higher than predicted.`;
    } else if (deviation > 0.10) { // Over 10% deviation
      status = 'warning';
      summary = `Hello! I'm GreenPulse AI. Current energy usage is trending higher than predicted.`;
    }
  }
  
  summary += `\n\nHow can I help you analyze the data?`;

  return { status, summary };
};


const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { buildingId, buildingData } = useContext(SimulationContext);
  
  const { status, summary } = useSystemStatus();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    // Set initial message when the widget is opened or summary changes
     if (isOpen && messages.length === 0) {
        setMessages([{ id: '1', role: 'assistant', text: summary }]);
    }
  }, [isOpen, summary, messages.length]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (prompt?: string) => {
    const userMessage = prompt || input;
    if (!userMessage.trim()) return;

    const newUserMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: ChatMessage = { id: assistantMessageId, role: 'assistant', text: '' };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Pass the current building ID and data as context to the AI
      const stream = streamChatResponse(userMessage, buildingId, buildingData);
      for await (const chunk of stream) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId ? { ...msg, text: msg.text + chunk } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error streaming response:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId ? { ...msg, text: 'Sorry, I encountered an error. Please try again.' } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend();
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-primary hover:bg-primary-focus text-bg-primary rounded-full p-4 shadow-glow-primary transition-all duration-300 z-50 animate-subtle-pulse-glow"
        aria-label="Open Chatbot"
      >
        <Bot size={28} />
      </button>
    );
  }

  const statusIndicatorColor = {
    critical: 'bg-red-500 animate-pulse',
    warning: 'bg-secondary',
    ok: 'bg-primary'
  }[status];

  return (
    <div className="fixed bottom-6 right-6 w-[380px] h-[550px] bg-bg-secondary/80 backdrop-blur-xl border border-glass-border rounded-2xl shadow-card flex flex-col z-50 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-glass-border">
        <div className="flex items-center">
            <div className="relative">
                <Cpu className="text-primary" />
                <span className={`absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full ${statusIndicatorColor} border-2 border-bg-secondary`}></span>
            </div>
            <h3 className="text-lg font-semibold ml-3 text-text-primary">GreenPulse Assistant</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-text-secondary hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-2 rounded-xl ${msg.role === 'user' ? 'bg-primary text-bg-primary rounded-br-none' : 'bg-card-bg text-text-secondary rounded-bl-none'}`}>
              <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </div>
          </div>
        ))}
         {isLoading && (
            <div className="flex justify-start">
                 <div className="max-w-xs px-4 py-2 rounded-xl bg-card-bg text-text-secondary rounded-bl-none">
                    <div className="flex items-center space-x-1">
                        <span className="h-2 w-2 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-text-secondary rounded-full animate-bounce"></span>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {!isLoading && messages.length <= 2 && (
          <div className="p-4 border-t border-glass-border">
              <p className="text-xs text-text-secondary mb-2">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                  {AI_SUGGESTIONS.map((q, i) => (
                      <button key={i} onClick={() => handleSend(q)} className="text-xs bg-card-bg hover:bg-primary/20 border border-glass-border text-text-secondary px-2 py-1 rounded-full transition-colors">
                          {q}
                      </button>
                  ))}
              </div>
          </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-glass-border">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything..."
            className="w-full bg-card-bg border border-glass-border rounded-lg pl-4 pr-12 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-white"
            disabled={isLoading}
          />
          <button onClick={() => handleSend()} disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary hover:bg-primary-focus rounded-full text-bg-primary disabled:bg-gray-500 transition-colors">
            <Send size={16} />
          </button>
        </div>
      </div>
      
      {/* Exit Button */}
      <div className="border-t border-glass-border">
        <button
          onClick={() => setIsOpen(false)}
          className="w-full flex items-center justify-center space-x-2 py-2 text-sm text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-colors"
          aria-label="Exit chat"
        >
          <LogOut size={16} />
          <span>Exit Chat</span>
        </button>
      </div>
    </div>
  );
};

export default ChatbotWidget;