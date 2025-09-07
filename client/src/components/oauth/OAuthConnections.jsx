import React, { useState } from "react";
import {
  ExternalLink,
  Calendar,
  Linkedin,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { authService } from "../../services/authService";
import "./OAuthConnections.css";

export const OAuthConnections = ({ user, onConnectionUpdate }) => {
  const [loading, setLoading] = useState({});
  const [error, setError] = useState("");

  const handleGoogleConnect = async () => {
    setLoading((prev) => ({ ...prev, google: true }));
    setError("");

    try {
      // Get Google OAuth URL
      const response = await authService.getGoogleAuthUrl();

      if (response.success) {
        // Redirect to OAuth URL (Descope handles the popup/redirect)
        window.location.href = response.authUrl;
      }
    } catch (error) {
      console.error("Google OAuth error:", error);
      setError("Failed to connect Google account");
      setLoading((prev) => ({ ...prev, google: false }));
    }
  };

  const handleLinkedInConnect = async () => {
    setLoading((prev) => ({ ...prev, linkedin: true }));
    setError("");

    try {
      // Get LinkedIn OAuth URL
      const response = await authService.getLinkedInAuthUrl();

      if (response.success) {
        // Redirect to OAuth URL (Descope handles the popup/redirect)
        window.location.href = response.authUrl;
      }
    } catch (error) {
      console.error("LinkedIn OAuth error:", error);
      setError("Failed to connect LinkedIn account");
      setLoading((prev) => ({ ...prev, linkedin: false }));
    }
  };

  const handleDisconnect = async (provider) => {
    setLoading((prev) => ({ ...prev, [provider]: true }));
    setError("");

    try {
      const response = await authService.disconnectAccount(provider);

      if (response.success) {
        onConnectionUpdate?.();
      }
    } catch (error) {
      console.error(`${provider} disconnect error:`, error);
      setError(`Failed to disconnect ${provider} account`);
    } finally {
      setLoading((prev) => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <div className="oauth-connections">
      <div className="connections-header">
        <h3>Connected Accounts</h3>
        <p>Connect your accounts to unlock additional features</p>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="connection-cards">
        {/* Google Connection */}
        <div className="connection-card">
          <div className="connection-info">
            <div className="connection-icon google">
              <Calendar size={24} />
            </div>
            <div className="connection-details">
              <h4>Google Account</h4>
              <p>Connect for calendar reminders and drive access</p>
              <div className="connection-features">
                <span>📅 Calendar integration</span>
                <span>📄 Resume from Drive</span>
                <span>📧 Email notifications</span>
              </div>
            </div>
          </div>

          <div className="connection-status">
            {user?.googleConnected ? (
              <div className="connected-actions">
                <div className="connected">
                  <CheckCircle size={20} className="success" />
                  <span>Connected</span>
                </div>
                <button
                  onClick={() => handleDisconnect("google")}
                  disabled={loading.google}
                  className="btn-disconnect"
                >
                  {loading.google ? "Disconnecting..." : "Disconnect"}
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleConnect}
                disabled={loading.google}
                className="btn-connect google"
              >
                {loading.google ? (
                  "Connecting..."
                ) : (
                  <>
                    <ExternalLink size={16} />
                    Connect Google
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* LinkedIn Connection */}
        <div className="connection-card">
          <div className="connection-info">
            <div className="connection-icon linkedin">
              <Linkedin size={24} />
            </div>
            <div className="connection-details">
              <h4>LinkedIn Account</h4>
              <p>Import profile data and expand your network</p>
              <div className="connection-features">
                <span>👤 Profile import</span>
                <span>🔗 Network insights</span>
                <span>💼 Job recommendations</span>
              </div>
            </div>
          </div>

          <div className="connection-status">
            {user?.linkedinConnected ? (
              <div className="connected-actions">
                <div className="connected">
                  <CheckCircle size={20} className="success" />
                  <span>Connected</span>
                </div>
                <button
                  onClick={() => handleDisconnect("linkedin")}
                  disabled={loading.linkedin}
                  className="btn-disconnect"
                >
                  {loading.linkedin ? "Disconnecting..." : "Disconnect"}
                </button>
              </div>
            ) : (
              <button
                onClick={handleLinkedInConnect}
                disabled={loading.linkedin}
                className="btn-connect linkedin"
              >
                {loading.linkedin ? (
                  "Connecting..."
                ) : (
                  <>
                    <ExternalLink size={16} />
                    Connect LinkedIn
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Connection Benefits */}
      <div className="connection-benefits">
        <h4>Why connect your accounts?</h4>
        <div className="benefits-grid">
          <div className="benefit">
            <div className="benefit-icon">🤖</div>
            <div className="benefit-text">
              <h5>AI-Powered Matching</h5>
              <p>Better job recommendations based on your complete profile</p>
            </div>
          </div>

          <div className="benefit">
            <div className="benefit-icon">📅</div>
            <div className="benefit-text">
              <h5>Smart Reminders</h5>
              <p>Automatic calendar events for interviews and deadlines</p>
            </div>
          </div>

          <div className="benefit">
            <div className="benefit-icon">📊</div>
            <div className="benefit-text">
              <h5>Enhanced Analytics</h5>
              <p>Track your job search progress and success metrics</p>
            </div>
          </div>

          <div className="benefit">
            <div className="benefit-icon">🔒</div>
            <div className="benefit-text">
              <h5>Secure & Private</h5>
              <p>Your data is encrypted and never shared without permission</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
