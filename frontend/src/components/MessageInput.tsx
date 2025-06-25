import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="bg-white border-t border-slate-200 p-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share what's on your mind..."
            disabled={disabled}
            className="w-full p-3 pr-12 border border-slate-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 min-h-[48px] max-h-32 disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
          />
          
          <button
            type="button"
            className="absolute right-3 bottom-3 p-1 text-slate-400 hover:text-slate-600 transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-300 disabled:to-slate-400 text-white p-3 rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
      
      <div className="mt-2 text-xs text-slate-500">
        Press Enter to send • Shift+Enter for new line
      </div>
    </div>
  );
};