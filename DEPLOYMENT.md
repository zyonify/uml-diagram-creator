# Deployment Guide

This guide explains how to deploy the UML Diagram Creator to various hosting platforms.

## Build Configuration

The app is configured with `vercel.json` for optimal deployment:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework**: Vite
- **SPA Routing**: Configured for shareable links to work correctly

## Deploy to Vercel (Recommended)

### Option 1: Using Vercel CLI

1. Install Vercel CLI globally:
```bash
npm install -g vercel
```

2. Navigate to the project directory:
```bash
cd uml-app
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? Press Enter (uses folder name)
   - In which directory is your code? **./`** (current directory)
   - Override settings? **N**

5. Your app will be deployed! You'll receive a URL like: `https://uml-diagram-creator-xxx.vercel.app`

### Option 2: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository: `https://github.com/zyonify/uml-diagram-creator`
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `uml-app`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
5. Click "Deploy"
6. Your app will be live at `https://your-project-name.vercel.app`

### Option 3: Using GitHub Integration

1. Push your code to GitHub (already done)
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import from GitHub: select `uml-diagram-creator` repository
5. Set **Root Directory** to `uml-app`
6. Deploy!

Vercel will automatically:
- Build on every push to `main`
- Provide preview deployments for PRs
- Handle SSL certificates
- Optimize static assets

## Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Configure build settings:
   - **Base directory**: `uml-app`
   - **Build command**: `npm run build`
   - **Publish directory**: `uml-app/dist`
5. Add a `netlify.toml` file in the `uml-app` directory:

```toml
[build]
  base = "."
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

6. Click "Deploy site"

## Deploy to GitHub Pages

1. Install `gh-pages` package:
```bash
npm install --save-dev gh-pages
```

2. Add to `package.json` scripts:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

3. Update `vite.config.js` to set the base path:
```javascript
export default defineConfig({
  base: '/uml-diagram-creator/',
  plugins: [svelte()]
})
```

4. Deploy:
```bash
npm run deploy
```

5. Enable GitHub Pages in repository settings:
   - Go to Settings → Pages
   - Source: Deploy from branch `gh-pages`
   - Your site will be at: `https://zyonify.github.io/uml-diagram-creator/`

## Deploy to Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Navigate to "Workers & Pages" → "Create application" → "Pages"
3. Connect to GitHub and select your repository
4. Configure build:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `uml-app`
5. Add environment variable:
   - **NODE_VERSION**: `18`
6. Deploy!

## Local Testing Before Deployment

Always test the production build locally before deploying:

```bash
# Build the app
npm run build

# Preview the build
npm run preview
```

Visit `http://localhost:4173` to test the production build.

## Post-Deployment Checklist

After deploying, verify that:
- [ ] App loads correctly
- [ ] Diagrams render properly
- [ ] All export formats work (SVG, PNG, PDF, UML)
- [ ] Shareable links function correctly
- [ ] Theme switching works
- [ ] Undo/Redo works
- [ ] Import/Export .uml files work
- [ ] Copy to Markdown works
- [ ] localStorage saves diagrams
- [ ] Mobile responsive design works

## Custom Domain (Optional)

### For Vercel:
1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### For Netlify:
1. Go to "Domain management"
2. Add custom domain
3. Follow DNS configuration instructions

## Environment Variables

This app doesn't require any environment variables. All functionality runs client-side.

## Performance Optimization

The build is already optimized with:
- Code splitting
- Minification
- Gzip compression
- Small bundle size (~25 KB gzipped)

## Troubleshooting

### Build fails on deployment
- Check Node.js version (should be 18+)
- Ensure all dependencies are in `package.json`
- Check build logs for specific errors

### Shareable links don't work
- Verify `vercel.json` has the rewrites configuration
- For other platforms, ensure SPA routing is configured

### Theme not loading
- Check browser console for errors
- Ensure all assets are being served correctly

## Support

For issues related to deployment:
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Netlify: [docs.netlify.com](https://docs.netlify.com)
- GitHub Pages: [docs.github.com/pages](https://docs.github.com/pages)
