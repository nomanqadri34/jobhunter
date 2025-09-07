import React from "react";
import { Descope } from "@descope/react-sdk";
import { useNavigate } from "react-router-dom";
import "./pages/Login.css"; // Import the CSS file

const Login = () => {
  const navigate = useNavigate();
  const descopeFlowUrl = import.meta.env.VITE_DESCOPE_FLOW_URL;

  const onDescopeSuccess = (e) => {
    console.log("Descope login successful:", e.detail.user);
    navigate("/dashboard");
  };

  const onDescopeError = (err) => {
    console.error("Descope login error:", err);
    // Handle login error
  };

  return (
    <div className="login-page">
      <div className="auth-section">
        <Descope
          flowId="sign-up-or-in"
          onSuccess={onDescopeSuccess}
          onError={onDescopeError}
        />
      </div>
    </div>
  );
};

export default Login;
