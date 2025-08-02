# Azure Deployment Guide for Sycophancy

This guide will help you deploy the Sycophancy AI chatbot to Azure while keeping your API keys secure.

## 📋 Configuration Architecture

The project uses a **split configuration** approach:
- **`config.public.json`** - Contains all non-sensitive settings (models, colors, Anti-Sycophancy Engine settings) - safe to commit to repo
- **`config.private.json`** - Contains only the OpenRouter API key - excluded from git via `.gitignore`
- **Azure Environment Variables** - API key is injected at runtime via `OPENROUTER_API_KEY`

## 🚀 Deployment Options

### Option 1: Azure Static Web Apps (Recommended)

Azure Static Web Apps is perfect for this project since it's a static HTML/CSS/JS application.

#### Step 1: Prepare Your Repository

1. **Set up your private configuration locally:**
   ```bash
   # Copy the private config template and add your API key
   cp config.private.example.json config.private.json
   # Edit config.private.json with your actual OpenRouter API key
   ```

2. **Verify `.gitignore` excludes sensitive files:**
   ```bash
   # Ensure these files are listed in .gitignore:
   # config.json (legacy)
   # config.private.json (new)
   ```

3. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add split configuration architecture"
   git push origin main
   ```
   
   **Note:** Only `config.public.json` and `config.private.example.json` will be committed. Your actual `config.private.json` with the real API key stays local.

#### Step 2: Create Azure Static Web App

1. **Using Azure Portal:**
   - Go to [Azure Portal](https://portal.azure.com)
   - Click "Create a resource" → "Static Web App"
   - Fill in the details:
     - **Subscription:** Your Azure subscription
     - **Resource Group:** Create new or use existing
     - **Name:** `sycophancy-app` (or your preferred name)
     - **Region:** Choose closest region
     - **Source:** GitHub
     - **GitHub Repository:** Your repository
     - **Branch:** `main`
     - **Build Presets:** Custom
     - **App location:** `/`
     - **Output location:** `/`

2. **Using Azure CLI:**
   ```bash
   # Login to Azure
   az login

   # Create resource group
   az group create --name sycophancy-rg --location "Central US"

   # Create static web app
   az staticwebapp create \
     --name sycophancy-app \
     --resource-group sycophancy-rg \
     --source https://github.com/yourusername/sycophancy \
     --location "Central US" \
     --branch main \
     --app-location "/" \
     --output-location "/"
   ```

#### Step 3: Set Up GitHub Repository Secrets

**⚠️ CRITICAL: Set up Azure Static Web Apps API Token**

This step is **required** for the GitHub Actions workflow to work. Without this token, deployment will fail.

1. **Get the Deployment Token from Azure:**
   - Go to your Static Web App in Azure Portal
   - Navigate to **Overview** tab
   - Click **"Manage deployment token"**
   - Copy the deployment token

2. **Add Token to GitHub Repository:**
   - Go to your GitHub repository
   - Click **Settings** → **Secrets and variables** → **Actions**
   - Click **"New repository secret"**
   - **Name:** `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - **Value:** Paste the deployment token from Azure
   - Click **"Add secret"**

#### Step 4: Add OpenRouter API Key to GitHub Secrets

**⚠️ IMPORTANT:** Azure Static Web Apps environment variables are **not accessible** to client-side JavaScript. Instead, the API key must be added to GitHub repository secrets.

1. **Add API Key to GitHub Secrets:**
   - Go to your GitHub repository
   - Click **Settings** → **Secrets and variables** → **Actions**
   - Click **"New repository secret"**
   - **Name:** `OPENROUTER_API_KEY`
   - **Value:** Your actual OpenRouter API key
   - Click **"Add secret"**

2. **How it works:**
   - GitHub Actions creates `config.private.json` during deployment
   - Your deployed site will have the API key available
   - The API key is injected at build time, not runtime

### Option 2: Azure App Service

If you prefer more control, you can use Azure App Service:

```bash
# Create App Service Plan
az appservice plan create \
  --name sycophancy-plan \
  --resource-group sycophancy-rg \
  --sku FREE

# Create Web App
az webapp create \
  --resource-group sycophancy-rg \
  --plan sycophancy-plan \
  --name sycophancy-app \
  --runtime "NODE|18-lts"

# Set environment variables
az webapp config appsettings set \
  --resource-group sycophancy-rg \
  --name sycophancy-app \
  --settings OPENROUTER_API_KEY="your-actual-api-key"

# Deploy from GitHub
az webapp deployment source config \
  --resource-group sycophancy-rg \
  --name sycophancy-app \
  --repo-url https://github.com/yourusername/sycophancy \
  --branch main \
  --manual-integration
```

## 🔐 Security Best Practices

### 1. Configuration Loading Order

The application loads configuration in this priority order:

**Configuration Files:**
1. `config.public.json` - Always loaded (contains models, settings, engine configuration)
2. `config.private.json` - Loaded if available locally (contains API key)

**API Key Resolution:**
1. Private config file (`config.private.json`)
2. `window.OPENROUTER_API_KEY` (Azure environment variable)
3. `sessionStorage.getItem('openrouter_api_key')`  
4. `localStorage.getItem('openrouter_api_key')`
5. User prompt (fallback)

### 2. GitHub Secrets

**Required Secrets for Deployment:**

| Secret Name | Required | Source | Purpose |
|-------------|----------|---------|---------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | ✅ **Yes** | Azure Portal | Enables GitHub Actions deployment |
| `OPENROUTER_API_KEY` | ✅ **Yes** | OpenRouter | Your OpenRouter API key for the deployed site |

**Setting up GitHub Secrets:**
1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"** for each required secret:
   - **`AZURE_STATIC_WEB_APPS_API_TOKEN`**: Get from Azure Portal (Static Web App → Overview → Manage deployment token)
   - **`OPENROUTER_API_KEY`**: Your actual OpenRouter API key

**Important:** Azure Static Web Apps cannot access environment variables from client-side JavaScript. The GitHub Actions workflow creates `config.private.json` with your API key during deployment.

### 3. Multiple Environments

You can create different private config files for different environments:

**config.private.development.json:**
```json
{
  "openRouterApiKey": "your-dev-api-key"
}
```

**config.private.production.json:**
```json
{
  "openRouterApiKey": "your-prod-api-key"
}
```

Then copy the appropriate one to `config.private.json` for your environment, or better yet, use Azure environment variables for production.

## 🛠️ Manual Deployment Steps

If you prefer manual deployment:

1. **Prepare files:**
   ```bash
   # The public config is already ready for deployment
   # No need to create any additional files - Azure will handle the API key via environment variables
   ```

2. **Create ZIP file:**
   ```bash
   zip -r sycophancy-deploy.zip . -x "*.git*" "*node_modules*" "*.DS_Store*"
   ```

3. **Upload to Azure:**
   - Use Azure Portal's deployment center
   - Or use Azure CLI:
     ```bash
     az webapp deployment source config-zip \
       --resource-group sycophancy-rg \
       --name sycophancy-app \
       --src sycophancy-deploy.zip
     ```

4. **Set environment variables in Azure Portal**

## 🔍 Troubleshooting

### Common Issues:

**1. "deployment_token was not provided" error:**
- ❌ **Cause:** Missing `AZURE_STATIC_WEB_APPS_API_TOKEN` in GitHub repository secrets
- ✅ **Solution:** 
  1. Get deployment token from Azure Portal (Static Web App → Overview → Manage deployment token)
  2. Add token to GitHub repo secrets as `AZURE_STATIC_WEB_APPS_API_TOKEN`
  3. Re-run the GitHub Actions workflow

**2. "Please configure your OpenRouter API key" error:**
- Check that `config.public.json` is loading correctly
- Verify Azure environment variable `OPENROUTER_API_KEY` is set correctly
- Ensure the app has been restarted after setting variables
- For local development, ensure `config.private.json` exists with your API key

**3. GitHub Actions workflow fails:**
- Check the GitHub Actions logs for specific error messages
- Ensure `.github/workflows/azure-static-web-apps.yml` is correct
- Verify all required GitHub secrets are set:
  - `AZURE_STATIC_WEB_APPS_API_TOKEN` (required)
  - `GITHUB_TOKEN` (automatically provided by GitHub)

**4. Build failures:**
- Verify that `config.public.json` exists in the repository root
- Check that all required files are committed to the repository
- Ensure no build process is required (this is a static site)

**5. Static files not loading:**
- Check that font files are included in deployment
- Verify CSS and JS files are accessible
- Ensure file paths are correct and case-sensitive

**6. Azure Static Web App not creating:**
- Verify you have proper Azure subscription permissions
- Check that the resource group exists
- Ensure the GitHub repository is accessible to Azure
- Try using Azure CLI as an alternative to the portal

### Debug Mode:

Set `debug: true` in your config to see detailed logs:
```json
{
  "debug": true
}
```

## 📋 Deployment Checklist

### Repository Setup
- [ ] Repository pushed to GitHub
- [ ] `.gitignore` includes `config.private.json` 
- [ ] `config.public.json` committed to repository
- [ ] `config.private.example.json` committed as template
- [ ] Local `config.private.json` created with your API key

### Azure Setup
- [ ] Azure Static Web App created
- [ ] ~~Environment variable `OPENROUTER_API_KEY` set in Azure~~ (Not needed - use GitHub secrets instead)

### GitHub Actions Setup
- [ ] **`AZURE_STATIC_WEB_APPS_API_TOKEN`** secret added to GitHub repository
- [ ] **`OPENROUTER_API_KEY`** secret added to GitHub repository  
- [ ] GitHub Actions workflow configured and runs successfully
- [ ] Deployment workflow completes without errors

### Optional
- [ ] Domain configured (if using custom domain)
- [ ] SSL certificate configured (automatic with Azure Static Web Apps)

### Verification
- [ ] Website loads correctly on Azure Static Web Apps URL
- [ ] API key is working (can send chat messages)
- [ ] All static assets (CSS, JS, fonts) load properly

## 🌐 Custom Domain (Optional)

To use a custom domain:

1. **Azure Portal:**
   - Go to your Static Web App
   - Click "Custom domains"
   - Add your domain
   - Follow DNS configuration instructions

2. **Azure CLI:**
   ```bash
   az staticwebapp hostname set \
     --name sycophancy-app \
     --hostname yourdomain.com
   ```

Your Sycophancy app will be available at:
- Default: `https://your-app-name.azurestaticapps.net`
- Custom: `https://yourdomain.com` (if configured)

## 💡 Tips

1. **Use staging environments** for testing before production
2. **Monitor costs** - Azure Static Web Apps has a generous free tier
3. **Set up monitoring** using Azure Application Insights
4. **Regular backups** of your configuration and data
5. **Keep dependencies updated** for security