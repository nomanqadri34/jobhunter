import React, { useState, useEffect } from "react";
import { jobService } from "../../services/jobService";
import "./AdvancedJobSearch.css";

const AdvancedJobSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [searchResults, setSearchResults] = useState({
    jsearch: null,
    atsExpired: null,
    internships: null,
    combined: null,
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("combined");
  const [resumeText, setResumeText] = useState("");
  const [parsedResume, setParsedResume] = useState(null);
  const [interviewPrep, setInterviewPrep] = useState(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  const handleSearch = async (searchType = "combined") => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      let results = {};

      switch (searchType) {
        case "jsearch":
          results.jsearch = await jobService.searchJobsJSearch(searchQuery);
          break;

        case "internships":
          results.internships = await jobService.getActiveInternships();
          break;
        case "combined":
        default:
          results.combined = await jobService.searchAllJobs(
            searchQuery,
            location
          );
          break;
      }

      setSearchResults((prev) => ({ ...prev, ...results }));
      setActiveTab(searchType);
    } catch (error) {
      console.error("Search error:", error);
      alert("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeText.trim()) return;

    setLoading(true);
    try {
      const result = await jobService.parseResume(resumeText);
      setParsedResume(result.data);
      alert("Resume parsed successfully!");
    } catch (error) {
      console.error("Resume parsing error:", error);
      alert("Resume parsing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderJobCard = (job, source) => (
    <div
      key={`${source}-${job.id || job.job_id || Math.random()}`}
      className="job-card"
    >
      <div className="job-header">
        <h3>{job.job_title || job.title || "Job Title"}</h3>
        <span className="job-source">{source}</span>
      </div>
      <div className="job-details">
        <p>
          <strong>Company:</strong> {job.employer_name || job.company || "N/A"}
        </p>
        <p>
          <strong>Location:</strong> {job.job_city || job.location || "N/A"}
        </p>
        {job.job_salary && (
          <p>
            <strong>Salary:</strong> {job.job_salary}
          </p>
        )}
        {job.job_employment_type && (
          <p>
            <strong>Type:</strong> {job.job_employment_type}
          </p>
        )}
        <p className="job-description">
          {job.job_description?.substring(0, 200) ||
            job.description?.substring(0, 200) ||
            "No description available"}
          ...
        </p>
      </div>
      <div className="job-actions">
        {job.job_apply_link && (
          <a
            href={job.job_apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="apply-btn"
          >
            Apply Now
          </a>
        )}
      </div>
    </div>
  );

  const handleSaveJob = async (job) => {
    try {
      await jobService.saveJob(job.id || job.job_id);
      alert("Job saved successfully!");
    } catch (error) {
      console.error("Save job error:", error);
      alert("Failed to save job. Please try again.");
    }
  };

  const handleGenerateInterviewPrep = async (job) => {
    setLoading(true);
    try {
      const jobTitle = job.job_title || job.title || "Software Developer";
      const companyName = job.employer_name || job.company || "Company";
      const jobDescription = job.job_description || job.description || "";

      const result = await jobService.generateInterviewPrep(
        jobTitle,
        companyName,
        jobDescription
      );
      setInterviewPrep(result.data);
      setShowInterviewModal(true);
    } catch (error) {
      console.error("Interview prep generation error:", error);
      alert("Failed to generate interview preparation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderResults = () => {
    const currentResults = searchResults[activeTab];

    if (!currentResults)
      return <div className="no-results">No results to display</div>;

    if (activeTab === "combined") {
      return (
        <div className="combined-results">
          {currentResults.jsearch?.data?.data && (
            <div className="result-section">
              <h3>
                JSearch Results ({currentResults.jsearch.data.data.length})
              </h3>
              <div className="jobs-grid">
                {currentResults.jsearch.data.data.map((job) =>
                  renderJobCard(job, "JSearch")
                )}
              </div>
            </div>
          )}

          {currentResults.atsExpired?.data && (
            <div className="result-section">
              <h3>
                ATS Expired Jobs (
                {Array.isArray(currentResults.atsExpired.data)
                  ? currentResults.atsExpired.data.length
                  : 0}
                )
              </h3>
              <div className="jobs-grid">
                {Array.isArray(currentResults.atsExpired.data) &&
                  currentResults.atsExpired.data.map((job) =>
                    renderJobCard(job, "ATS")
                  )}
              </div>
            </div>
          )}

          {currentResults.internships?.data && (
            <div className="result-section">
              <h3>
                Internships (
                {Array.isArray(currentResults.internships.data)
                  ? currentResults.internships.data.length
                  : 0}
                )
              </h3>
              <div className="jobs-grid">
                {Array.isArray(currentResults.internships.data) &&
                  currentResults.internships.data.map((job) =>
                    renderJobCard(job, "Internships")
                  )}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Single source results
    const jobs = currentResults.data?.data || currentResults.data || [];
    return (
      <div className="jobs-grid">
        {Array.isArray(jobs) ? (
          jobs.map((job) => renderJobCard(job, activeTab))
        ) : (
          <div className="no-results">No jobs found</div>
        )}
      </div>
    );
  };

  return (
    <div className="advanced-job-search">
      <div className="search-header">
        <h2>Advanced Job Search</h2>
        <p>Search across multiple job platforms and APIs</p>
      </div>

      <div className="search-controls">
        <div className="search-inputs">
          <input
            type="text"
            placeholder="Enter job title or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <input
            type="text"
            placeholder="Location (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="location-input"
          />
        </div>

        <div className="search-buttons">
          <button
            onClick={() => handleSearch("combined")}
            disabled={loading}
            className="search-btn primary"
          >
            {loading ? "Searching..." : "Search All Sources"}
          </button>
          <button
            onClick={() => handleSearch("jsearch")}
            disabled={loading}
            className="search-btn"
          >
            JSearch Only
          </button>

          <button
            onClick={() => handleSearch("internships")}
            disabled={loading}
            className="search-btn"
          >
            Internships
          </button>
        </div>
      </div>

      <div className="resume-section">
        <h3>Resume Parser</h3>
        <textarea
          placeholder="Paste your resume text here to get personalized job recommendations..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          className="resume-textarea"
          rows="6"
        />
        <button
          onClick={handleResumeUpload}
          disabled={loading || !resumeText.trim()}
          className="parse-btn"
        >
          {loading ? "Parsing..." : "Parse Resume"}
        </button>

        {parsedResume && (
          <div className="parsed-resume">
            <h4>Parsed Resume Data:</h4>
            <pre>{JSON.stringify(parsedResume, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="results-section">
        <div className="results-tabs">
          <button
            className={activeTab === "combined" ? "tab active" : "tab"}
            onClick={() => setActiveTab("combined")}
          >
            Combined Results
          </button>
          <button
            className={activeTab === "jsearch" ? "tab active" : "tab"}
            onClick={() => setActiveTab("jsearch")}
          >
            JSearch
          </button>

          <button
            className={activeTab === "internships" ? "tab active" : "tab"}
            onClick={() => setActiveTab("internships")}
          >
            Internships
          </button>
        </div>

        <div className="results-content">
          {loading ? (
            <div className="loading">Searching for jobs...</div>
          ) : (
            renderResults()
          )}
        </div>
      </div>

      {/* Interview Preparation Modal */}
      {showInterviewModal && interviewPrep && (
        <div
          className="modal-overlay"
          onClick={() => setShowInterviewModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Interview Preparation</h3>
              <button
                className="close-btn"
                onClick={() => setShowInterviewModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="interview-prep-content">
                <pre>{interviewPrep.interviewPrep}</pre>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="close-modal-btn"
                onClick={() => setShowInterviewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedJobSearch;
