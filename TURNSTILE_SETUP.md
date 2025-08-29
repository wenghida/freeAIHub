# Cloudflare Turnstile Integration Setup

This document provides step-by-step instructions for setting up and configuring Cloudflare Turnstile verification in the CalmSky AI project.

## 🔧 Configuration Steps

### 1. Cloudflare Turnstile Setup

1. **Sign up/Login to Cloudflare Dashboard**
   - Visit [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Create an account or sign in

2. **Create a Turnstile Site**
   - Navigate to "Turnstile" in the Cloudflare dashboard
   - Click "Add a site"
   - Configure the following:
     - **Site name**: Your project name (e.g., "CalmSky AI")
     - **Domain**: Add your domains:
       - `localhost` (for development)
       - Your production domain (e.g., `your-domain.com`)
     - **Widget Mode**: Select "Managed" (recommended)

3. **Get Your Keys**
   - After creating the site, you'll receive:
     - **Site Key** (public, starts with `0x4AAAAAAA`)
     - **Secret Key** (private, starts with `0x4AAAAAAA`)

### 2. Environment Variables

Create or update your `.env.local` file with the following variables:

```bash
# Cloudflare Turnstile Configuration
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAAxxxxxxxxxxxxxxxxxx
TURNSTILE_SECRET_KEY=0x4AAAAAAAxxxxxxxxxxxxxxxxxx

# Optional: Skip Turnstile in development (for testing)
# SKIP_TURNSTILE=true
```

⚠️ **Important**:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is public and safe to expose to the client
- `TURNSTILE_SECRET_KEY` is private and should NEVER be exposed to the client

### 3. Testing the Integration

1. **Start the development server**

   ```bash
   npm run dev
   ```

2. **Visit the test page**
   - Navigate to `http://localhost:3000/turnstile-test`
   - Complete the Turnstile challenge
   - Click "Test Backend Verification"
   - Verify the results

3. **Test on actual pages**
   - Visit `http://localhost:3000/text-to-image`
   - Complete the verification challenge
   - Try generating an image

## 🎯 How It Works

### Frontend Flow

1. **Widget Loading**: Turnstile widget loads when the page is accessed
2. **User Interaction**: User completes the verification challenge
3. **Token Generation**: Turnstile generates a verification token
4. **API Requests**: Token is automatically included in API requests

### Backend Flow

1. **Token Extraction**: Server extracts the Turnstile token from requests
2. **Token Verification**: Server validates the token with Cloudflare
3. **Access Control**: Valid tokens allow API access, invalid tokens are rejected
4. **Rate Limiting**: After Turnstile verification, normal rate limiting applies

## 🛡️ Security Features

### Multi-Layer Protection

- **Turnstile Verification**: Prevents bot attacks
- **Rate Limiting**: Prevents abuse (20 requests/minute per IP)
- **Input Validation**: Sanitizes all user inputs
- **Error Handling**: Secure error messages without information leakage

### Monitoring and Logging

- **Verification Events**: All verification attempts are logged
- **Security Events**: Suspicious activities are tracked
- **Performance Metrics**: Response times and success rates monitored

## 🔄 Production Deployment

### 1. Environment Configuration

Ensure your production environment has the correct environment variables:

```bash
# Production environment variables
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_production_site_key
TURNSTILE_SECRET_KEY=your_production_secret_key
```

### 2. Domain Configuration

- Add your production domain to the Turnstile site configuration in Cloudflare
- Update CSP headers if needed for your specific domain

### 3. Monitoring Setup

Consider integrating with monitoring services:

- **Sentry**: For error tracking
- **DataDog**: For performance monitoring
- **CloudWatch**: For AWS deployments

## 🎨 Customization Options

### Widget Appearance

The Turnstile widget can be customized:

```typescript
<TurnstileWidget
  siteKey={siteKey}
  theme="light" | "dark" | "auto"
  size="normal" | "compact"
  onSuccess={handleSuccess}
  onError={handleError}
  onExpire={handleExpire}
/>
```

### Verification Behavior

- **Automatic**: Widget appears on page load
- **On-Demand**: Widget appears when user attempts an action
- **Invisible**: Challenge only appears when needed

## 🐛 Troubleshooting

### Common Issues

1. **Widget not loading**
   - Check if site key is correct
   - Verify domain is added to Cloudflare configuration
   - Check browser console for JavaScript errors

2. **Verification always fails**
   - Ensure secret key is correct
   - Check server logs for detailed error messages
   - Verify network connectivity to Cloudflare

3. **CORS errors**
   - Update CSP headers in `next.config.js`
   - Ensure Cloudflare domains are whitelisted

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
```

### Testing without Turnstile

For development/testing, you can skip Turnstile verification:

```bash
SKIP_TURNSTILE=true
```

## 📊 Performance Impact

### Load Time

- **Widget Script**: ~50KB gzipped
- **Initial Load**: ~100ms additional
- **Verification**: ~200-500ms per challenge

### Optimization

- Script is loaded asynchronously
- Preconnect headers for faster loading
- Widget caching for repeat visits

## 🔗 Useful Links

- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [Turnstile Dashboard](https://dash.cloudflare.com/)
- [API Reference](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review server logs for detailed error messages
3. Test with the `/turnstile-test` endpoint
4. Consult Cloudflare Turnstile documentation
