import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface ChatMessage {
  content: string;
  session_id: string;
  context?: Record<string, any>;
}

interface ChatResponse {
  content: string;
  psychological_insight?: {
    pattern?: string;
    confidence: number;
    description: string;
    therapeutic_approach: string;
  };
  emotional_state?: string;
  topic_classification?: string;
  suggestions?: string[];
  session_id: string;
  timestamp: string;
  confidence_score: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the request body
    const body = await req.json() as ChatMessage
    
    if (!body.content || !body.session_id) {
      throw new Error('Missing required fields: content and session_id')
    }

    // Get the Authorization header for user context
    let userId = 'anonymous'
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      if (!error && user) {
        userId = user.id
      }
    }

    // Store the user message
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        session_id: body.session_id,
        user_id: userId,
        content: body.content,
        sender: 'user',
        message_type: 'text'
      })

    if (messageError) {
      console.error('Error storing message:', messageError)
    }

    // Simple AI response generation (you can enhance this with OpenAI API)
    const aiResponse = generateTherapyResponse(body.content)

    // Store the AI response
    const { error: aiMessageError } = await supabase
      .from('messages')
      .insert({
        session_id: body.session_id,
        user_id: userId,
        content: aiResponse.content,
        sender: 'ai',
        message_type: 'text'
      })

    if (aiMessageError) {
      console.error('Error storing AI message:', aiMessageError)
    }

    return new Response(
      JSON.stringify(aiResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

function generateTherapyResponse(userMessage: string): ChatResponse {
  // Simple therapy response logic (replace with OpenAI API call for production)
  const responses = [
    "I understand you're sharing something important with me. Can you tell me more about how that makes you feel?",
    "Thank you for opening up about that. What thoughts come to mind when you reflect on this experience?",
    "It sounds like you're going through something challenging. How are you coping with these feelings?",
    "I appreciate you sharing that with me. What would you like to explore further about this situation?",
    "That sounds significant. How has this been affecting your daily life?"
  ]

  const randomResponse = responses[Math.floor(Math.random() * responses.length)]

  return {
    content: randomResponse,
    psychological_insight: {
      pattern: "Active listening",
      confidence: 0.8,
      description: "Encouraging further exploration and emotional expression",
      therapeutic_approach: "Person-centered therapy"
    },
    emotional_state: "supportive",
    topic_classification: "general",
    suggestions: [
      "Take time to reflect on your feelings",
      "Consider journaling about this experience",
      "Practice mindfulness when these thoughts arise"
    ],
    session_id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    confidence_score: 0.75
  }
}
