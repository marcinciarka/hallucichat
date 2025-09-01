import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';
import { PROMPT_TEMPLATES, PromptStyle } from './prompts';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY not set, returning original nickname');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

function getPromptStyle(): PromptStyle {
  const style = process.env.GEMINI_PROMPT_STYLE as PromptStyle;
  return style && PROMPT_TEMPLATES[style] ? style : 'freaky';
}

function getSystemPrompt(): string {
  const style = getPromptStyle();
  return PROMPT_TEMPLATES[style].systemPrompt;
}

// Global chat session
let chatSession: ChatSession | null = null;

async function getChatSession(): Promise<ChatSession> {
  if (!chatSession) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const systemPrompt = getSystemPrompt();

    chatSession = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }]
        },
        {
          role: "model",
          parts: [{ text: "I understand! I'm ready to transform usernames and messages into the freeky 👅 style. Send me your transformation requests!" }]
        }
      ]
    });
  }
  return chatSession;
}

export async function transformNickname(originalNickname: string): Promise<string> {
  // If no API key is provided, return original nickname
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not set, returning original nickname');
    return originalNickname;
  }

  try {
    const chat = await getChatSession();
    const result = await chat.sendMessage(`TRANSFORM NICKNAME: ${originalNickname}`);
    const transformedNickname = result.response.text().trim();

    // Remove quotes if present (sometimes AI adds them)
    const cleanedNickname = transformedNickname.replace(/^["']|["']$/g, '');

    // Ensure the transformed nickname is not empty and reasonable length
    if (cleanedNickname && cleanedNickname.length <= 20) {
      return cleanedNickname;
    }

    return originalNickname;
  } catch (error) {
    console.error('Error transforming nickname:', error);
    return originalNickname;
  }
}

export async function transformMessage(originalMessage: string): Promise<string> {
  // If no API key is provided, return original message
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not set, returning original message');
    return originalMessage;
  }

  try {
    const chat = await getChatSession();
    const result = await chat.sendMessage(`TRANSFORM MESSAGE: ${originalMessage}`);
    const transformedMessage = result.response.text().trim();

    // Remove quotes if present (sometimes AI adds them)
    const cleanedMessage = transformedMessage.replace(/^["']|["']$/g, '');

    // Ensure the transformed message is not empty and reasonable length
    if (cleanedMessage && cleanedMessage.length <= 500) {
      return cleanedMessage;
    }

    return originalMessage;
  } catch (error) {
    console.error('Error transforming message:', error);
    return originalMessage;
  }
}
