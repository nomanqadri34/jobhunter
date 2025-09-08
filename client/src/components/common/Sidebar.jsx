import React from "react";
import {
  Home,
  Briefcase,
  Bookmark,
  Calendar,
  MessageSquare,
  Upload,
  Settings,
  User,
  Search,
  FileText,
  Map,
  X,
} from "lucide-react";
import "./Sidebar.css";

export const Sidebar = ({
  activeTab,
  onTabChange,
  showSidebar,
  onCloseSidebar,
  resumeData,
}) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "resume", label: "Upload Resume", icon: Upload },
    { id: "jobs", label: "Job Feed", icon: Briefcase },
    { id: "advanced-search", label: "Advanced Search", icon: Search },

    { id: "interview-details", label: "Interview Details", icon: FileText },
    { id: "career-roadmap", label: "Career Roadmap", icon: Map },

    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      <aside
        className={`sidebar ${showSidebar ? "show" : ""}`}
        role="complementary"
        aria-label="Sidebar"
      >
        <div className="sidebar-header">
          <button
            className="sidebar-logo brand"
            type="button"
            aria-label="Go to Dashboard"
            onClick={() => {
              onTabChange("dashboard");
              if (window.innerWidth < 768) {
                onCloseSidebar();
              }
            }}
          >
            <img src="/logo.png" alt="Job Hunter logo" className="brand-logo" />
            <h1 className="brand-title">Job Hunter</h1>
          </button>
          <button
            className="sidebar-close"
            type="button"
            aria-label="Close sidebar"
            title="Close"
            onClick={onCloseSidebar}
          >
            <X size={24} />
          </button>
        </div>

        {resumeData && (
          <div className="resume-summary">
            <h3>Profile Summary</h3>
            <div className="profile-info">
              <p className="name">{resumeData.name || "Your Name"}</p>
              <p className="email">
                {resumeData.email || "your.email@example.com"}
              </p>
            </div>
            {resumeData.skills && resumeData.skills.length > 0 && (
              <div className="skills-preview">
                <h4>Top Skills</h4>
                <div className="skills-tags">
                  {resumeData.skills.slice(0, 4).map((skill, index) => (
                    <span key={index} className="skill-tag-small">
                      {skill}
                    </span>
                  ))}
                  {resumeData.skills.length > 4 && (
                    <span className="skill-tag-small more">
                      +{resumeData.skills.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <nav className="sidebar-nav" role="navigation" aria-label="Primary">
          {menuItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`sidebar-item ${activeTab === id ? "active" : ""}`}
              type="button"
              aria-label={label}
              aria-current={activeTab === id ? "page" : undefined}
              onClick={() => {
                onTabChange(id);
                if (window.innerWidth < 768) {
                  onCloseSidebar();
                }
              }}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};
