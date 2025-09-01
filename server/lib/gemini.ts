import { GoogleGenerativeAI } from '@google/generative-ai';
import { PROMPT_TEMPLATES, PromptStyle } from './prompts';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY not set');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Rate limit tracking from actual API responses
interface RateLimitInfo {
  requestsRemaining: number | null;
  requestsLimit: number | null;
  resetTime: Date | null;
  isExceeded: boolean;
  lastError: string | null;
}

const rateLimitInfo: RateLimitInfo = {
  requestsRemaining: null,
  requestsLimit: null,
  resetTime: null,
  isExceeded: false,
  lastError: null
};

export function getQuotaInfo(): RateLimitInfo {
  return { ...rateLimitInfo };
}

function updateRateLimitFromError(error: unknown) {
  // Type guard for API error structure
  const isApiError = (err: unknown): err is {
    status: number;
    errorDetails?: Array<{ '@type': string;[key: string]: unknown }>
  } => {
    return err !== null &&
      typeof err === 'object' &&
      'status' in err &&
      typeof (err as { status: unknown }).status === 'number';
  };

  if (isApiError(error) && error.status === 429) {
    rateLimitInfo.isExceeded = true;
    rateLimitInfo.lastError = 'Rate limit exceeded';

    // Try to extract rate limit info from error
    if (error.errorDetails) {
      const retryInfo = error.errorDetails.find(detail =>
        detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
      ) as { retryDelay?: string } | undefined;

      if (retryInfo?.retryDelay) {
        const retrySeconds = parseInt(retryInfo.retryDelay.replace('s', ''));
        rateLimitInfo.resetTime = new Date(Date.now() + retrySeconds * 1000);
      }

      const quotaFailure = error.errorDetails.find(detail =>
        detail['@type'] === 'type.googleapis.com/google.rpc.QuotaFailure'
      ) as { violations?: Array<{ quotaMetric?: string }> } | undefined;

      if (quotaFailure?.violations?.[0]?.quotaMetric) {
        rateLimitInfo.lastError = `Quota exceeded: ${quotaFailure.violations[0].quotaMetric}`;
      }
    }

    console.warn('Rate limit exceeded:', rateLimitInfo);
  }
}

function checkIfRateLimitReset() {
  if (rateLimitInfo.resetTime && new Date() >= rateLimitInfo.resetTime) {
    rateLimitInfo.isExceeded = false;
    rateLimitInfo.lastError = null;
    rateLimitInfo.resetTime = null;
    console.log('Rate limit reset detected');
  }
}

function getPromptStyle(): PromptStyle {
  const style = process.env.GEMINI_PROMPT_STYLE as PromptStyle;
  return style && PROMPT_TEMPLATES[style] ? style : 'uwu';
}

function getSystemPrompt(style?: PromptStyle): string {
  const promptStyle = style || getPromptStyle();
  return PROMPT_TEMPLATES[promptStyle];
}

// Cache models per style to avoid recreating them
const modelCache = new Map<PromptStyle, ReturnType<typeof genAI.getGenerativeModel>>();

// Create optimized model instance with system instruction
function getModel(style: PromptStyle) {
  if (!modelCache.has(style)) {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: getSystemPrompt(style)
    });
    modelCache.set(style, model);
  }
  return modelCache.get(style)!;
}

export async function transformNickname(originalNickname: string, style: PromptStyle = 'uwu'): Promise<string> {
  // If no API key is provided, return original nickname
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not set, returning original nickname');
    return originalNickname;
  }

  // Check rate limit before making request
  checkIfRateLimitReset();
  if (rateLimitInfo.isExceeded) {
    console.warn('Rate limit exceeded, returning original nickname');
    return originalNickname;
  }

  try {
    const model = getModel(style);
    const result = await model.generateContent(`TRANSFORM NICKNAME: ${originalNickname}`);

    const transformedNickname = result.response.text().trim();
    console.log('transformNickname', originalNickname, style, transformedNickname);

    // Remove quotes if present (sometimes AI adds them)
    const cleanedNickname = transformedNickname.replace(/^["']|["']$/g, '');

    // Ensure the transformed nickname is not empty and reasonable length
    if (cleanedNickname && cleanedNickname.length <= 30) {
      return cleanedNickname;
    }

    return originalNickname;
  } catch (error) {
    console.error('Error transforming nickname:', error);
    updateRateLimitFromError(error);
    return originalNickname;
  }
}

export async function transformMessage(originalMessage: string, style: PromptStyle = 'uwu'): Promise<string> {
  // If no API key is provided, return original message
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not set, returning original message');
    return originalMessage;
  }

  // Check rate limit before making request
  checkIfRateLimitReset();
  if (rateLimitInfo.isExceeded) {
    console.warn('Rate limit exceeded, returning original message');
    return originalMessage;
  }

  try {
    const model = getModel(style);
    const result = await model.generateContent(`TRANSFORM MESSAGE: ${originalMessage}`);

    const transformedMessage = result.response.text().trim();
    console.log('transformMessage', originalMessage, style, transformedMessage);

    // Remove quotes if present (sometimes AI adds them)
    const cleanedMessage = transformedMessage.replace(/^["']|["']$/g, '');

    // Ensure the transformed message is not empty and reasonable length
    if (cleanedMessage && cleanedMessage.length <= 500) {
      return cleanedMessage;
    }

    return originalMessage;
  } catch (error) {
    console.error('Error transforming message:', JSON.stringify(error));
    updateRateLimitFromError(error);
    return originalMessage;
  }
}