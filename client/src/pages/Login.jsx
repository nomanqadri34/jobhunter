import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DescopeLogin } from "../components/auth/DescopeLogin";
import "./Login.css";

export const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSuccess = (user) => {
    setLoading(false);
    setError("");
    navigate("/dashboard");
  };

  const handleLoginError = (errorMessage) => {
    setLoading(false);
    setError(errorMessage);
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-content">
          <div className="brand-section">
            <h1>Job Hunter</h1>
            <p>Your AI-powered job search companion</p>
            <div className="features-list">
              <div className="feature">
                <span className="feature-icon">🤖</span>
                <span>AI-powered job matching</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📅</span>
                <span>Get Interview Prepartion Based on job exact same job_description</span>
              </div>
              <div className="feature">
                <span className="feature-icon">💼</span>
                <span>CareerRoadmap</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📊</span>
                <span>Interview preparation</span>
              </div>
            </div>
          </div>

          <div className="auth-section">
            {error && (
              <div className="error-message">
                <span>⚠️</span>
                {error}
              </div>
            )}

            {loading && (
              <div className="loading-message">
                <span>⏳</span>
                Signing you in...
              </div>
            )}

            <DescopeLogin
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
