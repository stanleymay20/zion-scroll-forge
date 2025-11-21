# PWA Icons

This directory contains the Progressive Web App icons for ScrollUniversity.

## Required Icons

The following icon sizes are required for full PWA support:

- **icon-72x72.png** - Android Chrome
- **icon-96x96.png** - Android Chrome, shortcuts
- **icon-128x128.png** - Android Chrome
- **icon-144x144.png** - Android Chrome, Windows
- **icon-152x152.png** - iOS Safari
- **icon-192x192.png** - Android Chrome, iOS Safari (standard)
- **icon-384x384.png** - Android Chrome
- **icon-512x512.png** - Android Chrome, splash screens

## Icon Requirements

### Design Guidelines
- Use the ScrollUniversity logo/branding
- Ensure icons are recognizable at all sizes
- Use a solid background color (theme color: #8B5CF6)
- Include padding for maskable icons (safe zone)
- Test on both light and dark backgrounds

### Technical Requirements
- Format: PNG with transparency
- Color space: sRGB
- Compression: Optimized for web
- Purpose: "any maskable" (supports both standard and maskable)

### Maskable Icons
Maskable icons should have:
- 20% padding on all sides (safe zone)
- Important content in the center 60%
- Solid background color
- No transparency in the safe zone

## Generating Icons

### Option 1: Using a Design Tool
1. Create a 512x512px master icon in Figma/Sketch/Photoshop
2. Export at different sizes
3. Optimize with tools like ImageOptim or TinyPNG

### Option 2: Using PWA Asset Generator
```bash
npx pwa-asset-generator logo.svg public/icons \
  --icon-only \
  --padding "20%" \
  --background "#8B5CF6"
```

### Option 3: Using RealFaviconGenerator
Visit https://realfavicongenerator.net/ and upload your logo

## Testing Icons

### Chrome DevTools
1. Open DevTools > Application > Manifest
2. Verify all icons are listed
3. Check icon preview

### Lighthouse
1. Run Lighthouse audit
2. Check PWA score
3. Verify icon requirements are met

### iOS Safari
1. Add to Home Screen
2. Verify icon appears correctly
3. Check splash screen

## Current Status

⚠️ **Placeholder icons needed**: This directory currently contains placeholder documentation. 
Real icons need to be created and placed here before production deployment.

## Fallback

If icons are not available, the app will:
1. Use the favicon.ico as fallback
2. Generate icons from the first letter of the app name
3. Use browser default icons

However, for the best user experience, proper icons should be created.
