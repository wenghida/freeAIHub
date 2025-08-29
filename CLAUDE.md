# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CalmSky AI** is a free AI multi-functional conversion platform based on Pollinations.AI API, providing five core features: text-to-image, image-to-image, text-to-text, text-to-speech, and speech-to-text.

## Tech Stack

- **Frontend**: Next.js 15.4.7 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS 4.1.12
- **Icons**: Lucide React
- **State Management**: Zustand 5.0.7
- **API**: Next.js API Routes
- **Caching**: Node-cache for memory caching
- **Audio**: RecordRTC for audio recording
- **Security**: Cloudflare Turnstile for human verification

## Development Commands

### Setup and Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Test APIs
npm run test:apis

# Test build and start
npm run test:build
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes connecting to Pollinations.AI
│   │   ├── text-to-image/
│   │   ├── image-to-image/
│   │   ├── text-to-text/
│   │   ├── text-to-speech/
│   │   ├── speech-to-text/
│   │   └── health/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/            # React components
│   ├── shared/           # Shared components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorMessage.tsx
│   └── ui/              # UI components
├── lib/                  # Utilities and helpers
│   ├── api/client.ts     # API client
│   ├── middleware/       # API middleware
│   │   ├── error-handler.ts
│   │   ├── rate-limiter.ts
│   │   └── turnstile-middleware.ts
│   ├── storage/          # Local storage management
│   │   ├── local-storage.ts
│   │   ├── history-storage.ts
│   │   └── preference-storage.ts
│   ├── utils/           # Utility functions
│   │   └── logger.ts
│   └── hooks/           # Custom React hooks
├── types/               # TypeScript type definitions
└── services/            # Business logic services
```

## API Implementation Status

The project has implemented the Next.js API routes that connect to the Pollinations.AI API. These routes are created in the `src/app/api/` directory:

### Implemented API Routes

1. `/api/text-to-image` - POST endpoint for generating images from text prompts
2. `/api/image-to-image` - POST endpoint for generating images from existing images and text prompts
3. `/api/text-to-text` - POST endpoint for processing text (translation, summarization, etc.)
4. `/api/text-to-speech` - POST endpoint for converting text to speech
5. `/api/speech-to-text` - POST endpoint for converting speech to text
6. `/api/health` - GET endpoint for health checks

Each route implements:

- Input validation
- Rate limiting using the provided middleware
- Error handling using the error-handler middleware
- Caching where appropriate
- Proper response formatting

## API Endpoints

### Text-to-Image

- **Endpoint**: `/api/text-to-image`
- **Method**: POST
- **Body**: prompt, width, height, model, seed
- **Cache**: 5 minutes TTL
- **Validation**: prompt max 1000 chars, valid image sizes

### Image-to-Image

- **Endpoint**: `/api/image-to-image`
- **Method**: POST
- **Body**: prompt, imageUrl, model, strength
- **Validation**: prompt max 1000 chars, valid image URL, strength 0-1

### Text-to-Text

- **Endpoint**: `/api/text-to-text`
- **Method**: POST
- **Body**: text, type, targetLanguage, style
- **Features**: translation, polishing, summary, continuation, style conversion

### Text-to-Speech

- **Endpoint**: `/api/text-to-speech`
- **Method**: POST
- **Body**: text, voice, speed, pitch
- **Features**: Chinese/English voices, speed 0.5-2.0x, pitch adjustment

### Speech-to-Text

- **Endpoint**: `/api/speech-to-text`
- **Method**: POST
- **Body**: audio file (base64), language
- **Formats**: MP3, WAV, M4A, WebM
- **Limit**: Max 50MB, 5 minutes

### Health Check

- **Endpoint**: `/api/health`
- **Method**: GET
- **Purpose**: Service health monitoring

## Key Features

### Caching System

- Memory caching using node-cache
- 5-minute TTL for successful responses
- 1-minute TTL for error responses
- Request deduplication for identical prompts

### Error Handling

- Standardized error response format
- Detailed error codes and messages
- Rate limiting (20 requests per minute per IP)
- Input validation for all endpoints

### Local Storage

- History tracking for all features
- User preference management
- 30-day auto-cleanup for history
- 50-item limit per feature type

### Logging

- Request/response logging
- IP tracking
- Response time monitoring
- Error tracking and caching

### Security

- Cloudflare Turnstile human verification for all AI generation endpoints
- Rate limiting enabled
- Input sanitization
- No sensitive data in logs
- CORS properly configured

## Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules (eslint-config-next)
- Use Prettier for formatting
- Import path: `@/*` maps to `./src/*`

### Performance

- Implement React.memo for expensive components
- Use proper loading states
- Cache API responses appropriately
- Optimize images and assets

### Error Handling

- Always handle network errors gracefully
- Validate user inputs
- Provide clear error messages
- Implement retry mechanisms where appropriate

### Security

- All AI generation features implement Cloudflare Turnstile human verification
- Rate limiting prevents abuse
- Input sanitization prevents injection attacks
- Secure error handling without information leakage

### Internationalization

- All backend API calls and frontend UI responses must use English for user interaction
- Code comments may be written in Chinese for better understanding
- Error messages, validation messages, and user-facing text must be in English
- System logs can be in either language but should be consistent within each module

### Human Verification (Turnstile)

All AI generation features implement Cloudflare Turnstile human verification:

- Uses modal-based verification triggered on generate actions
- Implemented via `TurnstileModal` component
- Token validation before API calls
- Proper error handling for verification failures

## Testing Checklist

### Functional Testing

- [ ] Text-to-image generation and download
- [ ] Image-to-image generation and download
- [ ] Text-to-text all modes (translation, polishing, etc.)
- [ ] Text-to-speech audio generation and playback
- [ ] Speech-to-text file upload and recording

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Responsive Design

- [ ] Mobile (320px+)
- [ ] Tablet (768px+)
- [ ] Desktop (1024px+)

### Error Scenarios

- [ ] Network disconnection
- [ ] Large file uploads
- [ ] Long text inputs
- [ ] Rate limiting tests
- [ ] Turnstile verification failures

## 中文交互说明

与我所有的交互都用中文进行

在项目根目录下我创建了一个 DEVELOPMENT_TASKS.md 文件，每次开发前，你都应该先帮我们商量好的代办任务添加到这个文件中，每完成一个任务，记得把对应的任务标记为已完成，这样可以方便我们实时跟踪开发进度