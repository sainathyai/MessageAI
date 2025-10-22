/**
 * Smart Replies Service
 * Context-aware smart reply generation using RAG-style conversation analysis
 */

import { callOpenAI, parseJSONResponse } from './ai.service';
import { SmartReply, UserCommunicationStyle } from '../types/ai.types';
import { Message } from '../types';
import OpenAI from 'openai';

/**
 * Generate smart replies based on conversation context
 */
export async function generateSmartReplies(
  recentMessages: Message[],
  userStyle?: UserCommunicationStyle,
  count: number = 3
): Promise<SmartReply[]> {
  try {
    console.log('💡 Generating smart replies...');

    // Build conversation context (last 10 messages)
    const contextMessages = recentMessages.slice(-10);
    const conversationContext = contextMessages
      .map(m => `${m.senderId === 'currentUser' ? 'You' : 'Them'}: ${m.text}`)
      .join('\n');

    // Build style context
    let styleContext = '';
    if (userStyle) {
      styleContext = `
User Communication Style:
- Typical sentence length: ${userStyle.avgSentenceLength} words
- Emoji usage: ${userStyle.emojiFrequency}
- Formality: ${userStyle.formalityLevel}
- Response speed: ${userStyle.responseSpeed}
${userStyle.commonPhrases?.length ? `- Common phrases: ${userStyle.commonPhrases.join(', ')}` : ''}
${userStyle.preferredGreeting ? `- Preferred greeting: ${userStyle.preferredGreeting}` : ''}
`;
    }

    const systemPrompt = `You are a smart reply assistant. Generate ${count} contextually appropriate reply suggestions for the user.

Analyze the conversation context and user's communication style to generate replies that:
1. Are relevant to the last message
2. Match the user's typical style and tone
3. Vary in type (question, agreement, suggestion, neutral response)
4. Are concise and natural

${styleContext}

Conversation Context:
${conversationContext}

Return ONLY valid JSON in this exact format (array of ${count} replies):
[
  {
    "text": "suggested reply text",
    "type": "question" | "agreement" | "suggestion" | "neutral",
    "confidence": 0.85 (0-1 scale)
  }
]`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Generate smart replies now.' },
    ];

    const response = await callOpenAI(messages, {
      temperature: 0.7,
      maxTokens: 500,
      responseFormat: 'json',
    });

    const replies = parseJSONResponse<SmartReply[]>(response);

    // Sort by confidence and return top N
    return replies
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, count);
  } catch (error) {
    console.error('Smart replies generation error:', error);
    throw error;
  }
}

/**
 * Learn user's communication style from message history
 */
export function learnCommunicationStyle(messages: Message[], userId: string): UserCommunicationStyle {
  const userMessages = messages.filter(m => m.senderId === userId);

  if (userMessages.length === 0) {
    return getDefaultStyle();
  }

  // Calculate average sentence length (words per message)
  const totalWords = userMessages.reduce((sum, m) => {
    return sum + m.text.trim().split(/\s+/).length;
  }, 0);
  const avgSentenceLength = Math.round(totalWords / userMessages.length);

  // Calculate emoji frequency
  const emojiCount = userMessages.reduce((sum, m) => {
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    const matches = m.text.match(emojiRegex);
    return sum + (matches?.length || 0);
  }, 0);

  const emojiPerMessage = emojiCount / userMessages.length;
  let emojiFrequency: 'none' | 'rare' | 'moderate' | 'frequent';
  if (emojiPerMessage === 0) emojiFrequency = 'none';
  else if (emojiPerMessage < 1) emojiFrequency = 'rare';
  else if (emojiPerMessage < 3) emojiFrequency = 'moderate';
  else emojiFrequency = 'frequent';

  // Detect formality (simple heuristic)
  const casualMarkers = ['lol', 'haha', 'yeah', 'gonna', 'wanna', 'kinda'];
  const formalMarkers = ['however', 'therefore', 'furthermore', 'regarding', 'sincerely'];
  
  const textLower = userMessages.map(m => m.text.toLowerCase()).join(' ');
  const casualCount = casualMarkers.reduce((sum, marker) => 
    sum + (textLower.match(new RegExp(marker, 'g'))?.length || 0), 0);
  const formalCount = formalMarkers.reduce((sum, marker) => 
    sum + (textLower.match(new RegExp(marker, 'g'))?.length || 0), 0);

  let formalityLevel: 'casual' | 'neutral' | 'formal';
  if (casualCount > formalCount * 2) formalityLevel = 'casual';
  else if (formalCount > casualCount * 2) formalityLevel = 'formal';
  else formalityLevel = 'neutral';

  // Extract common phrases (3-4 word sequences that appear multiple times)
  const commonPhrases = extractCommonPhrases(userMessages);

  // Detect response speed (time between messages)
  const responseSpeed = detectResponseSpeed(userMessages);

  return {
    avgSentenceLength,
    emojiFrequency,
    formalityLevel,
    commonPhrases,
    responseSpeed,
  };
}

/**
 * Extract common phrases from messages
 */
function extractCommonPhrases(messages: Message[]): string[] {
  const phrases: Record<string, number> = {};

  messages.forEach(m => {
    const words = m.text.toLowerCase().split(/\s+/);
    
    // Extract 3-word phrases
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = words.slice(i, i + 3).join(' ');
      if (phrase.length > 5) { // Min length
        phrases[phrase] = (phrases[phrase] || 0) + 1;
      }
    }
  });

  // Return phrases that appear at least twice
  return Object.entries(phrases)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([phrase]) => phrase);
}

/**
 * Detect response speed
 */
function detectResponseSpeed(messages: Message[]): 'slow' | 'moderate' | 'fast' {
  if (messages.length < 2) return 'moderate';

  // Calculate average time between messages
  let totalGap = 0;
  let gapCount = 0;

  for (let i = 1; i < messages.length; i++) {
    const gap = messages[i].timestamp.getTime() - messages[i - 1].timestamp.getTime();
    if (gap < 3600000) { // Only count gaps under 1 hour
      totalGap += gap;
      gapCount++;
    }
  }

  if (gapCount === 0) return 'moderate';

  const avgGapSeconds = totalGap / gapCount / 1000;

  if (avgGapSeconds < 30) return 'fast';
  if (avgGapSeconds < 120) return 'moderate';
  return 'slow';
}

/**
 * Get default communication style
 */
function getDefaultStyle(): UserCommunicationStyle {
  return {
    avgSentenceLength: 10,
    emojiFrequency: 'moderate',
    formalityLevel: 'neutral',
    commonPhrases: [],
    responseSpeed: 'moderate',
  };
}

