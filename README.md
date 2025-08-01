# Sycophancy - Authentic AI Conversations

**Sycophancy** - Because sometimes you need an AI that tells you what you need to hear, not just what you want to hear.

Unlike typical AI chatbots that tend to be overly agreeable, Sycophancy features a sophisticated **Anti-Sycophancy Engine** that challenges users, presents counterarguments, and provides genuinely authentic conversations.

## 🚀 Quick Start

### Prerequisites
- Modern web browser
- OpenRouter API key

### Setup

1. **Clone or download** this repository
2. **Configure API access** (see [Configuration](#configuration) below)
3. **Open** `index.html` in your web browser
4. **Start chatting** with authentic AI responses!

No build process required - it's a static web application.

## ⚙️ Configuration

### Setting up `config.json`

The application requires proper configuration in `config.json`. Here's how to set it up:

#### 1. **OpenRouter API Key** (Required)
Replace the placeholder with your actual OpenRouter API key:

```json
{
  "openRouterApiKey": "your-openrouter-api-key-here"
}
```

**Getting an OpenRouter API Key:**
1. Visit [openrouter.ai](https://openrouter.ai)
2. Sign up for an account
3. Navigate to API Keys section
4. Generate a new API key
5. Copy and paste it into your `config.json`

#### 2. **Model Configuration**
The default configuration includes popular models:

```json
{
  "defaultModel": "openai/gpt-4",
  "availableModels": [
    {
      "id": "openai/gpt-4.1",
      "name": "GPT-4.1",
      "provider": "OpenAI"
    },
    {
      "id": "anthropic/claude-sonnet-4",
      "name": "Claude Sonnet 4", 
      "provider": "Anthropic"
    }
  ]
}
```

#### 3. **Anti-Sycophancy Engine Settings** (Optional)
Fine-tune the anti-sycophancy behavior:

```json
{
  "antiSycophancyEngine": {
    "baseDisagreementMin": 15,
    "baseDisagreementMax": 30,
    "topicModifiers": {
      "personal": 0.7,    // Less challenging on personal topics
      "factual": 1.2,     // More rigorous on factual claims
      "philosophical": 1.3 // Very challenging on philosophical topics
    },
    "challengeTypes": {
      "devils_advocate": {
        "enabled": true,
        "intensity": 0.8
      },
      "socratic": {
        "enabled": true,
        "intensity": 0.6
      }
    }
  }
}
```

## 🛠️ Development

### **Running Locally**
Simply open `index.html` in any modern web browser. No build process required.

### **Key Files to Modify**
- `config.json`: API keys, models, engine settings
- `js/antisycophancy-engine.js`: Challenge logic and prompting
- `js/app.js`: UI logic and chat management
- `css/styles.css`: Styling and theme

### **Adding Models**
Add new models to `config.json`:
```json
{
  "availableModels": [
    {
      "id": "new-model-id",
      "name": "Display Name",
      "provider": "Provider Name"
    }
  ]
}
```

---