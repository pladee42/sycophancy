# Zero - Zero Clutter

**Zero** - Because sometimes you need an AI that tells you what you need to hear, not just what you want to hear.

Unlike typical AI chatbots that tend to be overly agreeable, Zero features a sophisticated **Anti-Sycophancy Engine** that challenges users, presents counterarguments, and provides genuinely authentic conversations.

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

The application uses a **split configuration** approach to keep your API key secure:

- **`config.public.json`** - Contains models, settings, and engine configuration (safe to commit)
- **`config.private.json`** - Contains only your OpenRouter API key (excluded from git)

### Setting up Configuration Files

#### 1. **Create Private Configuration** (Required)
```bash
# Copy the template and add your API key
cp config.private.example.json config.private.json
```

Edit `config.private.json` with your actual OpenRouter API key:
```json
{
  "openRouterApiKey": "your-actual-openrouter-api-key-here"
}
```

**Getting an OpenRouter API Key:**
1. Visit [openrouter.ai](https://openrouter.ai)
2. Sign up for an account
3. Navigate to API Keys section
4. Generate a new API key
5. Copy and paste it into your `config.private.json`

#### 2. **Public Configuration** (Pre-configured)
The `config.public.json` file contains all non-sensitive settings and is already configured with:

- **Available AI Models**: GPT-4.1, Claude Sonnet 4, Llama 4, Gemini 2.5 Pro, Grok 4, etc.
- **Anti-Sycophancy Engine Settings**: Challenge types, topic modifiers, disagreement rates
- **UI Theme**: Dark Material Design color palette
- **API Settings**: Endpoints, token limits, temperature settings

You can customize these settings by editing `config.public.json` directly.

## 🛠️ Development

### **Running Locally**
Simply open `index.html` in any modern web browser. No build process required.

### **Key Files to Modify**
- `config.public.json`: Models, engine settings, UI theme
- `config.private.json`: Your OpenRouter API key only
- `js/antisycophancy-engine.js`: Challenge logic and prompting
- `js/app.js`: UI logic and chat management
- `css/styles.css`: Styling and theme

### **Adding Models**
Add new models to `config.public.json`:
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

## 📚 References

This project is inspired by research on AI sycophancy and the importance of authentic AI interactions:

- Cheng, M., Yu, S., Lee, C., Khadpe, P., Ibrahim, L., & Jurafsky, D. (2024). Social Sycophancy: A Broader Understanding of LLM Sycophancy. *arXiv preprint arXiv:2505.13995*. https://arxiv.org/html/2505.13995v1

---