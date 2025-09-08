import React from "react";
import { Descope } from "@descope/react-sdk";
import { useNavigate } from "react-router-dom";
import "./pages/Login.css"; // Import the CSS file

const Login = () => {
  const navigate = useNavigate();
  const descopeFlowUrl = import.meta.env.VITE_DESCOPE_FLOW_URL;

  const onDescopeSuccess = (e) => {
    navigate("/dashboard");
  };

  const onDescopeError = (err) => {
    // Handle login error
  };

  return (
    <div className="login-page">
      <div className="auth-section">
        <div className="login-container">
          <div className="login-header">
            <h1>Welcome to Job Hunter</h1>
            <p>Sign in to access your personalized job search dashboard</p>
          </div>
          <Descope
            flowId="sign-up-or-in"
            onSuccess={onDescopeSuccess}
            onError={onDescopeError}
            debug={false}
          />
          <div className="login-footer">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
