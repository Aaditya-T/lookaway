# Publishing to VS Code Marketplace

## Prerequisites

1. **Create a Visual Studio Marketplace Publisher Account**
   - Go to https://marketplace.visualstudio.com/manage
   - Sign in with your Microsoft account (or create one)
   - Create a new publisher (choose a unique name - this will be your `publisher` ID)
   - Note: You'll need to pay a one-time $0 fee to create a publisher account

2. **Install VS Code Extension Manager (vsce)**
   ```bash
   npm install -g @vscode/vsce
   ```

## Steps to Publish

### 1. Update package.json

Before publishing, update these fields in `package.json`:
- `publisher`: Replace `YOUR_PUBLISHER_NAME` with your actual publisher ID from step 1
- `repository.url`: Replace `YOUR_REPO_URL` with your GitHub/GitLab repository URL (optional but recommended)

### 2. Create a Personal Access Token (PAT)

1. Go to https://dev.azure.com
2. Sign in with the same Microsoft account
3. Click on your profile picture → Security
4. Create a new Personal Access Token (PAT)
   - Name: "VS Code Extension Publishing"
   - Organization: All accessible organizations
   - Expiration: Set as needed (or custom)
   - Scopes: **Marketplace (Manage)** - Full access
5. Copy the token (you won't see it again!)

### 3. Package Your Extension

```bash
# Make sure you're in the extension directory
cd /Users/aaditya/Desktop/code/lookaway/vsc_ext

# Compile the TypeScript
npm run compile

# Package the extension (creates a .vsix file)
vsce package
```

This creates a `.vsix` file that you can test locally or publish.

### 4. Test Locally (Optional but Recommended)

```bash
# Install the extension locally to test
code --install-extension lookaway-0.0.1.vsix
```

### 5. Publish to Marketplace

**Option A: Publish directly (requires PAT)**
```bash
vsce publish
```
When prompted, enter your Personal Access Token from step 2.

**Option B: Publish via web**
1. Go to https://marketplace.visualstudio.com/manage
2. Click "New extension" → "Visual Studio Code"
3. Upload your `.vsix` file

### 6. Verify Publication

After publishing:
- Wait a few minutes for the extension to appear
- Check: https://marketplace.visualstudio.com/vscode
- Search for "Look Away" or your extension name

## Updating Your Extension

When you want to publish an update:

1. Update the `version` in `package.json` (e.g., `0.0.1` → `0.0.2`)
2. Run `vsce package` to create a new `.vsix`
3. Run `vsce publish` to publish the update

## Important Notes

- The extension name must be unique across the marketplace
- The `publisher` field in `package.json` must match your publisher account
- You can't change the extension ID after first publication
- Review the [VS Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines) before publishing

## Troubleshooting

- **"Extension name already exists"**: Choose a different name or add a suffix
- **"Invalid publisher"**: Make sure the publisher ID matches exactly
- **"Missing required fields"**: Check that `publisher`, `displayName`, `description`, and `version` are all set

