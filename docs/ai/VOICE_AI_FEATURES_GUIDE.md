# Voice Message AI Features Guide

## Overview

Voice messages now include AI-powered transcription, cultural context analysis, and slang detection accessed through a unified long-press menu. This provides users with text representations of voice messages and deeper understanding of their content.

## Features

### 1. **Speech-to-Text Transcription** 🎯

Convert voice messages to text for easy reading and accessibility.

**How to Use:**
1. Long-press on any voice message
2. Tap "Transcribe" from the context menu
3. The transcription appears below the voice waveform
4. Long-press again to access translation, cultural context, and slang detection

**Benefits:**
- Read voice messages in noisy environments
- Quickly scan message content
- Accessibility for hearing-impaired users
- Search and reference voice content
- Consistent UI with text messages

### 2. **Cultural Context Analysis** 🌍

After transcription, analyze cultural references, idioms, and context in voice messages.

**How to Use:**
1. Long-press voice message and transcribe it first
2. Long-press again and tap "Cultural Context"
3. View detailed cultural explanation in modal

**What It Analyzes:**
- Cultural references and idioms
- Social customs mentioned
- Potential sensitivities
- Appropriate responses
- Regional expressions

**Example:**
```
Voice: "Let's grab coffee sometime"
Context: Casual invitation to meet (informal, friendly)
Note: In some cultures, this might be seen as romantic interest
Alternative: "Let's schedule a meeting" (more professional)
```

### 3. **Slang Detection & Explanation** 💬

Identify and explain slang terms, idioms, and colloquialisms in voice messages.

**How to Use:**
1. Long-press voice message and transcribe it first
2. Long-press again and tap "Explain Slang"
3. View detected slang terms with explanations

**Slang Categories:**
- Internet slang ("lol", "brb", "omg")
- Regional expressions (UK vs US English)
- Generation-specific terms (Gen Z, Millennial)
- Gaming terminology
- Professional jargon

**Example:**
```
Voice: "That's fire! No cap, you're goated fr fr"

Detected Slang:
1. "fire" → Excellent, amazing (informal)
2. "No cap" → No lie, being honest (Gen Z)
3. "goated" → Greatest of all time (G.O.A.T.)
4. "fr fr" → For real, for real (emphasis)

Translation: "That's excellent! Honestly, you're the best."
```

## UI Components

### Voice Message Player with AI Features

```
┌─────────────────────────────────────┐
│  ▶️  [Waveform Visualization]  1:23 │
│                                1.0x │
└─────────────────────────────────────┘

Long-press voice message to access:
┌─────────────────────────────────────┐
│  🎯 Transcribe                       │ ← Only for voice messages
│  ─────────────────────────────────  │
│  🌐 Translate                        │
│  🌍 Cultural Context                 │
│  💬 Explain Slang                    │
└─────────────────────────────────────┘

After transcription:
┌─────────────────────────────────────┐
│  ▶️  [Waveform Visualization]  1:23 │
│                                1.0x │
├─────────────────────────────────────┤
│  [Transcribed text appears here]    │
└─────────────────────────────────────┘
```

### How It Works

1. **Unified Context Menu:**
   - All voice messages can be long-pressed
   - "Transcribe" option only appears for voice messages
   - After transcription, all AI features work on the transcribed text
   - Consistent experience with text messages

2. **Transcription States:**
   - Initial: Long-press shows "Transcribe" option
   - Transcribing: Loading spinner in menu
   - Transcribed: Text appears below waveform
   - Long-press again for translation, context, or slang analysis

## Technical Implementation

### Transcription Service

**File:** `services/transcription.service.ts`

**Current Status:** Placeholder implementation
**Production Ready:** Requires OpenAI Whisper API integration

**Implementation Notes:**
```typescript
// TODO: Integrate OpenAI Whisper API
const formData = new FormData();
formData.append('file', { 
  uri: audioUri, 
  type: 'audio/m4a', 
  name: 'audio.m4a' 
});
formData.append('model', 'whisper-1');

const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
  },
  body: formData,
});
```

### Cultural Context & Slang Detection

**Services:**
- `services/context.service.ts` - Cultural analysis
- `services/slang.service.ts` - Slang detection

**AI Model:** OpenAI GPT-4
**Response Format:** Structured JSON

### Data Model

**Message Type Extension:**
```typescript
interface Message {
  // ... existing fields
  transcription?: string;
  transcriptionLanguage?: string;
}
```

## Production Deployment

### Required Setup

1. **OpenAI Whisper API:**
   - Add Whisper endpoint to API gateway
   - Configure audio file uploads
   - Handle FormData multipart requests
   - Implement retry logic for failed transcriptions

2. **Firestore Updates:**
   - Store transcriptions with messages
   - Cache transcriptions to avoid re-processing
   - Add transcription status field

3. **Performance Optimization:**
   - Background transcription after voice message sent
   - Pre-cache transcriptions for incoming messages
   - Lazy load AI features (only when requested)

### Environment Variables

```bash
# .env
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
EXPO_PUBLIC_OPENAI_WHISPER_ENDPOINT=https://api.openai.com/v1/audio/transcriptions
```

## User Experience

### Flow

1. **Receive Voice Message:**
   - Message appears with waveform and play button
   - AI feature buttons visible below

2. **Transcribe (Optional):**
   - User taps "Transcribe"
   - Loading spinner appears
   - Transcription shows below waveform
   - Context and Slang buttons become active

3. **Analyze (Optional):**
   - User taps "Context" or "Slang"
   - Loading spinner appears
   - Modal shows detailed analysis
   - Results cached for instant re-access

### Dark Theme Support

All components support dark theme using `useTheme()` hook:
- Buttons adapt to theme colors
- Transcription text is readable in both modes
- Modals use theme-appropriate backgrounds

### Accessibility

- **Screen Readers:** All buttons have labels
- **Haptic Feedback:** Tactile response on interactions
- **Visual Indicators:** Loading states clearly shown
- **Keyboard Navigation:** Modal can be dismissed with back button

## Testing

### Test Scenarios

1. **Transcription:**
   - [ ] Transcribe short voice message (< 10s)
   - [ ] Transcribe long voice message (> 1min)
   - [ ] Toggle transcription visibility
   - [ ] Handle transcription errors

2. **Cultural Context:**
   - [ ] Analyze message with idioms
   - [ ] Analyze message with cultural references
   - [ ] Analyze simple message (no context)
   - [ ] View context modal

3. **Slang Detection:**
   - [ ] Detect common slang terms
   - [ ] Handle message with no slang
   - [ ] View slang explanations
   - [ ] Test regional variations

4. **Performance:**
   - [ ] Transcription completes in < 5s
   - [ ] AI analysis completes in < 3s
   - [ ] Cached results load instantly
   - [ ] No UI lag when opening modals

### Known Limitations

1. **Transcription Placeholder:**
   - Current implementation returns placeholder text
   - Production requires Whisper API integration
   - Estimated setup time: 2-4 hours

2. **Language Detection:**
   - Currently defaults to English
   - Multi-language support needs enhancement

3. **Offline Mode:**
   - All AI features require internet connection
   - No offline fallback currently implemented

## Future Enhancements

### Planned Features

1. **Auto-Transcription:**
   - Automatically transcribe all incoming voice messages
   - User preference toggle

2. **Multi-Language Support:**
   - Detect and transcribe multiple languages
   - Translate transcriptions

3. **Speaker Diarization:**
   - Identify multiple speakers in group voice messages
   - Label speakers in transcription

4. **Voice Search:**
   - Search chat history by voice message content
   - Full-text search on transcriptions

5. **Sentiment Analysis:**
   - Detect emotion and tone in voice messages
   - Visual indicators for sentiment

6. **Summary Generation:**
   - AI-generated summary of long voice messages
   - Key points extraction

## Troubleshooting

### Transcription Not Working

**Issue:** "Transcription requires Whisper API setup" message

**Solution:**
1. Verify OpenAI API key in `.env`
2. Implement Whisper API integration (see Technical Implementation)
3. Test with sample audio file

### Context/Slang Not Detecting

**Issue:** AI features return empty results

**Solution:**
1. Check internet connection
2. Verify transcription is not empty
3. Test with longer messages (>20 characters)
4. Check OpenAI API rate limits

### Performance Issues

**Issue:** Slow transcription or analysis

**Solution:**
1. Implement caching for processed messages
2. Use background processing
3. Reduce audio file size before upload
4. Check API response times

## Related Documentation

- [AI Features User Guide](./AI_FEATURES_USER_GUIDE.md)
- [AI Testing Guide](./AI_TESTING_GUIDE.md)
- [PR35 Voice Messages](../planning/PR35_TESTING_GUIDE.md)
- [Architecture](../architecture/ARCHITECTURE.md)

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review OpenAI Whisper documentation
3. Test with sample voice messages
4. Verify API credentials and limits

