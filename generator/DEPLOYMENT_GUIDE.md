# Deployment Guide - Fix 404 Errors

## 🚨 Common 404 Issues & Solutions

### Issue: 404 on Page Refresh or Direct URL Access
**Cause**: React Router uses client-side routing, but servers don't know about these routes.

### ✅ **For Netlify Deployment**

1. **Files Added**: 
   - `public/_redirects` ✅ (Created)

2. **Deployment Steps**:
   ```bash
   npm run build
   ```
   - Upload `dist` folder to Netlify
   - Or connect GitHub repo for auto-deployment

3. **Netlify Settings**:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Node Version: 18 or higher

### ✅ **For Vercel Deployment**

1. **Files Added**:
   - `vercel.json` ✅ (Created)

2. **Deployment Steps**:
   ```bash
   npm run build
   ```
   - Upload `dist` folder to Vercel
   - Or connect GitHub repo for auto-deployment

3. **Vercel Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## 🔧 **Additional Fixes Applied**

### Updated vite.config.js
- Added `base: './'` for better path handling
- Configured build settings for deployment

### Updated package.json
- Added deployment-specific scripts
- Ensured all required dependencies are included

## 🧪 **Testing Deployment**

### Local Testing
```bash
npm run build
npm run preview
```
This simulates production environment locally.

### After Deployment
1. Test home page: `https://your-site.com/`
2. Test dashboard: `https://your-site.com/dashboard`
3. Test direct URL access (refresh page)
4. Test navigation between pages

## 🚨 **If 404 Still Occurs**

### Check Build Output
```bash
npm run build
ls dist/  # Should see index.html and assets folder
```

### Verify Files Are Created
- ✅ `public/_redirects` (for Netlify)
- ✅ `vercel.json` (for Vercel)
- ✅ Updated `vite.config.js`

### Environment Variables
Make sure to set in deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Common Deployment Settings

**Netlify**:
- Build Command: `npm run build`
- Publish Directory: `dist`
- Node Version: 18.x

**Vercel**:
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

## 📁 **File Structure After Build**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── _redirects (for Netlify)
```

## 🔍 **Debug Steps**

1. **Check Browser Console** for errors
2. **Check Network Tab** for failed requests
3. **Verify Environment Variables** are set
4. **Test Routes Locally** with `npm run preview`
5. **Check Build Output** in `dist` folder

All necessary files have been created and configurations updated. The 404 error should be resolved with these changes!
