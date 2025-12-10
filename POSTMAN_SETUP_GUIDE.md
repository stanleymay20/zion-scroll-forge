# Postman Power Setup Guide

## Step 1: Get Your Postman API Key

1. **Visit Postman**: Go to https://postman.com and log in (or create a free account)

2. **Navigate to API Keys**:
   - Click your profile icon (top right)
   - Select **Settings**
   - Go to **API Keys** tab

3. **Generate New Key**:
   - Click **Generate API Key**
   - Give it a name: `ScrollUniversity Kiro Integration`
   - Copy the key immediately (it won't be shown again)

## Step 2: Set Environment Variable

### Option A: PowerShell (Current Session)
```powershell
$env:POSTMAN_API_KEY = "PMAK-your-key-here"
```

### Option B: PowerShell (Permanent - User Level)
```powershell
[System.Environment]::SetEnvironmentVariable('POSTMAN_API_KEY', 'PMAK-your-key-here', 'User')
```

### Option C: Windows System Environment Variables
1. Press `Win + X` and select **System**
2. Click **Advanced system settings**
3. Click **Environment Variables**
4. Under **User variables**, click **New**
5. Variable name: `POSTMAN_API_KEY`
6. Variable value: `PMAK-your-key-here`
7. Click **OK** on all dialogs
8. **Restart Kiro** for changes to take effect

## Step 3: Verify Setup

After setting the environment variable and restarting Kiro, test the connection:

```
Ask me: "test postman connection"
```

I'll verify that your API key is working correctly.

## Step 4: Create Your First Collection

Once verified, we can:
1. Create a workspace for ScrollUniversity
2. Build a collection for your backend API
3. Add requests for all your routes
4. Set up environments (local, staging, production)
5. Run automated tests

## Troubleshooting

**"Invalid API Key" error:**
- Verify the key starts with `PMAK-`
- Make sure you copied the entire key
- Restart Kiro after setting the environment variable
- Check that the variable is set: `echo $env:POSTMAN_API_KEY` in PowerShell

**Key not found:**
- Ensure you set it at the User or System level (not just current session)
- Restart Kiro completely
- Try setting it in the MCP config file instead (see below)

## Alternative: MCP Config File Method

If environment variables don't work, you can add the key directly to your MCP config:

**File location:** `~/.kiro/settings/mcp.json` or `C:\Users\YourUsername\.kiro\settings\mcp.json`

Add this configuration:
```json
{
  "mcpServers": {
    "postman": {
      "url": "https://mcp.postman.com/minimal",
      "headers": {
        "Authorization": "Bearer PMAK-your-key-here"
      }
    }
  }
}
```

Replace `PMAK-your-key-here` with your actual API key.

## Next Steps

Once configured, the automation hook will:
- Monitor your backend API files for changes
- Automatically run Postman tests when you edit routes
- Show you test results and suggest fixes
- Help maintain API quality throughout development

Your ScrollUniversity backend has extensive API routes that would benefit from automated testing!
