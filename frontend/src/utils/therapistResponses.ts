import { Message } from '../types/chat';

const therapistResponses = [
  "I hear you, and I want you to know that what you're feeling is completely valid. Can you tell me more about what's contributing to these feelings?",
  "That sounds really challenging. You've shown a lot of courage by sharing this with me. What has helped you cope with similar situations in the past?",
  "I appreciate you opening up about this. It takes strength to acknowledge these feelings. How long have you been experiencing this?",
  "Thank you for trusting me with this. Your feelings are important and deserve to be heard. What would it look like if this situation improved?",
  "I can sense this is weighing heavily on you. You're not alone in feeling this way. What kind of support do you feel you need right now?",
  "It sounds like you're going through a really difficult time. I'm here to support you through this. What's one small step you feel ready to take?",
  "Your perspective is valuable, and I'm glad you shared it with me. How has this been affecting other areas of your life?",
  "I can hear the pain in your words, and I want you to know that healing is possible. What does self-care look like for you?",
  "That must feel overwhelming. You're taking an important step by talking about it. What would you like to focus on in our conversation today?",
  "I notice you're being really thoughtful about this. Sometimes our emotions can feel complex. Can you help me understand what you're experiencing right now?"
];

const copingResponses = [
  "Those are healthy coping strategies. It's wonderful that you're aware of what helps you. How can we build on these strengths?",
  "I'm impressed by your resilience. These tools you've developed show real wisdom. Which of these feels most accessible to you right now?",
  "It sounds like you have some good insights into what works for you. That self-awareness is a real asset in your healing journey.",
];

const crisisKeywords = ['suicide', 'kill', 'hurt myself', 'end it all', 'die', 'worthless', 'hopeless'];
const anxietyKeywords = ['anxiety', 'anxious', 'panic', 'worry', 'nervous', 'stressed'];
const depressionKeywords = ['depressed', 'sad', 'hopeless', 'empty', 'lonely', 'worthless'];
const copingKeywords = ['meditation', 'exercise', 'therapy', 'support', 'help', 'better'];

export const generateTherapistResponse = async (userInput: string, conversationHistory: Message[]): Promise<string> => {
  const input = userInput.toLowerCase();
  
  // Crisis intervention
  if (crisisKeywords.some(keyword => input.includes(keyword))) {
    return "I'm really concerned about what you're sharing with me. Your safety is my top priority. If you're having thoughts of hurting yourself, please reach out to a crisis helpline immediately: National Suicide Prevention Lifeline (988) or Crisis Text Line (text HOME to 741741). Are you safe right now?";
  }

  // Contextual responses based on keywords
  if (anxietyKeywords.some(keyword => input.includes(keyword))) {
    return "Anxiety can feel overwhelming, but you're not alone in this experience. Many people find relief through grounding techniques like deep breathing or the 5-4-3-2-1 method. What physical sensations do you notice when anxiety arises?";
  }

  if (depressionKeywords.some(keyword => input.includes(keyword))) {
    return "Depression can make everything feel heavier and more difficult. I want you to know that these feelings, while valid and real, don't define your worth. What's one small thing that has brought you even a moment of peace recently?";
  }

  if (copingKeywords.some(keyword => input.includes(keyword))) {
    return copingResponses[Math.floor(Math.random() * copingResponses.length)];
  }

  // Default empathetic responses
  return therapistResponses[Math.floor(Math.random() * therapistResponses.length)];
};