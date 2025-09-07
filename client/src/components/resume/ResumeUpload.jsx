import React, { useState } from "react";
import { jobService } from "../../services/jobService";
import "./ResumeUpload.css";

const ResumeUpload = ({ onResumeProcessed }) => {
  const [resumeText, setResumeText] = useState("");
  const [file, setFile] = useState(null);
  const [parsedResume, setParsedResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobRecommendations, setJobRecommendations] = useState(null);

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      try {
        setLoading(true);
        const result = await jobService.parseResumeFile(selectedFile);
        setParsedResume(result.data);
        if (onResumeProcessed) {
          onResumeProcessed(result.data);
        }
        const parsed = result?.data || {};
        const derivedText =
          parsed.rawText ||
          parsed.text ||
          parsed.content ||
          parsed.extractedText ||
          parsed.resumeText ||
          "";
        if (derivedText) {
          setResumeText(derivedText);
        }
        if (result.data) {
          await getJobRecommendations(result.data);
        }
      } catch (err) {
        console.error("Resume file parse error:", err);
        alert("Failed to read resume file. You can paste resume text and try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleParseResume = async () => {
    if (!resumeText.trim()) {
      alert("Please upload a resume file or paste resume text");
      return;
    }

    setLoading(true);
    try {
      const parseResult = await jobService.parseResume(resumeText);
      setParsedResume(parseResult.data);

      if (parseResult.data) {
        await getJobRecommendations(parseResult.data);
      }

      if (onResumeProcessed) {
        onResumeProcessed(parseResult.data);
      }

      alert("Resume processed successfully!");
    } catch (error) {
      console.error("Resume processing error:", error);
      alert("Failed to process resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getJobRecommendations = async (resumeData) => {
    try {
      const extractedSkills = resumeData.Skills || resumeData.skills || [];
      const workExperience = resumeData.WorkExperience || [];
      const experienceLevel = resumeData.ExperienceLevel || resumeData.experienceLevel || "";
      
      // Only proceed if we have extracted skills
      if (extractedSkills.length === 0) {
        console.log("No skills found in resume. Cannot search for jobs without skills.");
        setJobRecommendations([]);
        return;
      }
      
      const searchQueries = [];
      
      // Use only exact skills from resume
      extractedSkills.slice(0, 5).forEach(skill => {
        if (skill && skill.trim()) {
          searchQueries.push(skill.trim());
        }
      });
      
      // Use job titles from work experience if available
      if (workExperience.length > 0) {
        workExperience.slice(0, 2).forEach(exp => {
          if (exp.JobTitle && exp.JobTitle.trim()) {
            searchQueries.push(exp.JobTitle.trim());
          }
        });
      }
      
      // Only search if we have skills or job titles
      if (searchQueries.length === 0) {
        console.log("No valid skills or job titles found for job search.");
        setJobRecommendations([]);
        return;
      }
      
      const allJobs = [];
      
      // Search with skill-based queries only
      for (const query of searchQueries.slice(0, 6)) {
        try {
          console.log(`Searching jobs for skill/title: "${query}"`);
          const result = await jobService.searchJobsJSearch(query, 1, 3);
          if (result.data?.data) {
            allJobs.push(...result.data.data);
          }
        } catch (error) {
          console.warn(`Job search failed for query: "${query}"`, error);
        }
      }
      
      // Remove duplicates
      const uniqueJobs = allJobs.filter(
        (job, index, self) =>
          index === self.findIndex((j) => j.job_id === job.job_id)
      );
      
      // Calculate match scores based on skill overlap
      const jobsWithScores = uniqueJobs.map(job => {
        const jobTitle = (job.job_title || "").toLowerCase();
        const jobDesc = (job.job_description || "").toLowerCase();
        
        let matchScore = 30; // Lower base score
        let skillMatches = 0;
        
        // Calculate skill matches
        extractedSkills.forEach(skill => {
          const skillLower = skill.toLowerCase();
          if (jobTitle.includes(skillLower)) {
            matchScore += 20; // Higher weight for title matches
            skillMatches++;
          } else if (jobDesc.includes(skillLower)) {
            matchScore += 10; // Lower weight for description matches
            skillMatches++;
          }
        });
        
        // Bonus for multiple skill matches
        if (skillMatches >= 2) {
          matchScore += 15;
        }
        
        // Experience level match bonus
        if (experienceLevel && (jobTitle.includes(experienceLevel.toLowerCase()) || jobDesc.includes(experienceLevel.toLowerCase()))) {
          matchScore += 10;
        }
        
        return { ...job, matchScore: Math.min(matchScore, 98), skillMatches };
      });
      
      // Sort by match score and skill matches, take top 12
      const sortedJobs = jobsWithScores
        .filter(job => job.matchScore >= 40) // Only show jobs with decent match
        .sort((a, b) => {
          if (b.matchScore !== a.matchScore) {
            return b.matchScore - a.matchScore;
          }
          return b.skillMatches - a.skillMatches;
        })
        .slice(0, 12);
      
      setJobRecommendations(sortedJobs);
      console.log(`Found ${sortedJobs.length} skill-matched job recommendations`);
      
    } catch (error) {
      console.error("Error getting job recommendations:", error);
      setJobRecommendations([]);
    }
  };

  const renderJobCard = (job) => (
    <div key={job.job_id} className="job-recommendation-card">
      <div className="job-header">
        <h4>{job.job_title}</h4>
        <span className="job-match">
          Match: {job.matchScore || 75}%
        </span>
      </div>
      <div className="job-details">
        <p>
          <strong>Company:</strong> {job.employer_name}
        </p>
        <p>
          <strong>Location:</strong> {job.job_city}, {job.job_state}
        </p>
        {job.job_salary && (
          <p>
            <strong>Salary:</strong> {job.job_salary}
          </p>
        )}
        <p className="job-description">
          {job.job_description?.substring(0, 150)}...
        </p>
        {job.skillMatches > 0 && (
          <p className="skill-matches">
            <strong>Skills Matched:</strong> {job.skillMatches} skill{job.skillMatches > 1 ? 's' : ''}
          </p>
        )}
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
        <button className="save-btn" onClick={() => handleSaveJob(job)}>
          Save Job
        </button>
      </div>
    </div>
  );

  const handleSaveJob = async (job) => {
    try {
      await jobService.saveJob(job.job_id);
      alert("Job saved successfully!");
    } catch (error) {
      console.error("Save job error:", error);
      alert("Failed to save job. Please try again.");
    }
  };

  return (
    <div className="resume-upload">
      <div className="upload-header">
        <h2>Resume Upload & Skill-Based Job Matching</h2>
        <p>Upload your resume to extract skills and find matching jobs</p>
      </div>

      <div className="upload-section">
        <div className="file-upload">
          <h3>Upload Resume File</h3>
          <input
            type="file"
            accept=".txt,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="file-input"
          />
          {file && (
            <div className="file-info">
              <p>Selected: {file.name}</p>
            </div>
          )}
        </div>

        <div className="text-upload">
          <h3>Or Paste Resume Text</h3>
          <textarea
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="resume-textarea"
            rows="10"
          />
        </div>

        <button
          onClick={handleParseResume}
          disabled={loading || !resumeText.trim()}
          className="process-btn"
        >
          {loading ? (
            <>
              <div className="btn-spinner"></div>
              Extracting Skills & Finding Jobs...
            </>
          ) : (
            <>
              <svg
                className="btn-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
              </svg>
              Extract Skills & Find Matching Jobs
            </>
          )}
        </button>
      </div>



      {jobRecommendations !== null && (
        <div className="recommendations-section">
          <h3>Jobs Matching Your Skills</h3>
          {jobRecommendations.length > 0 ? (
            <div className="jobs-grid">
              {jobRecommendations.map(renderJobCard)}
            </div>
          ) : (
            <div className="no-jobs-message">
              <p>
                No jobs found matching your extracted skills. 
                {parsedResume && (parsedResume.Skills || parsedResume.skills)?.length === 0 && 
                  " Please ensure your resume contains clear skill information."
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;