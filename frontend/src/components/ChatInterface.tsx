import React, { useEffect, useRef } from 'react';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';
import { MessageInput } from './MessageInput';
import { useChat } from '../hooks/useChat';

export const ChatInterface: React.FC = () => {
  const { messages, isTyping, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
          
          {isTyping && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="max-w-4xl mx-auto w-full">
        <MessageInput onSendMessage={sendMessage} disabled={isTyping} />
      </div>
    </div>
  );
};