import React from 'react';
import { Message as MessageType } from '../types/chat';
import { User, Bot } from 'lucide-react';

interface MessageProps {
  message: MessageType;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const isTherapist = message.sender === 'therapist';
  
  return (
    <div className={`flex items-start space-x-3 mb-6 ${isTherapist ? '' : 'flex-row-reverse space-x-reverse'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isTherapist 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
          : 'bg-gradient-to-br from-slate-500 to-slate-600 text-white'
      }`}>
        {isTherapist ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>
      
      <div className={`max-w-[80%] ${isTherapist ? '' : 'text-right'}`}>
        <div className={`inline-block p-4 rounded-2xl ${
          isTherapist 
            ? 'bg-white border border-slate-200 text-slate-800' 
            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  );
};