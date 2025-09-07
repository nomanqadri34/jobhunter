import React, { useState } from "react";
import { jobService } from "../../services/jobService";
import "./CareerRoadmap.css";

const CareerRoadmap = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  const buildLocalRoadmap = (title, skillsArr, level) => {
    const skills = skillsArr.length ? skillsArr.join(", ") : "Not specified";
    return (
      `Career Roadmap: ${title}

Overview
A practical plan to become a ${title} from ${level} level.

Prerequisites
- Consistent practice schedule (5–10 hrs/week)
- Basic computer literacy

Learning Path
Phase 1 (0–3 months): Foundations
- Learn fundamentals used by ${title}
- Complete 3 small projects

Phase 2 (3–6 months): Intermediate
- Learn popular tools/frameworks
- Build 1–2 medium projects and document them well

Phase 3 (6–12 months): Advanced
- Deep-dive into 2–3 specialization areas
- Contribute to open-source or team projects

Phase 4 (12+ months): Specialization
- Pick a niche aligned to ${title}
- Build a capstone project and prepare for interviews

Portfolio
- 3–5 projects with clear READMEs and screenshots

Current Skills: ${skills}
Next Steps
- Set weekly goals, track progress, iterate projects`
    );
  };

  const buildLocalSkillGap = (title, skillsArr, levelLabel) => (
    `Skill Gap Analysis for ${title}

Current Skills: ${skillsArr.length ? skillsArr.join(', ') : 'None listed'}
Experience: ${levelLabel}

Suggested Priorities
1) Learn core fundamentals for ${title}
2) Build 2–3 targeted portfolio projects
3) Practice common interview topics and systems questions

Focus Areas
- Fundamentals • Tools • Two portfolio projects • Mock interviews`
  );

  const handleGenerateRoadmap = async () => {
    if (!jobTitle.trim()) {
      alert("Please enter a job title");
      return;
    }

    setLoading(true);
    try {
      const skillsArray = currentSkills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill);

      const res = await jobService.generateRoadmap(
        jobTitle.trim(),
        skillsArray,
        experienceLevel
      );

      // Backend may return { success, data } or raw text
      const data = res?.data || res;
      setRoadmap({ roadmap: typeof data === "string" ? data : data.roadmap || data });
      setUsingFallback(false);
    } catch (error) {
      console.error("Roadmap generation error:", error);
      // Graceful local fallback (no alerts)
      const skillsArray = currentSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      setRoadmap({ roadmap: buildLocalRoadmap(jobTitle.trim(), skillsArray, experienceLevel) });
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillGapAnalysis = async () => {
    if (!jobTitle.trim()) {
      alert("Please enter a target job title");
      return;
    }

    setLoading(true);
    try {
      const skillsArray = currentSkills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill);

      const res = await jobService.generateSkillGapAnalysis(
        jobTitle.trim(),
        skillsArray,
        `${experienceLevel} level`
      );
      const data = res?.data || res;
      setRoadmap((prev) => ({ ...prev, skillGapAnalysis: data.analysis || data }));
      setUsingFallback(false);
    } catch (error) {
      console.error("Skill gap analysis error:", error);
      // Graceful local fallback
      const skillsArray = currentSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      setRoadmap((prev) => ({ ...prev, skillGapAnalysis: buildLocalSkillGap(jobTitle.trim(), skillsArray, `${experienceLevel} level`) }));
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="career-roadmap">
      <div className="roadmap-header">
        <h2>AI-Powered Career Roadmap</h2>
        <p>Get a personalized career development plan using AI</p>
      </div>

      <div className="roadmap-form">
        <div className="form-section">
          <h3>Tell us about your career goals</h3>

          <div className="input-group">
            <label>Target Job Title *</label>
            <input
              type="text"
              placeholder="e.g., Full Stack Developer, Data Scientist, Product Manager"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="job-title-input"
            />
          </div>

          <div className="input-group">
            <label>Current Skills (comma-separated)</label>
            <textarea
              placeholder="e.g., JavaScript, React, Python, SQL, Project Management"
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              className="skills-input"
              rows="3"
            />
          </div>

          <div className="input-group">
            <label>Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="experience-select"
            >
              <option value="beginner">Beginner (0-1 years)</option>
              <option value="intermediate">Intermediate (1-3 years)</option>
              <option value="advanced">Advanced (3-5 years)</option>
              <option value="expert">Expert (5+ years)</option>
            </select>
          </div>

          <div className="button-group">
            <button
              onClick={handleGenerateRoadmap}
              disabled={loading || !jobTitle.trim()}
              className="generate-btn primary"
            >
              {loading ? (
                <>
                  <div className="btn-spinner"></div>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4m-8 0V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-6 0h6m-6 0l3 3m3-3l-3 3"/>
                  </svg>
                  Generate Career Roadmap
                </>
              )}
            </button>

            <button
              onClick={handleSkillGapAnalysis}
              disabled={loading || !jobTitle.trim()}
              className="generate-btn secondary"
            >
              {loading ? (
                <>
                  <div className="btn-spinner"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                  </svg>
                  Analyze Skill Gap
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {roadmap && (
        <div className="roadmap-results">
          {usingFallback && (
            <div className="roadmap-section">
              <div className="roadmap-content">
                <small style={{ color: '#64748b' }}>Showing offline fallback while AI is unavailable.</small>
              </div>
            </div>
          )}
          {roadmap.roadmap && (
            <div className="roadmap-section">
              <h3>Your Personalized Career Roadmap</h3>
              <div className="roadmap-content">
                <pre>{roadmap.roadmap}</pre>
              </div>
            </div>
          )}

          {roadmap.skillGapAnalysis && (
            <div className="roadmap-section">
              <h3>Skill Gap Analysis</h3>
              <div className="roadmap-content">
                <pre>{roadmap.skillGapAnalysis}</pre>
              </div>
            </div>
          )}

          <div className="roadmap-actions">
            <button
              onClick={() => {
                const content = `Career Roadmap for ${jobTitle}\n\n${roadmap.roadmap || ""
                  }\n\n${roadmap.skillGapAnalysis || ""}`;
                navigator.clipboard.writeText(content);
                alert("Roadmap copied to clipboard!");
              }}
              className="action-btn"
            >
              Copy to Clipboard
            </button>

            <button
              onClick={() => {
                const content = `Career Roadmap for ${jobTitle}\n\n${roadmap.roadmap || ""
                  }\n\n${roadmap.skillGapAnalysis || ""}`;
                const blob = new Blob([content], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${jobTitle.replace(/\s+/g, "_")}_roadmap.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="action-btn"
            >
              Download as Text
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>AI is generating your personalized career roadmap...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerRoadmap;
