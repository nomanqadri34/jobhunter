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
                const { Descope } = await import("@descope/web-js-sdk");
                const descope = Descope({
                  projectId: import.meta.env.VITE_DESCOPE_PROJECT_ID,
                });
                const session = descope.getSessionToken();
                if (session) {
                  token = session;
                }
              } catch (sdkError) {
                // SDK error handled silently
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

            if (!token || typeof token !== "string" || token.length < 10) {
              onError?.("Authentication succeeded but no valid token received");
              return;
            }

            const result = await authService.login(token);

            if (result.success) {
              onSuccess?.(result.user);
            } else {
              onError?.("Login failed");
            }
          } catch (error) {
            onError?.(error.message || "Login failed");
          }
        });

        descopeElement.addEventListener("error", (e) => {
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
        debug="false"
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
