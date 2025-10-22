# 🤖 MessageAI - AI Features User Guide

Welcome to MessageAI's AI-powered communication features! This guide will help you understand and use all the AI capabilities designed for international communication.

## 📖 Table of Contents

1. [Getting Started](#getting-started)
2. [Translation Features](#translation-features)
3. [Cultural Context](#cultural-context)
4. [Slang & Idiom Explanations](#slang--idiom-explanations)
5. [Formality Adjustment](#formality-adjustment)
6. [Smart Replies](#smart-replies)
7. [Settings & Customization](#settings--customization)
8. [Tips & Best Practices](#tips--best-practices)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### Prerequisites
- MessageAI app installed on your device
- Active internet connection (AI features require online access)
- OpenAI API key configured (for developers)

### First-Time Setup
1. Open MessageAI
2. Go to **Profile** tab
3. Scroll to **AI Features** section
4. Configure your preferences:
   - Select your preferred language
   - Enable/disable auto-translate
   - Toggle cultural hints
   - Enable smart replies

---

## 🌐 Translation Features

### Manual Translation
**What it does:** Translates any message to your preferred language on demand.

**How to use:**
1. Tap the **🌐 Translate** button below any message
2. View the translation instantly
3. Tap **Original** to toggle back

**Features:**
- Detects source language automatically
- Caches translations for instant re-viewing
- Shows detected language badge
- Works offline (uses cached translations)

### Auto-Translate
**What it does:** Automatically translates incoming messages from other languages.

**How to enable:**
1. Profile → AI Features → Toggle **Auto-translate messages**
2. Select your preferred language

**Behavior:**
- Only translates if message language differs from your preference
- Runs automatically in the background
- Fails silently if offline (you can manually translate later)

---

## 🌍 Cultural Context

**What it does:** Explains cultural references, idioms, and nuanced phrases that might be confusing for non-native speakers.

**How to use:**
1. Tap the **🌍 Context** button below any message
2. View explanations for:
   - Cultural references
   - Idioms and their meanings
   - Colloquialisms
   - Regional expressions
3. Tap **Got it!** to close

**What you'll see:**
- Overall context explanation
- Specific phrase breakdowns
- Type indicators (idiom, cultural reference, etc.)
- Detailed explanations

---

## 🗣️ Slang & Idiom Explanations

**What it does:** Detects and explains slang terms, idioms, and colloquialisms in messages.

**How to use:**
1. Tap the **🗣️ Slang** button below any message
2. View detected terms with:
   - **Literal meaning** (what the words mean individually)
   - **Actual meaning** (what the phrase really means)
   - **Usage examples**
   - **Regional information** (where it's commonly used)
   - **Formality level** (casual, informal, neutral, formal)

**Example:**
- Term: "break a leg"
- Type: Idiom
- Literal: To injure one's leg
- Actual: Good luck! (especially in performances)
- Region: Global (theater culture)
- Formality: Informal

---

## 📝 Formality Adjustment

**What it does:** Adjusts the formality level of your message before sending.

**How to use:**
1. Type your message
2. Tap the **📝** button (next to the input field)
3. Choose formality level:
   - **😊 Casual** - Friendly, relaxed tone
   - **💬 Neutral** - Balanced, standard tone
   - **👔 Formal** - Professional, respectful tone
   - **🎩 Very Formal** - Highly professional, ceremonial
4. Review the adjusted message
5. Edit if needed (tap the text to modify)
6. Tap **Apply & Send** or **Cancel**

**Use cases:**
- Professional communication
- First contact with someone new
- Cultural sensitivity
- Matching recipient's communication style

---

## 🤖 Smart Replies

**What it does:** AI generates contextually relevant quick reply suggestions based on:
- Conversation history (last 10 messages)
- Your communication style (learned from your messages)
- Message context and sentiment
- Formality level of the conversation

**How to use:**
1. When you receive a message, smart replies appear above the input
2. Scroll horizontally to view all suggestions
3. Tap any reply chip to send it instantly

**Reply Types:**
- **❓ Question** - Asking for clarification or more info
- **✅ Agreement** - Affirmative responses
- **💡 Suggestion** - Offering ideas or alternatives
- **💬 Neutral** - General responses

**Confidence Badge:**
- **✨** - High-confidence reply (80%+ match)

**Personalization:**
- AI learns your typical sentence length
- Matches your emoji usage frequency
- Adapts to your formality preference
- Remembers your common phrases

---

## ⚙️ Settings & Customization

### AI Features Settings (Profile Tab)

#### Preferred Language
- **What:** Your primary language for translations
- **Options:** 25+ languages (English, Spanish, French, German, Chinese, etc.)
- **Default:** English

#### Auto-translate Messages
- **What:** Automatically translate incoming foreign messages
- **Default:** Off
- **Recommendation:** Enable if you chat in multiple languages frequently

#### Cultural Context Hints
- **What:** Show explanations for cultural references
- **Default:** On
- **Recommendation:** Keep on for better cross-cultural understanding

#### Smart Replies
- **What:** AI-powered quick reply suggestions
- **Default:** On
- **Recommendation:** Enable for faster responses

---

## 💡 Tips & Best Practices

### Translation
- **First-time load:** Translations might take 1-3 seconds initially
- **Subsequent views:** Cached translations load instantly
- **Offline:** Cached translations still work, but new ones won't generate

### Cultural Context
- **When to use:** If you don't understand a phrase or reference
- **Best for:** Idioms, local expressions, cultural nuances
- **Pro tip:** Use it as a learning tool for language study

### Slang Detection
- **Most helpful:** Informal chats, youth slang, regional expressions
- **Shows:** Literal vs actual meanings (great for learners!)
- **Regional info:** Helps understand where phrases are common

### Formality Adjustment
- **Before important messages:** Adjust formality for professional contexts
- **Cultural sensitivity:** Match the recipient's culture/expectations
- **Editable:** You can modify the AI suggestion before sending

### Smart Replies
- **Best for:** Quick responses when you're busy
- **Variety:** AI generates different types (questions, agreements, etc.)
- **Personalized:** Gets better as you use the app more
- **Not forced:** Feel free to type your own message!

---

## 🛠️ Troubleshooting

### "AI features not configured" warning
**Cause:** OpenAI API key is missing
**Solution:** Contact the app developer or check `.env` configuration

### Translations not loading
**Possible causes:**
1. No internet connection
2. API rate limit reached
3. Invalid API key

**Solutions:**
- Check your internet connection
- Wait a few minutes and try again
- Verify API key configuration

### Smart replies not appearing
**Check:**
1. Is "Smart Replies" enabled in Profile → AI Features?
2. Did you just send a message? (Smart replies only appear for incoming messages)
3. Is there enough conversation context? (At least 1-2 messages)
4. Internet connection active?

### Cultural context shows "No cultural references"
**This is normal!** Not all messages have cultural references, idioms, or slang. The AI is working correctly—the message is clear and straightforward.

### Formality button disabled
**Cause:** Message input is empty
**Solution:** Type your message first, then tap the formality button

### Slow performance
**Causes:**
- Poor internet connection
- High API usage (rate limits)
- Device performance

**Solutions:**
- Use Wi-Fi instead of mobile data
- Wait a few moments between AI actions
- Clear app cache

---

## 📊 Feature Comparison

| Feature | Internet Required | Cached | Personalized | Use Case |
|---------|-------------------|--------|--------------|----------|
| Manual Translation | ✅ (first time) | ✅ | ❌ | Understanding foreign messages |
| Auto-translate | ✅ | ✅ | ❌ | Seamless multi-language chats |
| Cultural Context | ✅ | ❌ | ❌ | Learning cultural nuances |
| Slang Explanations | ✅ | ❌ | ❌ | Understanding informal language |
| Formality Adjustment | ✅ | ❌ | ❌ | Professional communication |
| Smart Replies | ✅ | ❌ | ✅ | Quick, context-aware responses |

---

## 🎯 Use Case Examples

### International Team Communication
**Scenario:** You're working with a team across 5 countries.
**AI Features to use:**
- **Auto-translate:** On (to English or your preferred language)
- **Formality Adjustment:** Use "Formal" or "Very Formal" for business messages
- **Cultural Context:** Review cultural references to avoid misunderstandings

### Casual Chat with International Friends
**Scenario:** Chatting with friends who speak different languages.
**AI Features to use:**
- **Manual Translation:** As needed
- **Slang Explanations:** To understand local slang
- **Smart Replies:** Quick, friendly responses
- **Formality:** Casual or Neutral

### Language Learning
**Scenario:** You're learning a new language.
**AI Features to use:**
- **Manual Translation:** Check your understanding
- **Slang Explanations:** Learn colloquial phrases
- **Cultural Context:** Understand cultural background
- **Formality Adjustment:** Practice different registers

### Professional Networking
**Scenario:** Connecting with international business contacts.
**AI Features to use:**
- **Formality Adjustment:** "Formal" or "Very Formal"
- **Cultural Context:** Avoid cultural faux pas
- **Smart Replies:** Quick professional responses
- **Manual Translation:** Ensure accuracy

---

## 📈 Coming Soon

- **Voice Translation:** Speak and translate in real-time
- **Image Translation:** Translate text in photos
- **Conversation Summaries:** AI-generated recaps
- **Tone Analysis:** Detect sentiment and emotion
- **Multi-language Group Chats:** Auto-translate for all members

---

## 🤝 Feedback & Support

Have questions or suggestions?
- **GitHub Issues:** [Report bugs or request features](https://github.com/sainathyai/MessageAI/issues)
- **Email:** support@messageai.app
- **Twitter:** @MessageAI

---

**Made with ❤️ by the MessageAI Team**

*Empowering global communication through AI.*

