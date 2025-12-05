# Phantom AI

An AI-powered desktop automation agent that controls your computer through natural language commands.

## Features

- 🤖 **Natural Language Control** - Just describe what you want to do
- 👁️ **Vision AI** - Uses Ollama (LLaVA) to see and understand your screen
- 🖱️ **Full Computer Control** - Mouse, keyboard, clipboard, window management
- 🔒 **Safety First** - Activity logging, rate limiting, confirmation dialogs
- 💎 **Modern UI** - Beautiful dark theme with glass morphism

## Requirements

- macOS 11+ / Windows 10+ / Linux
- [Ollama](https://ollama.com) with a vision model (recommended: `llava:13b` or `qwen2-vl:2b`)

## Quick Start

### Desktop App

```bash
cd desktop
npm install
npm run dev
```

### Website

```bash
cd website
npm install
npm run dev
```

## Building for Distribution

```bash
cd desktop

# Mac
npm run dist:mac

# Windows
npm run dist:win

# Linux
npm run dist:linux
```

## Tech Stack

- **Desktop**: Electron + React + TypeScript + Vite
- **Website**: Next.js 14 + Tailwind CSS
- **AI**: Ollama (local vision models)
- **Payments**: Stripe

## Pricing

- **7-day free trial**
- **Pro**: $9.99/month or $49 lifetime

## License

MIT License

---

Made with ❤️ by the Phantom AI Team
