import React, { useEffect, useRef } from "react";

export const DescopeTest = () => {
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
        console.log("Descope test element found");

        // Listen for all events
        ["success", "error", "ready", "userAuthenticated", "loaded"].forEach(
          (eventName) => {
            descopeElement.addEventListener(eventName, (e) => {
              console.log(`🔍 Descope ${eventName} event:`, e.detail);

              if (eventName === "success") {
                console.log("🎉 SUCCESS EVENT DETAILS:");
                console.log("- Event detail:", e.detail);
                console.log("- Event detail type:", typeof e.detail);
                console.log(
                  "- Event detail keys:",
                  Object.keys(e.detail || {})
                );

                if (e.detail) {
                  Object.keys(e.detail).forEach((key) => {
                    console.log(`- ${key}:`, e.detail[key]);
                  });
                }
              }
            });
          }
        );
      }
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div
      style={{ padding: "20px", border: "2px solid #007bff", margin: "20px" }}
    >
      <h3>Descope Test Component</h3>
      <p>Check browser console for detailed event logs</p>

      <descope-wc
        ref={descopeRef}
        project-id={import.meta.env.VITE_DESCOPE_PROJECT_ID}
        flow-id="sign-up-or-in"
        theme="light"
        debug="true"
      />

      <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
        <p>Project ID: {import.meta.env.VITE_DESCOPE_PROJECT_ID}</p>
        <p>Flow ID: sign-up-or-in</p>
      </div>
    </div>
  );
};
