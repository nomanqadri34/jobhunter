import React, { useState } from "react";
import { jobService } from "../../services/jobService";
import { geminiService } from "../../services/geminiService";
import "./InterviewDetails.css";

const InterviewDetails = () => {
  const [interviewId, setInterviewId] = useState("");
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [interviewPrep, setInterviewPrep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const handleGetInterviewDetails = async () => {
    if (!interviewId.trim()) {
      alert("Please enter an interview ID");
      return;
    }

    // Validate that the interview ID is numeric
    if (!/^\d+$/.test(interviewId.trim())) {
      alert(
        "Interview ID must be a number (e.g., 19018219). You can find these IDs on Glassdoor interview pages."
      );
      return;
    }

    setLoading(true);
    try {
      const result = await jobService.getInterviewDetails(interviewId.trim());
      setInterviewDetails(result.data);
      setActiveTab("details");
    } catch (error) {
      console.error("Error fetching interview details:", error);
      if (error.response?.data?.message) {
        alert(
          `Failed to fetch interview details: ${error.response.data.message}`
        );
      } else {
        alert(
          "Failed to fetch interview details. Please check that the interview ID is correct and try again. Note: Interview IDs are numeric values found on Glassdoor."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGetInterviewPrep = async () => {
    if (!companyName.trim() || !jobTitle.trim()) {
      alert("Please enter both company name and job title");
      return;
    }

    setLoading(true);
    try {
      const userSkills = JSON.parse(localStorage.getItem('userSkills') || '[]');
      
      const prepData = await geminiService.generateInterviewPrep(
        companyName.trim(),
        jobTitle.trim(),
        userSkills
      );

      console.log('Interview prep response:', prepData);
      
      setInterviewPrep({
        ...prepData,
        generatedAt: new Date().toISOString(),
      });
      setActiveTab("prep");
    } catch (error) {
      console.error("Error generating interview prep:", error);
      alert("Failed to generate interview preparation: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderInterviewDetails = () => {
    if (!interviewDetails) return null;

    const details = interviewDetails.data?.employerInterviewDetails;
    if (!details) return null;

    return (
      <div className="interview-details-content">
        <h3>Interview Details - {details.employer.name}</h3>
        
        <div className="details-card">
          <div className="detail-item">
            <h4>Position: {details.jobTitle.text}</h4>
            <p><strong>Difficulty:</strong> {details.difficulty}</p>
            <p><strong>Experience:</strong> {details.experience}</p>
            <p><strong>Outcome:</strong> {details.outcome}</p>
            <p><strong>Application Source:</strong> {details.source}</p>
          </div>

          <div className="detail-item">
            <h4>Interview Process</h4>
            <p>{details.processDescription}</p>
          </div>

          {details.userQuestions && details.userQuestions.length > 0 && (
            <div className="detail-item">
              <h4>Questions Asked</h4>
              <ul>
                {details.userQuestions.map((q, index) => (
                  <li key={index}>{q.question}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderInterviewPrep = () => {
    if (!interviewPrep) return null;

    const prep = interviewPrep.interviewPrep || interviewPrep;
    console.log('Rendering prep data:', prep); // Debug log

    // Handle rawOutput case
    if (prep.rawOutput) {
      return (
        <div className="interview-prep-content">
          <h3>AI-Generated Interview Preparation for {companyName} - {jobTitle}</h3>
          <div className="prep-section">
            <h4>AI Response</h4>
            <pre style={{whiteSpace: 'pre-wrap', fontSize: '14px'}}>{prep.rawOutput}</pre>
          </div>
        </div>
      );
    }

    return (
      <div className="interview-prep-content">
        <h3>
          AI-Generated Interview Preparation for {companyName} - {jobTitle}
        </h3>

        {prep.companyResearch && (
          <div className="prep-section">
            <h4>Company Research</h4>
            <div className="company-research">
              <div className="research-item">
                <h5>Key Facts to Know</h5>
                <ul>
                  {prep.companyResearch.keyFacts?.map((fact, index) => (
                    <li key={index}>{fact}</li>
                  ))}
                </ul>
              </div>
              <div className="research-item">
                <h5>Recent News</h5>
                <ul>
                  {prep.companyResearch.recentNews?.map((news, index) => (
                    <li key={index}>{news}</li>
                  ))}
                </ul>
              </div>
              <div className="research-item">
                <h5>Company Culture</h5>
                <p>{prep.companyResearch.culture}</p>
              </div>
            </div>
          </div>
        )}

        <div className="prep-section">
          <h4>Interview Questions to Prepare</h4>
          <div className="questions-grid">
            <div className="question-category">
              <h5>Technical Questions</h5>
              <ul>
                {prep.technicalQuestions?.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            </div>
            <div className="question-category">
              <h5>Behavioral Questions</h5>
              <ul>
                {prep.behavioralQuestions?.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            </div>
            <div className="question-category">
              <h5>Questions to Ask Interviewer</h5>
              <ul>
                {prep.questionsToAsk?.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {prep.starExamples && (
          <div className="prep-section">
            <h4>STAR Method Examples</h4>
            <div className="star-examples">
              {prep.starExamples.map((example, index) => (
                <div key={index} className="star-example">
                  <div className="star-item">
                    <strong>Situation:</strong> {example.situation}
                  </div>
                  <div className="star-item">
                    <strong>Task:</strong> {example.task}
                  </div>
                  <div className="star-item">
                    <strong>Action:</strong> {example.action}
                  </div>
                  <div className="star-item">
                    <strong>Result:</strong> {example.result}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {prep.preparationChecklist && (
          <div className="prep-section">
            <h4>Preparation Checklist</h4>
            <div className="checklist">
              {prep.preparationChecklist.map((item, index) => (
                <div key={index} className="checklist-item">
                  <input type="checkbox" id={`check-${index}`} />
                  <label htmlFor={`check-${index}`}>{item}</label>
                </div>
              ))}
            </div>
          </div>
        )}

        {prep.videos && prep.videos.length > 0 && (
          <div className="prep-section">
            <h4>📺 Recommended YouTube Videos</h4>
            <div className="videos-grid">
              {prep.videos.slice(0, 6).map((video, index) => (
                <div key={index} className="video-card">
                  <div className="video-thumbnail">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      onError={(e) => {
                        e.target.src = 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg';
                      }}
                    />
                    <div className="play-button">▶</div>
                  </div>
                  <div className="video-info">
                    <h6 title={video.title}>{video.title}</h6>
                    <p className="video-channel">{video.channelTitle}</p>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="video-link"
                    >
                      Watch on YouTube
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="interview-details">
      <div className="interview-header">
        <h2>Interview Preparation & Details</h2>
        <p>Get interview insights and preparation materials</p>
      </div>

      <div className="interview-controls">
        <div className="control-section primary">
          <h3>🤖 AI Interview Preparation</h3>
          <p>Get personalized interview preparation using AI</p>
          <div className="input-group">
            <input
              type="text"
              placeholder="Company name (e.g., Google, Microsoft)"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="interview-input"
            />
            <input
              type="text"
              placeholder="Job title (e.g., Software Engineer, Product Manager)"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="interview-input"
            />
            <button
              onClick={handleGetInterviewPrep}
              disabled={loading || !companyName.trim() || !jobTitle.trim()}
              className="prep-btn primary"
            >
              {loading ? "Generating..." : "Generate AI Prep Materials"}
            </button>
          </div>
        </div>

        <div className="control-section secondary">
          <h3>📋 Glassdoor Interview Details</h3>
          <p>
            Get specific interview details from Glassdoor (requires numeric ID)
          </p>
          <div className="input-group">
            <input
              type="text"
              placeholder="Numeric Interview ID (e.g., 19018219)"
              value={interviewId}
              onChange={(e) => setInterviewId(e.target.value)}
              className="interview-input"
            />
            <button
              onClick={handleGetInterviewDetails}
              disabled={loading || !interviewId.trim()}
              className="fetch-btn secondary"
            >
              {loading ? "Loading..." : "Get Details"}
            </button>
          </div>
          <div className="help-text">
            <small>
              💡 Find interview IDs on Glassdoor interview pages in the URL or
              page source. Example:
              glassdoor.com/Interview/...interview-questions-SRCH_KE0,1_IP2.htm?interviewId=19018219
            </small>
          </div>
        </div>
      </div>

      <div className="results-section">
        <div className="results-tabs">
          <button
            className={activeTab === "details" ? "tab active" : "tab"}
            onClick={() => setActiveTab("details")}
          >
            Interview Details
          </button>
          <button
            className={activeTab === "prep" ? "tab active" : "tab"}
            onClick={() => setActiveTab("prep")}
          >
            Preparation Materials
          </button>
        </div>

        <div className="results-content">
          {loading ? (
            <div className="loading">Loading interview data...</div>
          ) : (
            <>
              {activeTab === "details" && renderInterviewDetails()}
              {activeTab === "prep" && renderInterviewPrep()}
              {!interviewDetails && !interviewPrep && (
                <div className="no-data">
                  Use the controls above to fetch interview details or
                  preparation materials
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewDetails;
