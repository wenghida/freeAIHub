"use client";

import { useState } from "react";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

export default function TurnstileTestPage() {
  const [token, setToken] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [widgetKey, setWidgetKey] = useState(0); // For forcing widget re-render

  const handleSuccess = (turnstileToken: string) => {
    setToken(turnstileToken);
    setError(null);
    console.log(
      "Turnstile token received:",
      turnstileToken.substring(0, 20) + "..."
    );
  };

  const handleError = () => {
    setError("Turnstile widget error occurred");
    setToken(null);
  };

  const handleExpire = () => {
    setError("Turnstile token expired");
    setToken(null);
    setVerificationResult(null);
  };

  const testVerification = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/test-turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnstileToken: token }),
      });

      const result = await response.json();
      setVerificationResult(result);

      if (!response.ok) {
        setError(result.message || "Verification test failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Test failed";
      setError(errorMessage);
      setVerificationResult({ error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const resetWidget = () => {
    setToken(null);
    setVerificationResult(null);
    setError(null);
    setWidgetKey((prev) => prev + 1); // Force widget re-render
  };

  const getStatusBadge = () => {
    if (error) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Error
        </Badge>
      );
    }
    if (token && verificationResult?.success) {
      return (
        <Badge
          variant="default"
          className="flex items-center gap-1 bg-green-600"
        >
          <CheckCircle className="w-3 h-3" />
          Verified
        </Badge>
      );
    }
    if (token) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Pending Test
        </Badge>
      );
    }
    return <Badge variant="outline">Not Verified</Badge>;
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-4">
            Turnstile Verification Test
          </h1>
          <p className="text-gray-600 text-lg">
            Test the Cloudflare Turnstile verification integration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Widget Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Verification Widget
                {getStatusBadge()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <TurnstileWidget
                  key={widgetKey}
                  siteKey={
                    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
                    "0x4AAAAAAAxxxxxxxxxxxxxxxxxx"
                  }
                  onSuccess={handleSuccess}
                  onError={handleError}
                  onExpire={handleExpire}
                  theme="light"
                  size="normal"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    {error}
                  </div>
                </div>
              )}

              {token && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Token received successfully
                  </div>
                  <div className="mt-2 font-mono text-xs text-gray-600">
                    {token.substring(0, 40)}...
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={testVerification}
                  disabled={!token || isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Testing..." : "Test Backend Verification"}
                </Button>
                <Button onClick={resetWidget} variant="outline" size="icon">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Verification Results */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Result</CardTitle>
            </CardHeader>
            <CardContent>
              {verificationResult ? (
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-lg border ${
                      verificationResult.success
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {verificationResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span
                        className={`font-medium ${
                          verificationResult.success
                            ? "text-green-800"
                            : "text-red-800"
                        }`}
                      >
                        {verificationResult.success
                          ? "Verification Successful"
                          : "Verification Failed"}
                      </span>
                    </div>
                    <p
                      className={`text-sm ${
                        verificationResult.success
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {verificationResult.message}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Response Details
                    </h4>
                    <pre className="text-xs text-gray-600 overflow-auto">
                      {JSON.stringify(verificationResult, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>
                    Complete verification and click &quot;Test Backend Verification&quot;
                    to see results
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Configuration Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Configuration Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Environment</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>Node ENV: {process.env.NODE_ENV}</li>
                  <li>
                    Site Key:{" "}
                    {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
                      ? "✓ Configured"
                      : "✗ Missing"}
                  </li>
                  <li>
                    Secret Key:{" "}
                    {process.env.TURNSTILE_SECRET_KEY
                      ? "✓ Configured"
                      : "✗ Missing"}
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Test Instructions
                </h4>
                <ol className="space-y-1 text-gray-600 list-decimal list-inside">
                  <li>Complete the Turnstile challenge</li>
                  <li>Click &quot;Test Backend Verification&quot;</li>
                  <li>Check the verification result</li>
                  <li>Use the refresh button to reset</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

