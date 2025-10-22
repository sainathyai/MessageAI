# AI Features Technical Specification

**Project:** MessageAI  
**AI Provider:** OpenAI GPT-4 Turbo  
**Model:** `gpt-4-turbo-preview`  
**Context:** International Communicator Persona

---

## 🎯 Overview

This document specifies the technical implementation of 6 AI features:
- 5 Required Features (15 points)
- 1 Advanced Capability (10 points)

**Total Score Target:** 25/30 points (Section 3)

---

## 🔧 AI Provider Setup

### OpenAI Configuration

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

// Default config
const DEFAULT_MODEL = 'gpt-4-turbo-preview';
const DEFAULT_TEMPERATURE = 0.3; // Lower for consistent translations
const MAX_TOKENS = 1000;
```

### Environment Variables

```env
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-...
```

---

## 📋 Required Feature #1: Real-Time Translation

### Goal
Translate any message inline with one tap.

### Implementation

```typescript
// services/translation.service.ts
export async function translateMessage(
  text: string,
  targetLanguage: string
): Promise<TranslationResult> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `Translate the message to ${targetLanguage}. 
        Detect the source language. 
        Return JSON: {"translation": "...", "detectedLanguage": "..."}`
      },
      { role: 'user', content: text }
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' }
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

### UI Flow
1. Message bubble shows translate button (🌐)
2. User taps → AI translates
3. Show original + translation inline
4. Cache result in SQLite

### Performance Target
- Response time: <2 seconds
- Accuracy: >90%
- Languages: 50+

---

## 📋 Required Feature #2: Language Detection & Auto-Translate

### Goal
Automatically translate incoming messages based on user preferences.

### Implementation

```typescript
export async function detectLanguage(text: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{
      role: 'system',
      content: 'Detect language. Return ISO code only (e.g., "es", "fr", "ja")'
    }, {
      role: 'user',
      content: text
    }],
    temperature: 0,
    max_tokens: 10
  });
  
  return response.choices[0].message.content.trim();
}
```

### User Preferences

```typescript
interface UserAIPreferences {
  preferredLanguage: string;  // e.g., "en"
  autoTranslate: boolean;
  autoTranslateFrom: string[]; // e.g., ["es", "fr"]
}
```

### Logic
```
Incoming message arrives
    ↓
Detect language
    ↓
If language in autoTranslateFrom list
    ↓
Auto-translate and show inline
```

---

## 📋 Required Feature #3: Cultural Context Hints

### Goal
Explain cultural references, idioms, and customs.

### Implementation

```typescript
export async function getCulturalContext(
  text: string,
  detectedLanguage: string
): Promise<CulturalContext | null> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{
      role: 'system',
      content: `Analyze this ${detectedLanguage} message for cultural context.
      If it contains cultural references, idioms, or customs, explain them.
      Return JSON: {
        "hasCulturalContext": boolean,
        "explanation": string,
        "literalMeaning": string,
        "culturalSignificance": string,
        "appropriateResponse": string
      }
      If no cultural context, return null.`
    }, {
      role: 'user',
      content: text
    }],
    temperature: 0.5,
    response_format: { type: 'json_object' }
  });
  
  const result = JSON.parse(response.choices[0].message.content);
  return result.hasCulturalContext ? result : null;
}
```

### UI
- Show (ℹ️) icon on messages with cultural context
- Tap to see modal with explanation

---

## 📋 Required Feature #4: Formality Level Adjustment

### Goal
Adjust message tone before sending (casual ↔ formal).

### Implementation

```typescript
type FormalityLevel = 'casual' | 'neutral' | 'formal' | 'very_formal';

export async function adjustFormality(
  text: string,
  targetLevel: FormalityLevel,
  targetLanguage: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{
      role: 'system',
      content: `Rewrite this message with ${targetLevel} formality in ${targetLanguage}.
      Maintain the core meaning but adjust tone appropriately for cultural context.
      Return only the rewritten message.`
    }, {
      role: 'user',
      content: text
    }],
    temperature: 0.4
  });
  
  return response.choices[0].message.content;
}
```

### UI
- "Adjust Tone" button in message input
- Bottom sheet with 4 formality options
- Show before/after preview
- Accept or edit

---

## 📋 Required Feature #5: Slang/Idiom Explanations

### Goal
Detect and explain slang terms and idioms.

### Implementation

```typescript
export async function detectSlang(
  text: string,
  language: string
): Promise<SlangTerm[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{
      role: 'system',
      content: `Detect slang terms, idioms, and colloquialisms in this ${language} message.
      Return JSON array: [{
        "term": string,
        "position": [start, end],
        "type": "slang" | "idiom" | "colloquialism",
        "explanation": string,
        "literalMeaning": string,
        "actualMeaning": string,
        "example": string,
        "region": string,
        "formality": string
      }]
      If no slang/idioms, return empty array.`
    }, {
      role: 'user',
      content: text
    }],
    temperature: 0.3,
    response_format: { type: 'json_object' }
  });
  
  return JSON.parse(response.choices[0].message.content).terms || [];
}
```

### UI
- Underline detected slang terms
- Tap to see popup with explanation

---

## 🚀 Advanced Feature: Context-Aware Smart Replies

### Goal
Generate 3 contextually relevant reply suggestions based on conversation context and user style.

### Implementation

```typescript
export async function generateSmartReplies(
  conversationHistory: Message[],
  userStyle: UserCommunicationStyle
): Promise<string[]> {
  // Build context from last 5-10 messages
  const context = conversationHistory.slice(-10).map(m => 
    `${m.senderName}: ${m.text}`
  ).join('\n');
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{
      role: 'system',
      content: `Given this conversation, suggest 3 natural reply options.
      User's style:
      - Sentence length: ${userStyle.avgSentenceLength} words
      - Emoji usage: ${userStyle.emojiFrequency}
      - Formality: ${userStyle.formalityLevel}
      - Common phrases: ${userStyle.commonPhrases.join(', ')}
      
      Generate replies that:
      1. Match the user's authentic style
      2. Are contextually appropriate
      3. Are diverse (question, agreement, counter-suggestion)
      
      Return JSON: {"replies": ["...", "...", "..."]}`
    }, {
      role: 'user',
      content: context
    }],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });
  
  const result = JSON.parse(response.choices[0].message.content);
  return result.replies;
}
```

### User Style Learning

```typescript
interface UserCommunicationStyle {
  avgSentenceLength: number;  // words
  emojiFrequency: 'none' | 'rare' | 'moderate' | 'frequent';
  formalityLevel: 'casual' | 'neutral' | 'formal';
  commonPhrases: string[];
  responseSpeed: 'slow' | 'moderate' | 'fast';
}

// Learn from user's message history
export function learnUserStyle(messages: Message[]): UserCommunicationStyle {
  const userMessages = messages.filter(m => m.senderId === currentUserId);
  
  return {
    avgSentenceLength: calculateAvgLength(userMessages),
    emojiFrequency: detectEmojiUsage(userMessages),
    formalityLevel: detectFormality(userMessages),
    commonPhrases: extractCommonPhrases(userMessages),
    responseSpeed: calculateResponseSpeed(userMessages)
  };
}
```

### UI
- 3 suggestion chips above message input
- Tap to send immediately
- Swipe left to dismiss
- Fade in smoothly when ready

---

## 💾 Caching Strategy

### Translation Cache (SQLite)

```sql
CREATE TABLE translations (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL,
  source_text TEXT NOT NULL,
  target_language TEXT NOT NULL,
  translation TEXT NOT NULL,
  detected_language TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id)
);

CREATE INDEX idx_translations_message ON translations(message_id);
```

### Benefits
- Instant re-viewing
- Offline access
- Reduced API costs
- Better UX

---

## 📊 Performance Targets

| Feature | Response Time | Accuracy |
|---------|---------------|----------|
| Translation | <2s | >90% |
| Language Detection | <1s | >95% |
| Cultural Context | <3s | >85% |
| Formality Adjustment | <2s | >85% |
| Slang Detection | <2s | >80% |
| Smart Replies | <5s | >75% |

---

## 💰 Cost Estimates

### API Costs (GPT-4 Turbo)
- Input: $10/1M tokens
- Output: $30/1M tokens

### Usage Estimates (per request)
- Translation: ~200 tokens → $0.003
- Cultural context: ~300 tokens → $0.005
- Smart replies: ~500 tokens → $0.008

### MVP Testing Budget
- 1000 translations: $3
- 500 cultural contexts: $2.50
- 300 smart replies: $2.40
- 200 formality adjustments: $0.60
- **Total: ~$9** (very affordable!)

---

## 🔐 Security Considerations

### API Key Protection
- ✅ Store in `.env` (never commit)
- ✅ Add to `.gitignore`
- ✅ Use `EXPO_PUBLIC_` prefix for Expo
- ⚠️ For production: proxy through Lambda

### Rate Limiting
```typescript
// Simple rate limiter
const rateLimiter = {
  requests: [],
  maxPerMinute: 20,
  
  async checkLimit() {
    const now = Date.now();
    this.requests = this.requests.filter(t => t > now - 60000);
    
    if (this.requests.length >= this.maxPerMinute) {
      throw new Error('Rate limit exceeded. Please wait.');
    }
    
    this.requests.push(now);
  }
};
```

---

## 🧪 Testing Strategy

### Unit Tests
- Translation accuracy
- Language detection
- JSON parsing
- Error handling

### Integration Tests
- End-to-end translation flow
- Cache hit/miss behavior
- UI state management

### Manual Testing
- Test all 50+ languages
- Cultural context accuracy
- Smart reply relevance
- Performance under load

---

## 📁 File Structure

```
MessageAI-App/
├── services/
│   ├── ai.service.ts              # OpenAI client wrapper
│   ├── translation.service.ts     # Translation logic
│   ├── cultural-context.service.ts
│   ├── formality.service.ts
│   ├── slang-detection.service.ts
│   ├── smart-replies.service.ts
│   └── user-style-learning.service.ts
├── components/
│   ├── AITranslationButton.tsx
│   ├── CulturalContextModal.tsx
│   ├── FormalityAdjustmentSheet.tsx
│   ├── SlangExplanationPopup.tsx
│   ├── SmartReplies.tsx
│   └── AILoadingState.tsx
└── types/
    └── ai.types.ts
```

---

## 🚀 Implementation Order (PR #14-20)

1. **PR #14:** AI infrastructure + translation service
2. **PR #15:** Real-time translation UI
3. **PR #16:** Language detection + auto-translate
4. **PR #17:** Cultural context hints
5. **PR #18:** Formality adjustment
6. **PR #19:** Slang/idiom explanations
7. **PR #20:** Context-aware smart replies

---

**Ready for implementation! 🎯**

