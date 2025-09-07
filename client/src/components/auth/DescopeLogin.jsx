import React, { useEffect, useRef } from "react";
import { authService } from "../../services/authService";

export const DescopeLogin = ({ onSuccess, onError }) => {
  const descopeRef = useRef(null);

  useEffect(() => {
    // Load Descope Web Component
    const script = document.createElement("script");
    script.src =
      "https://unpkg.com/@descope/web-component@latest/dist/index.js";
    script.type = "module";
    document.head.appendChild(script);

    script.onload = () => {
      const descopeElement = descopeRef.current;

      if (descopeElement) {
        // Listen for successful authentication
        descopeElement.addEventListener("success", async (e) => {
          try {
            console.log("🎉 Descope success event detail:", e.detail);
            console.log("🎉 Full event object:", e);
            console.log("🎉 Event detail type:", typeof e.detail);

            // Log all available properties
            if (e.detail && typeof e.detail === "object") {
              console.log("🎉 Available properties:", Object.keys(e.detail));
              Object.keys(e.detail).forEach((key) => {
                console.log(
                  `🎉 ${key}:`,
                  e.detail[key],
                  `(${typeof e.detail[key]})`
                );
              });
            }

            // The Descope web component should provide the session token
            // Let's try to get it from the Descope SDK directly
            let token = null;

            // Method 1: Check event detail properties
            if (e.detail) {
              token =
                e.detail.sessionToken ||
                e.detail.token ||
                e.detail.jwt ||
                e.detail.accessToken ||
                e.detail.sessionJwt ||
                e.detail.refreshToken;
            }

            // Method 2: Try to get session token from Descope SDK
            if (!token) {
              try {
                // Import Descope SDK dynamically
                const { Descope } = await import("@descope/web-js-sdk");
                const descope = Descope({
                  projectId: import.meta.env.VITE_DESCOPE_PROJECT_ID,
                });
                const session = descope.getSessionToken();
                if (session) {
                  token = session;
                  console.log("🎉 Got token from Descope SDK:", token);
                }
              } catch (sdkError) {
                console.log("Could not get token from Descope SDK:", sdkError);
              }
            }

            // Method 3: Check if the detail itself is a token string
            if (
              !token &&
              typeof e.detail === "string" &&
              e.detail.length > 50
            ) {
              token = e.detail;
            }

            console.log("🎉 Final extracted token:", token);
            console.log("🎉 Token type:", typeof token);
            console.log("🎉 Token length:", token?.length);

            // Validate token format (JWT should start with eyJ)
            if (
              token &&
              typeof token === "string" &&
              !token.startsWith("eyJ")
            ) {
              console.warn(
                "⚠️ Token doesn't look like a JWT (should start with 'eyJ')"
              );
            }

            if (!token || typeof token !== "string" || token.length < 10) {
              console.error("❌ No valid token found in Descope success event");
              console.error(
                "Available properties:",
                Object.keys(e.detail || {})
              );
              onError?.("Authentication succeeded but no valid token received");
              return;
            }

            // Login with Descope token
            console.log("🚀 Calling authService.login with token");
            const result = await authService.login(token);

            if (result.success) {
              console.log("✅ Login successful");
              onSuccess?.(result.user);
            } else {
              console.error("❌ Login failed:", result);
              onError?.("Login failed");
            }
          } catch (error) {
            console.error("❌ Login error:", error);
            onError?.(error.message || "Login failed");
          }
        });

        // Listen for authentication errors
        descopeElement.addEventListener("error", (e) => {
          console.error("Descope authentication error:", e.detail);
          onError?.(e.detail.errorMessage || "Authentication failed");
        });
      }
    };

    return () => {
      // Cleanup script
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [onSuccess, onError]);

  return (
    <div className="descope-login-container">
      <div className="login-header">
        <h2>Welcome to Job Hunter</h2>
        <p>Sign in to access your personalized job search dashboard</p>
      </div>

      <descope-wc
        ref={descopeRef}
        project-id={import.meta.env.VITE_DESCOPE_PROJECT_ID}
        flow-id="sign-up-or-in"
        theme="light"
        debug="true"
        auto-focus="true"
      />

      <div className="login-footer">
        <p>
          By signing in, you agree to our Terms of Service and Privacy Policy.
          Connect your Google and apple  accounts for enhanced features.
        </p>
      </div>
    </div>
  );
};
