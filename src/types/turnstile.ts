/**
 * Cloudflare Turnstile TypeScript Type Definitions
 */

export interface TurnstileInstance {
  render(container: string | HTMLElement, options: TurnstileOptions): string;
  reset(widgetId?: string): void;
  remove(widgetId?: string): void;
  getResponse(widgetId?: string): string;
  execute?(widgetId?: string): void;
}

export interface TurnstileOptions {
  sitekey: string;
  action?: string;
  cData?: string;
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
  tabindex?: number;
  "response-field"?: boolean;
  "response-field-name"?: string;
  retry?: "auto" | "never";
  "retry-interval"?: number;
  "refresh-expired"?: "auto" | "manual" | "never";
  language?: string;
  execution?: "render" | "execute";
  appearance?: "always" | "execute" | "interaction-only";
}

export interface TurnstileVerificationResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

export interface TurnstileWidgetRef {
  reset: () => void;
  execute: () => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileInstance;
    onloadTurnstileCallback?: () => void;
  }
}

