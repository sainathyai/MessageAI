# MessageAI - Comprehensive Testing Guide

## 🧪 Testing Overview

This guide provides detailed testing procedures for all MessageAI features. All tests should pass before production deployment.

---

## ✅ Pre-Testing Checklist

- [ ] Firebase project configured
- [ ] Firestore indexes created
- [ ] App running on test device(s)
- [ ] At least 2 test accounts created
- [ ] Network conditions can be simulated

---

## 🔐 Authentication Testing

### Test Case AUTH-001: Sign Up
**Objective**: Verify new user registration

**Steps**:
1. Open app
2. Tap "Sign Up"
3. Enter email: `testuser1@example.com`
4. Enter password: `TestPass123!`
5. Enter display name: `Test User 1`
6. Tap "Sign Up"

**Expected Results**:
- ✅ Loading indicator appears
- ✅ Account created successfully
- ✅ Redirected to chat list screen
- ✅ User data saved in Firestore `/users/{uid}`

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case AUTH-002: Sign In
**Objective**: Verify existing user login

**Steps**:
1. Open app
2. Enter email: `testuser1@example.com`
3. Enter password: `TestPass123!`
4. Tap "Sign In"

**Expected Results**:
- ✅ Loading indicator appears
- ✅ Login successful
- ✅ Redirected to chat list
- ✅ User's conversations loaded

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case AUTH-003: Session Persistence
**Objective**: Verify user stays logged in

**Steps**:
1. Sign in to app
2. Force quit app (swipe up from recent apps)
3. Reopen app

**Expected Results**:
- ✅ App opens directly to chat list
- ✅ No login screen shown
- ✅ Previous state restored

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case AUTH-004: Sign Out
**Objective**: Verify logout functionality

**Steps**:
1. Navigate to Profile tab
2. Tap "Sign Out"
3. Confirm sign out

**Expected Results**:
- ✅ Confirmation dialog appears
- ✅ User logged out
- ✅ Redirected to login screen
- ✅ Data cleared from memory

**Status**: ⬜ Pass / ⬜ Fail

---

## 💬 One-on-One Chat Testing

### Test Case CHAT-001: Start New Conversation
**Objective**: Create a new 1-on-1 conversation

**Prerequisites**: 2 test accounts (User A, User B)

**Steps** (User A):
1. Tap "+" button on chat list
2. Search for "User B"
3. Select User B from results
4. Type message: "Hello!"
5. Tap send

**Expected Results**:
- ✅ User B found in search
- ✅ New conversation created
- ✅ Message appears instantly (optimistic UI)
- ✅ Message status: sending → sent
- ✅ Conversation appears in chat list

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case CHAT-002: Real-Time Message Delivery
**Objective**: Verify real-time sync between devices

**Prerequisites**: User A (Device 1), User B (Device 2)

**Steps**:
1. **Device 1 (User A)**: Send message "Test message 1"
2. **Device 2 (User B)**: Observe chat screen

**Expected Results**:
- ✅ Message appears on Device 2 within 1 second
- ✅ No refresh needed
- ✅ Correct sender shown
- ✅ Correct timestamp shown

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case CHAT-003: Message Status Indicators
**Objective**: Verify all message states display correctly

**Steps** (User A):
1. Send message
2. Observe status changes

**Expected Results**:
- ✅ Spinner shows while sending
- ✅ Single checkmark (✓) when sent
- ✅ Double checkmark (✓✓) when delivered
- ✅ Blue double checkmark (✓✓) when read
- ✅ Exclamation (!) if send fails

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case CHAT-004: Typing Indicator
**Objective**: Verify typing detection

**Prerequisites**: User A (Device 1), User B (Device 2)

**Steps**:
1. **Device 1 (User A)**: Start typing
2. **Device 2 (User B)**: Observe chat screen

**Expected Results**:
- ✅ "User A is typing..." appears on Device 2
- ✅ Animated dots show
- ✅ Disappears after 5 seconds of inactivity
- ✅ Disappears when message sent

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case CHAT-005: Read Receipts
**Objective**: Verify read receipt functionality

**Prerequisites**: User A (Device 1), User B (Device 2)

**Steps**:
1. **Device 1 (User A)**: Send message
2. **Device 2 (User B)**: Open chat (view message)
3. **Device 1 (User A)**: Observe message status

**Expected Results**:
- ✅ Status changes from "delivered" to "read"
- ✅ Double checkmark turns blue
- ✅ Change happens within 2 seconds

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case CHAT-006: Online Status
**Objective**: Verify presence indicators

**Steps**:
1. **User B**: Close app or go offline
2. **User A**: Observe chat header

**Expected Results**:
- ✅ Green dot shows when User B online
- ✅ Gray dot shows when User B offline
- ✅ "Last seen X minutes ago" displays
- ✅ Updates in real-time

**Status**: ⬜ Pass / ⬜ Fail

---

## 👥 Group Chat Testing

### Test Case GROUP-001: Create Group
**Objective**: Create a group chat

**Prerequisites**: 3 test accounts (User A, B, C)

**Steps** (User A):
1. Tap "👥 Group" button
2. Enter group name: "Test Group"
3. Search and select User B
4. Search and select User C
5. Tap "Create Group"

**Expected Results**:
- ✅ Group created successfully
- ✅ Redirected to group chat
- ✅ Group name displays in header
- ✅ Member count shows (3 members)
- ✅ All members receive group in their chat list

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case GROUP-002: Group Messaging
**Objective**: Send messages in group

**Steps** (User A):
1. Send message in group: "Hello group!"
2. Observe on all devices

**Expected Results**:
- ✅ Message shows sender name
- ✅ All members receive message
- ✅ Real-time delivery (<2 seconds)
- ✅ Message persists in group history

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case GROUP-003: Group Read Receipts
**Objective**: Verify read count in groups

**Prerequisites**: Group with 3 members

**Steps**:
1. **User A**: Send message
2. **User B**: Open group, read message
3. **User C**: Don't open group
4. **User A**: Check message status

**Expected Results**:
- ✅ Shows "Read by 1" (User B)
- ✅ Updates when User C reads
- ✅ Shows "Read by 2" when both read
- ✅ Doesn't count sender in read count

**Status**: ⬜ Pass / ⬜ Fail

---

## 📴 Offline Support Testing

### Test Case OFFLINE-001: Send While Offline
**Objective**: Queue messages when offline

**Steps**:
1. Enable Airplane Mode on device
2. Send message: "Offline test"
3. Observe message status

**Expected Results**:
- ✅ Message appears in chat
- ✅ Status shows "pending" or clock icon
- ✅ Saved to local SQLite database
- ✅ No error shown

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case OFFLINE-002: Auto-Sync on Reconnect
**Objective**: Verify automatic message sending

**Prerequisites**: Messages queued offline

**Steps**:
1. Disable Airplane Mode
2. Wait for connection
3. Observe messages

**Expected Results**:
- ✅ Messages send automatically
- ✅ Status updates to "sent"
- ✅ No user action required
- ✅ Recipient receives messages
- ✅ Order preserved

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case OFFLINE-003: Load from Cache
**Objective**: Verify instant loading from cache

**Steps**:
1. Use app normally for a few minutes
2. Force quit app
3. Enable Airplane Mode
4. Reopen app

**Expected Results**:
- ✅ Chat list loads instantly (<1 second)
- ✅ Previous conversations visible
- ✅ Can open conversations
- ✅ Message history displays
- ✅ "Offline" indicator shown

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case OFFLINE-004: Receive While Offline
**Objective**: Sync messages when coming online

**Steps**:
1. **Device 1**: Enable Airplane Mode
2. **Device 2**: Send messages
3. **Device 1**: Disable Airplane Mode
4. Observe chat screen

**Expected Results**:
- ✅ New messages appear automatically
- ✅ Notification shown for new messages
- ✅ Chat list updates
- ✅ Message order correct

**Status**: ⬜ Pass / ⬜ Fail

---

## 🔔 Notification Testing

### Test Case NOTIF-001: Foreground Notification
**Objective**: Receive notification while app is open

**Prerequisites**: 2 devices

**Steps**:
1. **Device 1**: Have app open on chat list
2. **Device 2**: Send message to Device 1

**Expected Results**:
- ✅ Notification appears at top of screen
- ✅ Shows sender name
- ✅ Shows message preview
- ✅ Notification sound plays
- ✅ Chat list updates

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case NOTIF-002: Background Notification
**Objective**: Receive notification when app in background

**Steps**:
1. **Device 1**: Minimize app (home button)
2. **Device 2**: Send message

**Expected Results**:
- ✅ Notification appears in notification center
- ✅ Badge count increments
- ✅ Shows sender and message preview
- ✅ Notification sound/vibration

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case NOTIF-003: Deep Linking
**Objective**: Open correct chat from notification

**Steps**:
1. Receive notification
2. Tap notification

**Expected Results**:
- ✅ App opens
- ✅ Navigates to correct conversation
- ✅ Shows full message history
- ✅ Badge count cleared

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case NOTIF-004: Badge Count
**Objective**: Verify badge management

**Steps**:
1. Receive multiple messages while app closed
2. Observe app icon
3. Open app

**Expected Results**:
- ✅ Badge shows message count
- ✅ Badge clears when app opened
- ✅ Badge updates with new messages
- ✅ Badge clears when messages read

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case NOTIF-005: Notification Permissions
**Objective**: Request and handle permissions

**Steps**:
1. Fresh install app
2. Sign in

**Expected Results**:
- ✅ Permission dialog appears
- ✅ Graceful handling if denied
- ✅ Push token saved if granted
- ✅ Can enable later from settings

**Status**: ⬜ Pass / ⬜ Fail

---

## 🎨 UI/UX Testing

### Test Case UI-001: Empty States
**Objective**: Verify empty state displays

**Steps**:
1. Sign in with new account (no conversations)
2. Observe chat list

**Expected Results**:
- ✅ Empty state message shows
- ✅ Icon displayed
- ✅ Helpful text: "Tap + to start"
- ✅ No blank screen

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case UI-002: Loading States
**Objective**: Verify loading indicators

**Steps**:
1. Perform various actions (send message, load chats, etc.)
2. Observe UI during loading

**Expected Results**:
- ✅ Spinner shows during async operations
- ✅ Loading message displayed
- ✅ UI not frozen
- ✅ Clear when operation completes

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case UI-003: Error Handling
**Objective**: Verify error messages

**Steps**:
1. Disable internet
2. Try to sign in

**Expected Results**:
- ✅ Clear error message shown
- ✅ Retry button available
- ✅ No app crash
- ✅ User can recover

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case UI-004: Date Formatting
**Objective**: Verify timestamps display correctly

**Steps**:
1. Send messages at different times
2. Observe timestamps

**Expected Results**:
- ✅ "Just now" for recent (<1 min)
- ✅ "5m ago" for minutes
- ✅ "HH:MM" for today
- ✅ "Yesterday" for yesterday
- ✅ "MM/DD" for older

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case UI-005: Avatars
**Objective**: Verify avatar display

**Steps**:
1. View chat list and conversations
2. Observe user avatars

**Expected Results**:
- ✅ Colorful background
- ✅ Initials displayed (2 letters)
- ✅ Consistent color per user
- ✅ Green dot for online users
- ✅ Group icon for groups

**Status**: ⬜ Pass / ⬜ Fail

---

## 🚀 Performance Testing

### Test Case PERF-001: Message Send Latency
**Objective**: Measure optimistic UI speed

**Steps**:
1. Send 10 messages
2. Measure time from tap to display

**Expected Results**:
- ✅ < 100ms for optimistic display
- ✅ < 1s for Firestore confirmation
- ✅ Consistent performance

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case PERF-002: Initial Load Time
**Objective**: Measure app startup

**Steps**:
1. Force quit app
2. Restart app
3. Measure time to chat list

**Expected Results**:
- ✅ < 2s from SQLite cache
- ✅ < 3s with Firestore sync
- ✅ No blank screens

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case PERF-003: Scroll Performance
**Objective**: Verify smooth scrolling

**Steps**:
1. Load conversation with 100+ messages
2. Scroll up and down rapidly

**Expected Results**:
- ✅ Smooth 60fps scrolling
- ✅ No lag or stuttering
- ✅ Messages render correctly

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case PERF-004: Rapid Message Sending
**Objective**: Test high-frequency operations

**Steps**:
1. Send 20 messages rapidly
2. Observe app behavior

**Expected Results**:
- ✅ All messages queued
- ✅ All messages sent
- ✅ Correct order preserved
- ✅ No UI freeze
- ✅ No messages lost

**Status**: ⬜ Pass / ⬜ Fail

---

## 🔍 Edge Case Testing

### Test Case EDGE-001: Poor Network
**Objective**: Test on slow connection

**Steps**:
1. Use network throttling (3G/2G)
2. Send messages
3. Navigate app

**Expected Results**:
- ✅ App remains usable
- ✅ Messages queue properly
- ✅ Retry logic works
- ✅ Feedback provided to user

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case EDGE-002: Long Messages
**Objective**: Handle large text input

**Steps**:
1. Send message with 1000+ characters
2. Observe display

**Expected Results**:
- ✅ Message sent successfully
- ✅ Text wraps correctly
- ✅ Bubble adjusts size
- ✅ Readable formatting

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case EDGE-003: Special Characters
**Objective**: Handle emojis and Unicode

**Steps**:
1. Send message: "Hello 👋 🌍 测试"
2. Observe on all devices

**Expected Results**:
- ✅ All characters display correctly
- ✅ Emojis render properly
- ✅ No encoding issues

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Case EDGE-004: App Interruptions
**Objective**: Handle phone calls, notifications

**Steps**:
1. While in app, receive phone call
2. Answer call
3. End call, return to app

**Expected Results**:
- ✅ App state preserved
- ✅ Connection restored
- ✅ No data loss
- ✅ Sync continues

**Status**: ⬜ Pass / ⬜ Fail

---

## 📊 Test Summary

### Test Statistics
- **Total Test Cases**: 35
- **Passed**: ___
- **Failed**: ___
- **Skipped**: ___
- **Success Rate**: ___%

### Critical Issues Found
1. _______________________
2. _______________________
3. _______________________

### Known Limitations
1. Remote push requires custom build
2. Web support limited (mobile-first)
3. Media sharing not implemented

### Recommendations
- [ ] All critical tests must pass
- [ ] No P0/P1 bugs remaining
- [ ] Performance targets met
- [ ] Ready for production deployment

---

**Test Date**: ________________  
**Tested By**: ________________  
**App Version**: 1.0.0  
**Build**: Development / Production  
**Devices Tested**: ________________  
**Sign-off**: ________________

