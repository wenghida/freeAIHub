"use client";

import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { TurnstileOptions, TurnstileWidgetRef } from "@/types/turnstile";

interface TurnstileWidgetProps {
  siteKey: string;
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
  action?: string;
  className?: string;
  invisible?: boolean;
}

export const TurnstileWidget = forwardRef<
  TurnstileWidgetRef,
  TurnstileWidgetProps
>(
  (
    {
      siteKey,
      onSuccess,
      onError,
      onExpire,
      theme = "auto",
      size = "normal",
      action,
      className,
      invisible = false,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      // Check if Turnstile script is already loaded
      if (window.turnstile) {
        setIsLoaded(true);
        setIsLoading(false);
        return;
      }

      // Load Turnstile script
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        setIsLoaded(true);
        setIsLoading(false);
        setError(null);
      };

      script.onerror = () => {
        console.error("Failed to load Turnstile script");
        setIsLoading(false);
        setError("Failed to load verification widget");
        onError?.();
      };

      document.head.appendChild(script);

      return () => {
        // Cleanup script on unmount
        const existingScript = document.querySelector(
          'script[src*="turnstile"]'
        );
        if (existingScript) {
          existingScript.remove();
        }
      };
    }, [onError]);

    useEffect(() => {
      if (!isLoaded || !containerRef.current || !siteKey) return;

      // Configure Turnstile options
      const options: TurnstileOptions = {
        sitekey: siteKey,
        theme,
        size,
        action,
        callback: (token: string) => {
          onSuccess(token);
        },
        "error-callback": () => {
          setError("Verification failed, please try again");
          onError?.();
        },
        "expired-callback": () => {
          setError("Verification expired, please try again");
          onExpire?.();
          // Auto re-render on expiration
          reset();
        },
        execution: invisible ? "execute" : "render",
        appearance: invisible ? "execute" : "always",
      };

      // Render Turnstile widget
      try {
        const widgetId = window.turnstile?.render(
          containerRef.current,
          options
        );
        widgetIdRef.current = widgetId || null;
        setError(null);
      } catch (error) {
        console.error("Failed to render Turnstile:", error);
        setError("Failed to initialize verification widget");
        onError?.();
      }

      return () => {
        // Cleanup widget on unmount
        if (widgetIdRef.current) {
          window.turnstile?.remove(widgetIdRef.current);
        }
      };
    }, [
      isLoaded,
      siteKey,
      theme,
      size,
      action,
      onSuccess,
      onError,
      onExpire,
      invisible,
    ]);

    const reset = () => {
      if (widgetIdRef.current) {
        window.turnstile?.reset(widgetIdRef.current);
      }
      setError(null);
    };

    const execute = () => {
      if (invisible && widgetIdRef.current) {
        // For invisible mode, manually trigger verification
        window.turnstile?.execute?.(widgetIdRef.current);
      }
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      reset,
      execute,
    }));

    if (isLoading) {
      return (
        <div className={`flex items-center justify-center p-4 ${className}`}>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">
            Loading verification widget...
          </span>
        </div>
      );
    }

    if (error) {
      return (
        <div className={`text-center p-4 text-red-600 ${className}`}>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Click to retry
          </button>
        </div>
      );
    }

    if (!isLoaded) {
      return (
        <div className={`text-center p-4 text-red-600 ${className}`}>
          <p>Verification widget failed to load</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Click to retry
          </button>
        </div>
      );
    }

    return (
      <div className={className}>
        <div ref={containerRef} />
      </div>
    );
  }
);

TurnstileWidget.displayName = "TurnstileWidget";

export default TurnstileWidget;

