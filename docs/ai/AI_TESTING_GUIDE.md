# 🧪 AI Features Testing Guide

Comprehensive testing checklist for all AI features in MessageAI.

## 📋 Prerequisites

- [ ] Expo Go app installed on iOS/Android device
- [ ] OpenAI API key configured in `.env`
- [ ] At least 2 test accounts created
- [ ] Stable internet connection
- [ ] OpenAI account with credits

---

## 🌐 Translation Features Testing

### Manual Translation
- [ ] **TC1.1:** Tap translate button → translation appears
- [ ] **TC1.2:** Tap "Original" → shows original text
- [ ] **TC1.3:** Translate message in Spanish → shows English translation
- [ ] **TC1.4:** Translate message in French → shows English translation
- [ ] **TC1.5:** Translate again (same message) → loads from cache (instant)
- [ ] **TC1.6:** Translation shows detected language badge
- [ ] **TC1.7:** Loading indicator appears during translation
- [ ] **TC1.8:** Error handling: Disconnect internet → shows error → reconnect → retry works

### Auto-Translate
- [ ] **TC2.1:** Enable auto-translate in settings
- [ ] **TC2.2:** Send message in Spanish from User B → Auto-translates for User A
- [ ] **TC2.3:** Send message in User A's language → Does NOT auto-translate
- [ ] **TC2.4:** Disable auto-translate → Incoming foreign messages stay in original language
- [ ] **TC2.5:** Change preferred language in settings → New language used for translations
- [ ] **TC2.6:** Auto-translate fails silently if offline (no crash)

### Language Selector
- [ ] **TC3.1:** Open language selector → 25+ languages listed
- [ ] **TC3.2:** Search for "Spanish" → filters results correctly
- [ ] **TC3.3:** Select language → selected language shows checkmark
- [ ] **TC3.4:** Selected language persists after app restart

**Test Messages:**
- Spanish: "Hola, ¿cómo estás? Me encanta este proyecto."
- French: "Bonjour! Comment allez-vous aujourd'hui?"
- German: "Guten Tag! Wie geht es Ihnen?"
- Chinese: "你好！今天天气很好。"

---

## 🌍 Cultural Context Testing

### Context Analysis
- [ ] **TC4.1:** Message with idiom → Context button works → Shows explanation
- [ ] **TC4.2:** Message with cultural reference → Context modal displays correctly
- [ ] **TC4.3:** Plain message → "No cultural references" shown
- [ ] **TC4.4:** Loading indicator shows during analysis
- [ ] **TC4.5:** Error handling works (retry button appears)
- [ ] **TC4.6:** Close modal → Modal disappears
- [ ] **TC4.7:** Re-open modal (same message) → Shows cached result (instant)

**Test Messages:**
- "Break a leg at your presentation tomorrow!"
- "It's raining cats and dogs outside."
- "We need to think outside the box for this project."
- "That idea is a piece of cake to implement."

**Expected Results:**
- Each idiom should have:
  - Phrase identified
  - Type (idiom, cultural_reference, etc.)
  - Explanation
  - Overall context (optional)

---

## 🗣️ Slang & Idiom Testing

### Slang Detection
- [ ] **TC5.1:** Message with slang → Slang button works → Modal opens
- [ ] **TC5.2:** Detected terms show:
  - [ ] Term text
  - [ ] Type badge (slang, idiom, colloquialism)
  - [ ] Formality badge with color
  - [ ] Literal meaning
  - [ ] Actual meaning
  - [ ] Usage example
  - [ ] Regional information
- [ ] **TC5.3:** Message without slang → "No slang detected" with green checkmark
- [ ] **TC5.4:** Loading state shows spinner and text
- [ ] **TC5.5:** Error state shows warning icon and message
- [ ] **TC5.6:** Retry button works after error
- [ ] **TC5.7:** Close modal → Modal disappears
- [ ] **TC5.8:** Re-open modal (cached) → Instant display

**Test Messages:**
- "That's dope! Let's bounce."
- "Stop beating around the bush and spill the tea."
- "I'm gonna crash after this. Totally wiped out."
- "No worries, mate. She'll be right."

**Expected Types:**
- Slang: "dope", "bounce", "tea", "crash", "wiped out"
- Idiom: "beat around the bush"
- Colloquialism: "No worries", "She'll be right"

---

## 📝 Formality Adjustment Testing

### Formality Levels
- [ ] **TC6.1:** Type message → 📝 button enabled
- [ ] **TC6.2:** Empty input → 📝 button disabled
- [ ] **TC6.3:** Tap 📝 → Modal opens with 4 formality levels
- [ ] **TC6.4:** Select **Casual** → Shows adjusted text
- [ ] **TC6.5:** Select **Neutral** → Shows adjusted text
- [ ] **TC6.6:** Select **Formal** → Shows adjusted text
- [ ] **TC6.7:** Select **Very Formal** → Shows adjusted text
- [ ] **TC6.8:** Edit adjusted text → Text updates
- [ ] **TC6.9:** Tap "Apply & Send" → Message sent with adjusted text
- [ ] **TC6.10:** Tap "Cancel" → Modal closes, original text preserved
- [ ] **TC6.11:** Loading state shows spinner
- [ ] **TC6.12:** Error state shows warning

**Test Message:**
"Hey, can you send me the report?"

**Expected Adjustments:**
- **Casual:** "Hey! Could you send me the report?"
- **Neutral:** "Hello, could you please send me the report?"
- **Formal:** "Good day, I would appreciate it if you could send me the report at your earliest convenience."
- **Very Formal:** "Dear Sir/Madam, I would be most grateful if you could kindly provide me with the report at your earliest convenience."

---

## 🤖 Smart Replies Testing

### Reply Generation
- [ ] **TC7.1:** Receive message from User B → Smart replies appear
- [ ] **TC7.2:** 3-4 reply suggestions shown
- [ ] **TC7.3:** Each reply shows:
  - [ ] Type icon (❓, ✅, 💡, 💬)
  - [ ] Reply text
  - [ ] Confidence badge (✨ if confidence > 0.8)
- [ ] **TC7.4:** Horizontal scroll works
- [ ] **TC7.5:** Tap reply → Message sent instantly
- [ ] **TC7.6:** Send own message → Smart replies disappear
- [ ] **TC7.7:** Receive another message → New smart replies generated
- [ ] **TC7.8:** Loading indicator shows during generation
- [ ] **TC7.9:** Error handling works with retry button
- [ ] **TC7.10:** Disable "Smart Replies" in settings → Replies don't appear
- [ ] **TC7.11:** Enable again → Replies reappear

### Personalization
- [ ] **TC7.12:** Send several messages with emojis → AI suggests replies with emojis
- [ ] **TC7.13:** Use casual language → AI suggests casual replies
- [ ] **TC7.14:** Use formal language → AI suggests formal replies
- [ ] **TC7.15:** Ask questions frequently → AI suggests more questions

**Test Conversation:**
1. User B: "Hey, do you want to grab coffee tomorrow?"
2. Expected smart replies: "Sure, what time?", "Sounds great! ☕", "Can we do afternoon instead?"

3. User B: "The project deadline is Friday."
4. Expected smart replies: "Got it, thanks!", "What time on Friday?", "I'll have it ready"

---

## ⚙️ Settings & Integration Testing

### AI Settings Persistence
- [ ] **TC8.1:** Change preferred language → Close app → Reopen → Setting persisted
- [ ] **TC8.2:** Toggle auto-translate → Close app → Reopen → Setting persisted
- [ ] **TC8.3:** Toggle cultural hints → Close app → Reopen → Setting persisted
- [ ] **TC8.4:** Toggle smart replies → Close app → Reopen → Setting persisted

### Profile Screen
- [ ] **TC8.5:** AI Features section displays correctly
- [ ] **TC8.6:** Warning badge shows if AI not configured
- [ ] **TC8.7:** Language selector opens and works
- [ ] **TC8.8:** All toggles work (Switch components)
- [ ] **TC8.9:** Settings descriptions are clear

### Chat Screen Integration
- [ ] **TC8.10:** All AI buttons appear on message bubbles:
  - [ ] 🌐 Translate
  - [ ] 🌍 Context
  - [ ] 🗣️ Slang
- [ ] **TC8.11:** Formality button (📝) appears in message input
- [ ] **TC8.12:** Smart replies bar appears above input (when enabled)
- [ ] **TC8.13:** UI remains responsive with multiple AI features active
- [ ] **TC8.14:** No layout shifts or jumpy UI

---

## 🚨 Error Handling & Edge Cases

### Network Issues
- [ ] **TC9.1:** Disconnect internet → Try translation → Error message appears
- [ ] **TC9.2:** Retry after reconnection → Works correctly
- [ ] **TC9.3:** Offline → Cached translations still work
- [ ] **TC9.4:** Offline → New AI features show appropriate error

### API Rate Limits
- [ ] **TC9.5:** Rapid-fire translations → Rate limit error handled gracefully
- [ ] **TC9.6:** Wait and retry → Works after rate limit clears

### Invalid API Key
- [ ] **TC9.7:** Invalid API key → Shows "Invalid API key" error
- [ ] **TC9.8:** Missing API key → Shows "AI features not configured" warning

### Edge Cases
- [ ] **TC9.9:** Very long message (500+ chars) → All AI features work
- [ ] **TC9.10:** Message with only emojis → Handles gracefully
- [ ] **TC9.11:** Message in unsupported language → Shows error or detects as "unknown"
- [ ] **TC9.12:** Rapid navigation between chats → No memory leaks or crashes
- [ ] **TC9.13:** Background app → Return → AI features still work

---

## 📱 Platform-Specific Testing

### iOS
- [ ] **TC10.1:** All AI features work on iOS
- [ ] **TC10.2:** Modals display correctly
- [ ] **TC10.3:** Keyboard behavior normal with smart replies
- [ ] **TC10.4:** No visual glitches

### Android
- [ ] **TC10.5:** All AI features work on Android
- [ ] **TC10.6:** Modals display correctly
- [ ] **TC10.7:** Keyboard behavior normal with smart replies
- [ ] **TC10.8:** Navigation bar doesn't overlap smart replies
- [ ] **TC10.9:** No visual glitches

---

## 🎨 UI/UX Testing

### Visual Design
- [ ] **TC11.1:** All buttons have consistent style
- [ ] **TC11.2:** Icons render correctly (no missing emojis)
- [ ] **TC11.3:** Colors are accessible (good contrast)
- [ ] **TC11.4:** Modals have proper shadows and animations
- [ ] **TC11.5:** Loading spinners are visible and smooth

### User Experience
- [ ] **TC11.6:** AI buttons are easy to find and tap
- [ ] **TC11.7:** Modals are easy to close
- [ ] **TC11.8:** No accidental taps (buttons properly spaced)
- [ ] **TC11.9:** Transitions are smooth
- [ ] **TC11.10:** Text is readable (font size, line height)

---

## 🏎️ Performance Testing

### Response Times
- [ ] **TC12.1:** First translation: ≤ 3 seconds
- [ ] **TC12.2:** Cached translation: < 100ms
- [ ] **TC12.3:** Smart replies generation: ≤ 4 seconds
- [ ] **TC12.4:** Cultural context analysis: ≤ 3 seconds
- [ ] **TC12.5:** Slang detection: ≤ 3 seconds
- [ ] **TC12.6:** Formality adjustment: ≤ 2 seconds

### Resource Usage
- [ ] **TC12.7:** App doesn't slow down after prolonged AI usage
- [ ] **TC12.8:** Memory usage stays reasonable
- [ ] **TC12.9:** No significant battery drain

---

## 🔐 Security & Privacy Testing

### Data Handling
- [ ] **TC13.1:** API key not exposed in app
- [ ] **TC13.2:** Messages sent to OpenAI are encrypted (HTTPS)
- [ ] **TC13.3:** No sensitive data logged to console in production
- [ ] **TC13.4:** Cached translations stored securely (SQLite)

---

## ✅ Acceptance Criteria

**All AI features must:**
1. ✅ Work on both iOS and Android
2. ✅ Handle errors gracefully (no crashes)
3. ✅ Show loading states
4. ✅ Respect user settings
5. ✅ Persist data correctly
6. ✅ Be accessible and easy to use
7. ✅ Perform within acceptable time limits
8. ✅ Cache results appropriately

---

## 📊 Test Results Template

```markdown
## Test Run: [Date]
**Tester:** [Name]
**Platform:** iOS / Android
**Device:** [Device Model]
**Expo Go Version:** [Version]

### Results Summary
- **Total Tests:** XX
- **Passed:** XX
- **Failed:** XX
- **Blocked:** XX

### Failed Tests
- TC#: [Brief description of failure]
- TC#: [Brief description of failure]

### Notes
- [Any observations or issues]

### Screenshots
- [Attach relevant screenshots]
```

---

## 🐛 Known Issues

Track known issues here:

| ID | Feature | Issue | Severity | Status |
|----|---------|-------|----------|--------|
| - | - | - | - | - |

---

## 🎯 Next Steps

After all tests pass:
1. Document any issues found
2. Create GitHub issues for bugs
3. Update user guide based on testing insights
4. Prepare demo video script
5. Proceed with production deployment

---

**Happy Testing! 🚀**

