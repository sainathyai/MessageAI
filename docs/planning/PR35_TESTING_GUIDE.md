# PR #35: Voice Messages - Testing Guide

## Implementation Complete ✅

Voice messages functionality has been successfully implemented with the following components:

### New Components
1. **VoiceRecorder** - Press & hold interface for recording audio
2. **VoiceMessage** - Audio playback UI with waveform visualization
3. **WaveformVisualizer** - Visual representation of audio with progress
4. **audio.service.ts** - Core audio recording and playback logic
5. **media.service.ts** - Generic media upload handler

### Integration Points
- MessageInput: Shows mic button when no text, send button when text present
- MessageBubble: Renders VoiceMessage for `type: 'voice'` messages
- Chat screen: Handles voice message sending with optimistic updates
- message.service.ts: `sendVoiceMessage()` function for Firestore & S3 upload

---

## Testing Checklist

### 1. Recording Voice Messages ✅

**Test: Basic Recording**
- [ ] Open any chat conversation
- [ ] Ensure message input is empty (mic button visible)
- [ ] **Press and hold** the microphone button
- [ ] Verify:
  - Recording UI appears with red pulsing dot
  - Duration counter starts (0:00, 0:01, 0:02...)
  - Haptic feedback on start
- [ ] Hold for 3-5 seconds
- [ ] **Release** to send
- [ ] Verify:
  - Success haptic feedback
  - Voice message appears in chat
  - Waveform is visible
  - Duration is accurate

**Test: Slide to Cancel**
- [ ] Press and hold mic button
- [ ] While holding, **slide left** (swipe gesture)
- [ ] Verify:
  - "← Slide to cancel" changes to "🗑️ Release to cancel"
  - Red color indicates cancellation
- [ ] Release when fully slid
- [ ] Verify: Recording is cancelled, no message sent

**Test: Short Recording Rejection**
- [ ] Press and hold mic button
- [ ] Release immediately (< 1 second)
- [ ] Verify:
  - Warning haptic feedback
  - Message not sent
  - "Recording too short" console log

**Test: Auto-stop at 2 Minutes**
- [ ] Press and hold mic button
- [ ] Wait for 2 minutes (120 seconds)
- [ ] Verify:
  - Recording automatically stops and sends
  - Duration shows 2:00
  - Message sent successfully

**Test: Recording During Typing**
- [ ] Type some text in message input
- [ ] Verify: Mic button is hidden, send button visible
- [ ] Clear all text
- [ ] Verify: Mic button reappears

---

### 2. Playing Voice Messages ✅

**Test: Basic Playback**
- [ ] Tap **play button (▶️)** on any voice message
- [ ] Verify:
  - Button changes to pause (⏸️)
  - Waveform animates (bars turn primary color)
  - Duration counts down
  - Audio plays clearly
- [ ] Tap pause button
- [ ] Verify: Playback pauses, waveform stops animating
- [ ] Tap play again
- [ ] Verify: Resumes from paused position

**Test: Playback Speed**
- [ ] Start playing a voice message
- [ ] Tap the **1x** button (bottom right of bubble)
- [ ] Verify: Changes to **1.5x**, audio plays faster
- [ ] Tap again
- [ ] Verify: Changes to **2x**, audio plays even faster
- [ ] Tap again
- [ ] Verify: Cycles back to **1x**, normal speed

**Test: Waveform Progress**
- [ ] Play a voice message
- [ ] Observe waveform bars
- [ ] Verify:
  - Bars fill from left to right with primary color
  - Unfilled bars remain gray/border color
  - Progress matches audio playback position

**Test: Auto-stop at End**
- [ ] Play a voice message to completion
- [ ] Verify:
  - Button returns to play (▶️)
  - Duration resets to full length
  - Playback position resets to start

**Test: Multiple Voice Messages**
- [ ] Play first voice message
- [ ] While playing, tap play on a different voice message
- [ ] Verify:
  - First message stops playing
  - Second message starts playing
  - Only one message plays at a time

---

### 3. UI & Dark Theme 🎨

**Test: Light Theme**
- [ ] Switch to light theme (Settings → Appearance)
- [ ] Record and send a voice message
- [ ] Verify:
  - Recording UI has proper light theme colors
  - Mic button is visible and styled correctly
- [ ] Play the voice message
- [ ] Verify:
  - Voice bubble background is appropriate
  - Waveform colors are visible
  - Text is readable
  - Play button is visible

**Test: Dark Theme**
- [ ] Switch to dark theme
- [ ] Record and send a voice message
- [ ] Verify:
  - Recording UI has proper dark theme colors
  - Mic button contrasts well with dark background
- [ ] Play the voice message
- [ ] Verify:
  - Voice bubble uses dark theme colors
  - Waveform colors are visible against dark background
  - Text is readable
  - All elements are properly themed

**Test: Own vs Other Messages**
- [ ] Send a voice message (own message)
- [ ] Verify:
  - Bubble is right-aligned
  - Uses primary/outgoing bubble color
  - Waveform is white/light colored
- [ ] Receive a voice message from another user
- [ ] Verify:
  - Bubble is left-aligned
  - Uses incoming bubble color
  - Waveform uses primary theme color

---

### 4. Network & Error Handling 🌐

**Test: Offline Recording**
- [ ] Enable airplane mode / disable Wi-Fi
- [ ] Record a voice message
- [ ] Verify:
  - Alert: "Voice message upload requires an internet connection"
  - Message not added to chat
  - Recording is discarded

**Test: Upload Progress**
- [ ] Enable slow 3G network simulation (optional)
- [ ] Record a long voice message (30+ seconds)
- [ ] Send it
- [ ] Watch console logs
- [ ] Verify:
  - Optimistic message appears immediately with "sending" status
  - Upload progress logs in console
  - Message updates to "sent" after upload completes

**Test: Upload Failure**
- [ ] Record a voice message
- [ ] Simulate network failure (disconnect mid-upload)
- [ ] Verify:
  - Message marked as "failed"
  - Error alert: "Failed to upload voice message"
  - Retry option available (if implemented)

**Test: Reconnection & Retry**
- [ ] Send a voice message that fails
- [ ] Reconnect to network
- [ ] Verify: Message can be retried successfully

---

### 5. Group Chat Support 👥

**Test: Group Chat Voice Messages**
- [ ] Open a group chat
- [ ] Record and send a voice message
- [ ] Verify:
  - Message sent successfully
  - Avatar appears for incoming voice messages (if in group)
  - Voice message UI works identically to 1:1 chats

---

### 6. Permissions 🔐

**Test: First-time Audio Permission**
- [ ] Uninstall and reinstall app (or clear permissions)
- [ ] Open a chat
- [ ] Press and hold mic button
- [ ] Verify:
  - System permission prompt appears
  - After granting, recording starts
- [ ] Deny permission
- [ ] Verify:
  - Alert or message about audio permission required
  - Recording does not start

---

### 7. Performance & Memory 💾

**Test: Multiple Recordings**
- [ ] Record and send 10 voice messages in a row
- [ ] Verify:
  - App remains responsive
  - No memory leaks
  - Each recording is unique and accurate

**Test: Long Playback Session**
- [ ] Play 5+ voice messages consecutively
- [ ] Verify:
  - Audio quality remains consistent
  - No stuttering or lag
  - Previous audio is properly cleaned up

---

### 8. Edge Cases 🔍

**Test: Background App During Recording**
- [ ] Start recording a voice message
- [ ] Switch to another app (home button)
- [ ] Verify:
  - Recording stops automatically
  - No message is sent

**Test: Incoming Call During Playback**
- [ ] Play a voice message
- [ ] Simulate incoming call
- [ ] Verify:
  - Playback pauses automatically
  - After call, playback can resume

**Test: Very Short Voice Messages**
- [ ] Record exactly 1 second (tap and immediately release)
- [ ] Verify: Message is sent successfully

**Test: File Size**
- [ ] Record a 2-minute voice message
- [ ] Check file size in logs
- [ ] Verify: File size is reasonable (< 5 MB for 2 min at 128kbps)

---

## Success Criteria ✅

All tests pass, and:
- ✅ Recording UI is intuitive and responsive
- ✅ Slide-to-cancel works smoothly
- ✅ Playback is clear and reliable
- ✅ Waveform visualization is accurate
- ✅ Dark theme support is complete
- ✅ Error handling is robust
- ✅ Performance is smooth (no lag or stuttering)
- ✅ Works in both 1:1 and group chats

---

## Known Limitations

1. **Max Duration:** 2 minutes per voice message
2. **Format:** M4A (AAC) for cross-platform compatibility
3. **Playback Speed:** 1x, 1.5x, 2x only
4. **Background Recording:** Not supported (stops if app is backgrounded)

---

## Next Steps

After testing passes:
1. Test on physical Android device
2. Test on physical iOS device (via Expo Go or TestFlight)
3. Verify S3 upload and storage
4. Confirm push notifications for voice messages
5. Document any device-specific issues

---

## Implementation Files

### New Files:
- `services/audio.service.ts` - Audio recording & playback logic
- `services/media.service.ts` - Generic media upload
- `components/VoiceRecorder.tsx` - Recording UI
- `components/VoiceMessage.tsx` - Playback UI
- `components/WaveformVisualizer.tsx` - Waveform display

### Modified Files:
- `components/MessageInput.tsx` - Added voice recorder integration
- `components/MessageBubble.tsx` - Added voice message rendering
- `app/chat/[id].tsx` - Added voice message handler
- `services/message.service.ts` - Added `sendVoiceMessage()`
- `types/index.ts` - Voice type already supported in Message interface

---

## Testing Date: _____________

**Tester:** _____________  
**Device:** _____________  
**OS Version:** _____________  
**Result:** ☐ Pass | ☐ Fail  

**Notes:**

