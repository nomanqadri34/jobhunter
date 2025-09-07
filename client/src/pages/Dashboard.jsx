import React, { useState, useEffect } from "react";
import { Navbar } from "../components/common/Navbar";
import { Sidebar } from "../components/common/Sidebar";
import { JobCard } from "../components/dashboard/JobCard";
import { JobPreferencesForm } from "../components/forms/JobPreferencesForm";
import { OAuthConnections } from "../components/oauth/OAuthConnections";
import { InterviewPrep } from "../components/interview/InterviewPrep";
import AdvancedJobSearch from "../components/jobs/AdvancedJobSearch";
import InterviewDetails from "../components/interview/InterviewDetails";
import ResumeUpload from "../components/resume/ResumeUpload";
import CareerRoadmap from "../components/career/CareerRoadmap";
import { jobService } from "../services/jobService";
import { SlidersHorizontal } from "lucide-react";

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [jobs, setJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [userPreferences, setUserPreferences] = useState({});
  const [userSkills, setUserSkills] = useState([
    "JavaScript",
    "React",
    "Node.js",
  ]);
  const [userExperienceLevel, setUserExperienceLevel] = useState("associate");
  const [interviewJobTitle, setInterviewJobTitle] =
    useState("Software Developer");
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [filters, setFilters] = useState({
    query: "",
    location: "",
    remote: false,
    salaryMin: "",
    experienceLevel: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Handle OAuth callback parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const googleStatus = urlParams.get("google");
    const linkedinStatus = urlParams.get("linkedin");

    if (googleStatus === "connected") {
      alert("Google account connected successfully!");
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (googleStatus === "error") {
      alert("Failed to connect Google account. Please try again.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (linkedinStatus === "connected") {
      alert("LinkedIn account connected successfully!");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (linkedinStatus === "error") {
      alert("Failed to connect LinkedIn account. Please try again.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "dashboard" || activeTab === "jobs") {
      fetchJobs();
    }
  }, [activeTab, filters]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      console.log("🔍 Fetching jobs with filters:", filters);
      const response = await jobService.searchJobs(filters);
      console.log("📊 Jobs response:", response);
      console.log("📋 Jobs array:", response.jobs);
      setJobs(response.jobs || []);
    } catch (error) {
      console.error("❌ Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setFilters((prev) => ({ ...prev, query }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSavePreferences = async (preferences) => {
    try {
      setUserPreferences(preferences);
      setUserSkills(preferences.skills || []);
      setUserExperienceLevel(preferences.experienceLevel || "associate");
      setInterviewJobTitle(preferences.title || "Software Developer");

      alert("Preferences saved successfully!");
    } catch (error) {
      console.error("Failed to save preferences:", error);
      alert("Failed to save preferences. Please try again.");
    }
  };

  const handleResumeProcessed = (processedResumeData) => {
    if (!processedResumeData) {
      setResumeData(null);
      return;
    }
    
    setResumeData(processedResumeData);

    // Update user skills and experience based on resume
    if (processedResumeData.Skills || processedResumeData.skills) {
      setUserSkills(processedResumeData.Skills || processedResumeData.skills);
    }

    if (
      processedResumeData.ExperienceLevel ||
      processedResumeData.experienceLevel
    ) {
      setUserExperienceLevel(
        processedResumeData.ExperienceLevel ||
        processedResumeData.experienceLevel
      );
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
      case "jobs":
        return (
          <div className="jobs-content">
            <div className="jobs-header">
              <div className="jobs-title">
                <h2>
                  {activeTab === "dashboard" ? "Recommended Jobs" : "All Jobs"}
                </h2>
                <p>{jobs.length} jobs found</p>
              </div>

              <button
                className="filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={20} />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="filters-panel">
                <div className="filter-group">
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="City, State, or Remote"
                    value={filters.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                  />
                </div>

                <div className="filter-group">
                  <label>Experience Level</label>
                  <select
                    value={filters.experienceLevel}
                    onChange={(e) =>
                      handleFilterChange("experienceLevel", e.target.value)
                    }
                  >
                    <option value="">Any Level</option>
                    <option value="entry">Entry Level</option>
                    <option value="associate">Associate</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior</option>
                    <option value="director">Director</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Minimum Salary</label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={filters.salaryMin}
                    onChange={(e) =>
                      handleFilterChange("salaryMin", e.target.value)
                    }
                  />
                </div>

                <div className="filter-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.remote}
                      onChange={(e) =>
                        handleFilterChange("remote", e.target.checked)
                      }
                    />
                    Remote Only
                  </label>
                </div>
              </div>
            )}

            <div className="jobs-grid">
              {loading ? (
                <div className="loading">Loading jobs...</div>
              ) : jobs.length > 0 ? (
                jobs.map((job, index) => (
                  <JobCard
                    key={job.job_id || job._id || `job-${index}`}
                    job={job}
                    onSave={(jobId) => console.log("Saved job:", jobId)}
                    onApply={(jobId) => console.log("Applied to job:", jobId)}
                  />
                ))
              ) : (
                <div className="no-jobs">
                  <p>No jobs found. Try adjusting your filters.</p>
                </div>
              )}
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="profile-content">
            <OAuthConnections
              user={user}
              onConnectionUpdate={() => {
                // Refresh user data after connection
                console.log("Connection updated");
              }}
            />
          </div>
        );

      case "resume":
        return (
          <div className="resume-content">
            <ResumeUpload onResumeProcessed={handleResumeProcessed} />
          </div>
        );

      case "settings":
        return (
          <div className="preferences-content">
            <JobPreferencesForm
              onSave={handleSavePreferences}
              initialData={userPreferences}
            />
          </div>
        );

      case "interview":
        return (
          <div className="interview-content">
            <InterviewPrep
              jobTitle={interviewJobTitle}
              userSkills={userSkills}
              experienceLevel={userExperienceLevel}
              googleTokens={user?.googleTokens}
            />
          </div>
        );

      case "advanced-search":
        return (
          <div className="advanced-search-content">
            <AdvancedJobSearch />
          </div>
        );

      case "interview-details":
        return (
          <div className="interview-details-content">
            <InterviewDetails />
          </div>
        );

      case "career-roadmap":
        return (
          <div className="career-roadmap-content">
            <CareerRoadmap />
          </div>
        );

      default:
        return (
          <div className="content-placeholder">
            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            <p>This section is coming soon!</p>
          </div>
        );
    }
  };

  return (
    <div className={`dashboard ${showSidebar ? "sidebar-open" : ""}`}>
      <Navbar onSearch={handleSearch} onToggleSidebar={toggleSidebar} />

      <div className="dashboard-content">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          resumeData={resumeData}
          showSidebar={showSidebar}
          onCloseSidebar={() => setShowSidebar(false)}
        />

        <main className="main-content">{renderContent()}</main>
      </div>
    </div>
  );
};
