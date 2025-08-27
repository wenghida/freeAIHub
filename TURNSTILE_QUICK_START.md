# 🚀 Turnstile Quick Start Guide

## ⚡ Step 1: Get Cloudflare Turnstile Keys

1. Visit [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to "Turnstile" section
3. Click "Add a site"
4. Configure your site:
   - **Domain**: `localhost` (for development)
   - **Widget Mode**: `Managed` (recommended)
5. Copy your keys:
   - **Site Key** (public): `0x4AAAAAAA...`
   - **Secret Key** (private): `0x4AAAAAAA...`

## ⚡ Step 2: Configure Environment Variables

Create `.env.local` file in your project root:

```bash
# Required: Cloudflare Turnstile Keys
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key_here
TURNSTILE_SECRET_KEY=your_secret_key_here

# Optional: Skip Turnstile for development testing
# SKIP_TURNSTILE=true
```

## ⚡ Step 3: Test the Integration

1. **Start development server:**

   ```bash
   npm run dev
   ```

2. **Test Turnstile functionality:**
   - Visit: `http://localhost:3000/turnstile-test`
   - Complete the verification challenge
   - Click "Test Backend Verification"
   - Verify the result shows "Verification Successful"

3. **Test on actual feature:**
   - Visit: `http://localhost:3000/text-to-image`
   - Complete the verification challenge
   - Try generating an image

## ⚡ Step 4: Production Deployment

1. **Add production domain to Cloudflare:**
   - Go to your Turnstile site settings
   - Add your production domain

2. **Set environment variables in production:**

   ```bash
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_production_site_key
   TURNSTILE_SECRET_KEY=your_production_secret_key
   ```

3. **Deploy and test:**
   ```bash
   npm run build
   npm start
   ```

## 🔧 Troubleshooting

### Issue: Widget not loading

- ✅ Check if site key is correct
- ✅ Verify domain is added to Cloudflare configuration
- ✅ Check browser console for errors

### Issue: Verification always fails

- ✅ Check if secret key is correct
- ✅ Verify server logs for detailed errors
- ✅ Test with `/api/test-turnstile` endpoint

### Issue: CORS/CSP errors

- ✅ Ensure CSP headers allow Cloudflare domains
- ✅ Check `next.config.js` configuration

## 📊 Features Enabled

✅ **Multi-layer Security**

- Turnstile verification (bot protection)
- Rate limiting (20 requests/minute per IP)
- Input validation and sanitization

✅ **Smart Integration**

- Automatic token management
- Error handling and retry logic
- User-friendly error messages

✅ **Performance Optimized**

- Preconnect headers for faster loading
- Async script loading
- Minimal performance impact

✅ **Developer Experience**

- TypeScript support
- Comprehensive error logging
- Test endpoint for verification

## 🎯 Current Integration Status

The following pages now have Turnstile verification:

- ✅ **Text to Image** (`/text-to-image`)
- 🔄 **Text to Text** (ready to integrate)
- 🔄 **Text to Speech** (ready to integrate)
- 🔄 **Speech to Text** (ready to integrate)
- 🔄 **Generate Image Prompt** (ready to integrate)

## 📝 Next Steps

To add Turnstile to other pages, follow this pattern:

1. Import the TurnstileWidget component
2. Add Turnstile state management
3. Add verification check before API calls
4. Handle verification errors appropriately

Example integration code is available in `src/app/text-to-image/page.tsx`.

## 🆘 Support

- Test endpoint: `/api/test-turnstile`
- Documentation: `TURNSTILE_SETUP.md`
- Cloudflare Docs: [turnstile documentation](https://developers.cloudflare.com/turnstile/)

---

**🎉 Congratulations!** Your AI platform now has enterprise-grade bot protection!
