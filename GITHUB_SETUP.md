# GitHub Remote Repository Setup

## Option 1: Create Repository via GitHub Website (Recommended)

### Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Fill in the details:
   - **Repository name**: `MessageAI`
   - **Description**: `Cross-platform messaging app with AI features - 7-day sprint project`
   - **Visibility**: Choose Public or Private
   - ⚠️ **Do NOT initialize** with README, .gitignore, or license (we already have these)
3. Click **"Create repository"**

### Step 2: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/MessageAI.git

# Verify the remote was added
git remote -v

# Push your code to GitHub
git push -u origin master
```

### Step 3: Verify

Visit your repository URL: `https://github.com/YOUR_USERNAME/MessageAI`

You should see:
- ✅ README.md
- ✅ MessageAI.md (project requirements)
- ✅ MVP_24HR_PLAN.md
- ✅ TECH_DECISION.md
- ✅ .gitignore

---

## Option 2: Using GitHub CLI (If you install it)

### Install GitHub CLI

**Windows (PowerShell as Administrator):**
```powershell
winget install --id GitHub.cli
```

Or download from: https://cli.github.com/

### Create Repository with CLI

After installation and restart of terminal:

```bash
# Login to GitHub
gh auth login

# Create repository (public)
gh repo create MessageAI --public --source=. --remote=origin --push

# Or create private repository
gh repo create MessageAI --private --source=. --remote=origin --push
```

This automatically creates the repo and pushes your code!

---

## Option 3: Using SSH (If you have SSH keys set up)

```bash
# Add remote with SSH
git remote add origin git@github.com:YOUR_USERNAME/MessageAI.git

# Push code
git push -u origin master
```

---

## Recommended Repository Settings

### Branch Protection (Optional, but good practice)

1. Go to repo → Settings → Branches
2. Add rule for `master` or `main`
3. Enable:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass

### Add Topics (for discoverability)

Add these topics to your repository:
- `react-native`
- `expo`
- `firebase`
- `messaging-app`
- `ai`
- `llm`
- `chatbot`
- `real-time`
- `mobile-app`

### Repository Description

```
Cross-platform messaging app with AI features built with React Native, Expo, and Firebase. 
Includes real-time chat, offline support, and LLM-powered intelligent features.
```

---

## After Pushing to GitHub

### Create Project Board (Optional)

Track your 24-hour sprint:

1. Go to repo → Projects → New project
2. Choose "Board" template
3. Create columns:
   - 📋 Backlog
   - 🏗️ In Progress  
   - ✅ Done
   - 🚀 MVP Complete

Add issues/tasks from MVP_24HR_PLAN.md

### Set Up GitHub Actions (Later)

After MVP, add CI/CD:
- Automated testing
- Expo builds
- Firebase deployment

---

## Git Workflow for This Project

### Daily Commits

```bash
# After each major milestone
git add .
git commit -m "feat: implement one-on-one chat"
git push origin master
```

### Commit Message Convention

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Add tests
- `chore:` - Maintenance

Examples:
```bash
git commit -m "feat: add real-time message sync"
git commit -m "feat: implement offline message queue"
git commit -m "feat: add typing indicators"
git commit -m "fix: messages not persisting on app restart"
git commit -m "feat: implement group chat"
git commit -m "feat: add push notifications"
git commit -m "docs: update README with setup instructions"
```

### Branching Strategy (Optional)

For organized development:

```bash
# Create feature branches
git checkout -b feat/authentication
git checkout -b feat/chat-ui
git checkout -b feat/offline-support
git checkout -b feat/push-notifications
git checkout -b feat/ai-features

# Merge to master when done
git checkout master
git merge feat/authentication
git push origin master
```

---

## Backup Strategy

### Automatic Backups

Push to GitHub regularly (every hour during MVP sprint):

```bash
# Quick backup
git add .
git commit -m "wip: checkpoint at hour X"
git push origin master
```

### Multiple Remotes (Extra Safety)

Add a second remote (e.g., GitLab or Bitbucket):

```bash
git remote add backup https://gitlab.com/YOUR_USERNAME/MessageAI.git
git push backup master
```

---

## Collaboration Setup (If working with others)

### Add Collaborators

1. Go to repo → Settings → Collaborators
2. Add team members by GitHub username

### Clone for Team Members

```bash
git clone https://github.com/YOUR_USERNAME/MessageAI.git
cd MessageAI
npm install  # or yarn
```

---

## Repository Structure

```
MessageAI/
├── .git/                    # Git repository
├── .gitignore              # Git ignore rules
├── README.md               # Project overview
├── MessageAI.md            # Full project requirements
├── MVP_24HR_PLAN.md        # 24-hour MVP timeline
├── TECH_DECISION.md        # Technology stack decision
├── GITHUB_SETUP.md         # This file
│
├── MessageAI-App/          # (Create next - Expo app)
│   ├── app/                # Expo Router pages
│   ├── components/         # React components
│   ├── services/           # Firebase, API services
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Helper functions
│   ├── types/              # TypeScript types
│   └── package.json
│
└── functions/              # (Create later - Firebase Cloud Functions)
    ├── src/
    │   ├── notifications.ts
    │   └── ai.ts
    └── package.json
```

---

## Next Steps

1. ✅ Create GitHub repository (follow Option 1 above)
2. ✅ Push code to GitHub
3. ✅ Verify repository is accessible
4. ⏭️ Start MVP development (follow MVP_24HR_PLAN.md)

---

## Troubleshooting

### "fatal: remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/MessageAI.git
```

### "error: src refspec master does not match any"
```bash
# If your default branch is 'main' instead of 'master'
git branch -M master
git push -u origin master
```

### Authentication Issues
```bash
# Use personal access token instead of password
# Generate at: https://github.com/settings/tokens

# Or use SSH (recommended)
ssh-keygen -t ed25519 -C "your_email@example.com"
# Add key to GitHub: https://github.com/settings/keys
```

---

## Quick Command Reference

```bash
# Check status
git status

# View commit history
git log --oneline

# View remote URL
git remote -v

# Change remote URL
git remote set-url origin NEW_URL

# Pull latest changes
git pull origin master

# Push changes
git push origin master

# Create and push new branch
git checkout -b feature-name
git push -u origin feature-name
```

---

**Ready to create your repository? Follow Option 1 above!** 🚀

