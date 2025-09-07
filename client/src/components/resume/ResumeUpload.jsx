import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
import "./ResumeUpload.css";

// configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const ResumeUpload = ({ onResumeProcessed }) => {
  const [file, setFile] = useState(null);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);

  const extractSkillsFromText = (text) => {
    const skillKeywords = [
      "javascript", "python", "java", "react", "node.js", "angular", "vue.js",
      "html", "css", "sql", "mongodb", "postgresql", "mysql", "aws", "azure",
      "docker", "kubernetes", "git", "github", "typescript", "php", "ruby",
      "c++", "c#", ".net", "spring", "django", "flask", "express", "laravel",
      "bootstrap", "tailwind", "sass", "less", "webpack", "babel", "npm",
      "yarn", "redux", "vuex", "graphql", "rest api", "microservices",
      "agile", "scrum", "devops", "ci/cd", "jenkins", "terraform", "ansible",
      "linux", "ubuntu", "centos", "nginx", "apache", "redis", "elasticsearch",
      "machine learning", "ai", "data science", "pandas", "numpy", "tensorflow",
      "pytorch", "scikit-learn", "r", "matlab", "tableau", "power bi",
      "project management", "leadership", "communication", "problem solving",
      "teamwork", "analytical", "creative", "marketing", "sales", "finance",
      "accounting", "excel", "powerpoint", "word", "photoshop", "illustrator",
      "figma", "sketch", "ui/ux", "design", "wireframing", "prototyping"
    ];

    const textLower = text.toLowerCase();
    const foundSkills = skillKeywords.filter(skill => 
      textLower.includes(skill.toLowerCase())
    );

    return [...new Set(foundSkills)];
  };

  const searchJobsWithSkills = async (skills) => {
    const allJobs = [];
    const RAPIDAPI_KEY = "178e03ae52msh333250cd810e2a4p19a7a1jsne730aff3a9b5";

    for (const skill of skills.slice(0, 3)) {
      try {
        const query = `${skill} jobs`;
        const response = await fetch(
          `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1&country=us&date_posted=all`,
          {
            method: "GET",
            headers: {
              "x-rapidapi-host": "jsearch.p.rapidapi.com",
              "x-rapidapi-key": RAPIDAPI_KEY
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            allJobs.push(...data.data);
          }
        }
      } catch (error) {
        console.warn(`Failed to search jobs for skill: ${skill}`, error);
      }
    }

    const uniqueJobs = allJobs.filter(
      (job, index, self) => index === self.findIndex(j => j.job_id === job.job_id)
    );

    const jobsWithScores = uniqueJobs.map(job => {
      const jobTitle = (job.job_title || "").toLowerCase();
      const jobDesc = (job.job_description || "").toLowerCase();
      
      let matchScore = 30;
      let skillMatches = 0;

      skills.forEach(skill => {
        const skillLower = skill.toLowerCase();
        if (jobTitle.includes(skillLower)) {
          matchScore += 20;
          skillMatches++;
        } else if (jobDesc.includes(skillLower)) {
          matchScore += 10;
          skillMatches++;
        }
      });

      if (skillMatches >= 2) matchScore += 15;

      return { ...job, matchScore: Math.min(matchScore, 98), skillMatches };
    });

    return jobsWithScores
      .filter(job => job.matchScore >= 40)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  };

  const processText = async (text) => {
    setLoading(true);
    try {
      const skills = extractSkillsFromText(text);
      setExtractedSkills(skills);

      if (skills.length === 0) {
        alert("No skills found. Please ensure your resume contains clear skill information.");
        setJobs([]);
        return;
      }

      const matchedJobs = await searchJobsWithSkills(skills);
      setJobs(matchedJobs);

      if (onResumeProcessed) {
        onResumeProcessed({ skills, text });
      }

      console.log(`Extracted ${skills.length} skills and found ${matchedJobs.length} matching jobs`);
    } catch (error) {
      console.error("Resume processing error:", error);
      alert("Failed to process resume: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let textContent = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      textContent += text.items.map((s) => s.str).join(" ") + "\n";
    }

    return textContent;
  };

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    try {
      let text = '';
      if (selectedFile.type === "text/plain") {
        text = await selectedFile.text();
      } else if (selectedFile.type === "application/pdf") {
        text = await extractTextFromPDF(selectedFile);
      } else {
        alert("Please upload a PDF or TXT file.");
        return;
      }
      
      await processText(text);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleTextPaste = async (event) => {
    const text = event.target.value;
    if (text.trim().length > 50) {
      await processText(text);
    }
  };

  const renderJobCard = (job) => (
    <div key={job.job_id} className="job-card">
      <div className="job-header">
        <h4>{job.job_title}</h4>
        <span className="match-score">Match: {job.matchScore}%</span>
      </div>
      
      <div className="job-details">
        <p><strong>Company:</strong> {job.employer_name}</p>
        <p><strong>Location:</strong> {job.job_city}, {job.job_state}</p>
        {job.job_salary && <p><strong>Salary:</strong> {job.job_salary}</p>}
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
      </div>
    </div>
  );

  return (
    <div className="resume-upload">
      <div className="upload-header">
        <h2>Resume Skill Extraction & Job Matching</h2>
        <p>Upload your resume text or paste it below to extract skills and find matching jobs</p>
      </div>

      <div className="upload-section">
        <div className="file-upload">
          <h3>Upload Resume (PDF or TXT)</h3>
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileUpload}
            className="file-input"
            disabled={loading}
          />
          {file && (
            <div className="file-info">
              <p>Selected: {file.name}</p>
            </div>
          )}
        </div>

        <div className="text-input-section">
          <h3>Or paste your resume text here:</h3>
          <textarea
            placeholder="Paste your resume content here..."
            className="resume-textarea"
            onChange={handleTextPaste}
            disabled={loading}
            rows="8"
          />
        </div>

        {loading && (
          <div className="loading-section">
            <div className="spinner"></div>
            <p>Extracting skills and searching for jobs...</p>
          </div>
        )}
      </div>

      {extractedSkills.length > 0 && (
        <div className="skills-section">
          <h3>Extracted Skills ({extractedSkills.length})</h3>
          <div className="skills-list">
            {extractedSkills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {jobs.length > 0 && (
        <div className="jobs-section">
          <h3>Matching Jobs ({jobs.length})</h3>
          <div className="jobs-grid">
            {jobs.map(renderJobCard)}
          </div>
        </div>
      )}

      {!loading && extractedSkills.length > 0 && jobs.length === 0 && (
        <div className="no-jobs-message">
          <p>No matching jobs found for your skills. Try different content or check back later.</p>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;