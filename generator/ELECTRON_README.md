# 🖥️ Invoice Generator - Electron Desktop App

Your Invoice Generator is now available as a cross-platform desktop application!

## 🚀 Quick Start

### Development Mode
Run the app in development mode with hot reload:
```bash
npm run electron-dev
```

### Production Build
Build and package the desktop app:
```bash
npm run dist
```

## 📱 Available Scripts

- `npm run electron-dev` - Start development mode (React + Electron)
- `npm run electron` - Run Electron with built React app
- `npm run dist` - Build production app for current platform
- `npm run build:electron` - Build for production
- `npm run electron-pack` - Package app (same as dist)

## 🎯 Platform-Specific Builds

### Windows
```bash
npm run dist -- --win
```
Creates: `electron-dist/Invoice Generator Setup.exe`

### macOS
```bash
npm run dist -- --mac
```
Creates: `electron-dist/Invoice Generator.dmg`

### Linux
```bash
npm run dist -- --linux
```
Creates: `electron-dist/Invoice Generator.AppImage`

## ✨ Desktop Features

### 🎛️ Native Menus
- **File Menu**: New Invoice (Ctrl+N), Dashboard (Ctrl+D)
- **Edit Menu**: Standard clipboard operations
- **View Menu**: Zoom, reload, toggle fullscreen
- **Window Menu**: Minimize, close
- **Help Menu**: About dialog

### 🔗 Electron Integration
- Native file dialogs for save/export operations
- Platform-specific keyboard shortcuts
- Window state management
- External link handling (opens in default browser)

## 🛠️ Development

### Requirements
- Node.js 16+
- npm or yarn

### Project Structure
```
generator/
├── public/
│   ├── electron.js       # Main Electron process
│   ├── preload.js        # Secure IPC bridge
│   └── assets/           # App icons and resources
├── src/
│   ├── hooks/
│   │   └── useElectron.js # React hook for Electron features
│   └── ...               # Your React components
└── electron-dist/        # Built desktop apps
```

### Custom Electron Features

#### useElectron Hook
```jsx
import { useElectron } from './hooks/useElectron';

function MyComponent() {
  const { isElectron, saveFile, getAppVersion } = useElectron();
  
  if (isElectron) {
    // Electron-specific features
    const handleSave = async () => {
      const result = await saveFile({
        defaultPath: 'invoice.pdf',
        filters: [{ name: 'PDF', extensions: ['pdf'] }]
      });
    };
  }
}
```

## 🔧 Customization

### App Icon
Replace `public/assets/icon.png` with your app icon:
- Windows: 256x256 PNG
- macOS: 512x512 PNG  
- Linux: 512x512 PNG

### App Details
Edit `package.json` build configuration:
```json
{
  "build": {
    "appId": "com.yourcompany.invoicegenerator",
    "productName": "Your Invoice Generator",
    // ... other settings
  }
}
```

## 🔐 Security

The app follows Electron security best practices:
- ✅ Context isolation enabled
- ✅ Node integration disabled in renderer
- ✅ Secure preload script
- ✅ External links open in browser
- ✅ CSP headers for web security

## 📦 Distribution

### Auto-updater (Optional)
To add auto-updates, configure `electron-updater`:
```bash
npm install electron-updater
```

### Code Signing (Production)
For distribution, you'll need to sign your apps:
- **Windows**: Code signing certificate
- **macOS**: Apple Developer ID
- **Linux**: No signing required

## 🐛 Troubleshooting

### Common Issues

**1. "Electron failed to start"**
```bash
npm install electron --save-dev
```

**2. "Cannot find module 'electron'"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**3. "App crashes on startup"**
Check the DevTools console in development mode:
```bash
npm run electron-dev
```

**4. "Menu not working"**
Ensure you're using the latest Electron version:
```bash
npm update electron
```

## 🌟 Next Steps

1. **Add App Icon**: Create and add your custom app icon
2. **Configure Auto-Updates**: Set up automatic updates
3. **Add Analytics**: Track usage with analytics
4. **Custom Splash Screen**: Add loading screen
5. **System Tray**: Add minimize to system tray
6. **Deep Links**: Register custom URL schemes

## 📞 Support

Your Invoice Generator desktop app is ready! 🎉

- Development issues: Check console logs
- Build issues: Verify Node.js version
- Platform issues: Test on target OS

Happy Desktop App Development! 🚀
