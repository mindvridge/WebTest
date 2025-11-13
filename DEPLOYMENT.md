# Cloudflare Pages Deployment Guide

Chef's Last Stand is optimized for deployment on Cloudflare Pages, offering the best performance and unlimited bandwidth for free.

## Why Cloudflare Pages?

- **Unlimited Bandwidth**: No worries about traffic limits
- **Global CDN**: Fast loading times worldwide
- **Free SSL**: Automatic HTTPS certificates
- **Zero Configuration**: Works out of the box with our setup
- **Git Integration**: Automatic deployments on push
- **Free Analytics**: Built-in visitor insights

## Prerequisites

1. A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free)
2. Your repository pushed to GitHub/GitLab
3. Node.js 20+ installed locally

## Deployment Methods

### Method 1: Web Dashboard (Recommended for First-Time Users)

#### Step 1: Connect Your Repository

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** in the sidebar
3. Click **Create a project**
4. Click **Connect to Git**
5. Authorize Cloudflare to access your GitHub/GitLab account
6. Select the `WebTest` repository

#### Step 2: Configure Build Settings

Use these exact settings:

```
Project name: chefs-last-stand
Production branch: main (or your default branch)
Build command: npm run build
Build output directory: dist
Root directory: /
Node version: 20
```

**Environment Variables**: None needed!

#### Step 3: Deploy

1. Click **Save and Deploy**
2. Wait 2-3 minutes for the build to complete
3. Your game will be live at: `https://chefs-last-stand.pages.dev`

#### Step 4: Custom Domain (Optional)

1. In your Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `chefslaststand.com`)
4. Follow the DNS instructions provided

### Method 2: Wrangler CLI (For Advanced Users)

#### Install Wrangler

```bash
npm install -g wrangler
```

#### Login to Cloudflare

```bash
wrangler login
```

#### Deploy Directly

```bash
# Build the project
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=chefs-last-stand
```

#### Set Up Continuous Deployment

After the first manual deployment:

```bash
# Create a new Pages project
wrangler pages project create chefs-last-stand

# Configure Git integration
# Follow the prompts to connect your repository
```

### Method 3: GitHub Actions (Automated CI/CD)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: chefs-last-stand
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

**Required Secrets** (in GitHub repository settings):
- `CLOUDFLARE_API_TOKEN`: From Cloudflare Dashboard → My Profile → API Tokens
- `CLOUDFLARE_ACCOUNT_ID`: From Cloudflare Dashboard URL or Pages overview

## Build Configuration Files

This repository includes:

- `wrangler.toml`: Cloudflare Pages configuration
- `.node-version`: Specifies Node.js 20 for builds
- `vite.config.ts`: Vite build settings optimized for production

## Automatic Deployments

Once configured, Cloudflare Pages will automatically:

- Deploy on every push to your production branch
- Create preview deployments for pull requests
- Provide unique URLs for each deployment
- Roll back instantly if needed

## Preview Deployments

Every pull request gets its own preview URL:
- Format: `https://[commit-hash].chefs-last-stand.pages.dev`
- Perfect for testing before merging
- Automatically cleaned up after PR is closed

## Performance Optimization

The build is already optimized with:

- **Code Splitting**: Phaser loaded separately for better caching
- **Asset Optimization**: Automatic image and JS minification
- **CDN Caching**: Static assets served from nearest edge location
- **Compression**: Automatic Gzip/Brotli compression

## Monitoring & Analytics

After deployment, access analytics in the Cloudflare Dashboard:

1. Go to your Pages project
2. Click **Analytics** tab
3. View:
   - Total requests and unique visitors
   - Bandwidth usage
   - Geographic distribution
   - Browser/OS breakdown
   - Cache hit rates

## Troubleshooting

### Build Fails with "Command not found"

**Solution**: Ensure `package.json` has all dependencies listed:
```bash
npm install
git add package-lock.json
git commit -m "Update dependencies"
```

### 404 Errors on Routes

**Solution**: This is a single-page game, so all routes should work automatically. If you add routing later, add a `_redirects` file:
```
/*    /index.html    200
```

### Build Takes Too Long

**Solution**: The first build may take 3-5 minutes. Subsequent builds are cached and take ~1-2 minutes.

### Assets Not Loading

**Solution**: Check that `dist` folder contains:
- `index.html`
- `assets/` folder with JS and CSS files

Run locally first: `npm run build && npm run preview`

## Updating Your Deployment

Simply push to your repository:

```bash
git add .
git commit -m "Update game"
git push
```

Cloudflare Pages will automatically rebuild and deploy!

## Cost

**FREE** tier includes:
- ✅ Unlimited bandwidth
- ✅ 500 builds per month
- ✅ Unlimited sites
- ✅ Free SSL certificates
- ✅ DDoS protection
- ✅ Web Analytics

This is more than enough for most indie games. Commercial use is allowed!

## Comparison with Other Platforms

| Feature | Cloudflare Pages | Netlify | Vercel | GitHub Pages |
|---------|-----------------|---------|---------|--------------|
| Bandwidth | ∞ Unlimited | 100GB | 100GB | 100GB |
| Build minutes | 500/mo | 300/mo | 6000/mo | N/A |
| Commercial use | ✅ Yes | ✅ Yes | ❌ Pro only | ✅ Yes |
| Custom domains | ✅ Free | ✅ Free | ✅ Free | ✅ Free |
| Analytics | ✅ Included | ❌ Paid | ❌ Paid | ❌ None |
| Performance | ⚡ Best | ⚡ Good | ⚡ Good | ⚠️ Basic |

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Phaser Deployment Best Practices](https://phaser.io/tutorials/getting-started-phaser3/part9)

## Support

If you encounter issues:

1. Check the [Cloudflare Community](https://community.cloudflare.com/c/developers/pages/)
2. Review build logs in the Cloudflare Dashboard
3. Test locally first: `npm run build && npm run preview`
4. Ensure Node.js version matches (20+)

---

**Ready to deploy?** Start with Method 1 (Web Dashboard) - it's the easiest way to get your game online in under 5 minutes!
