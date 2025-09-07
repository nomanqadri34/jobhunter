import React, { useState, useEffect } from "react";
import {
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  ExternalLink,
  Brain,
} from "lucide-react";
import { jobService } from "../../services/jobService";
import { interviewService } from "../../services/interviewService";
import "./JobCard.css";

export const JobCard = ({ job, onSave, onApply }) => {
  const [isGeneratingPrep, setIsGeneratingPrep] = useState(false);
  const [interviewPrep, setInterviewPrep] = useState(null);
  const [showPrep, setShowPrep] = useState(false);

  // Lock background scroll when modal is open to avoid layout shift/jitter
  useEffect(() => {
    const original = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      paddingRight: document.body.style.paddingRight,
      htmlOverflow: document.documentElement.style.overflow,
      htmlScrollBehavior: document.documentElement.style.scrollBehavior,
    };

    if (showPrep) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      const currentScrollY = window.scrollY;
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.scrollBehavior = "auto";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${currentScrollY}px`;
      document.body.style.width = "100%";
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    } else {
      // restore without jump
      const y = parseInt(document.body.style.top || "0", 10);
      document.documentElement.style.overflow = original.htmlOverflow || "";
      document.documentElement.style.scrollBehavior = original.htmlScrollBehavior || "";
      document.body.style.overflow = original.overflow || "";
      document.body.style.position = original.position || "";
      document.body.style.top = original.top || "";
      document.body.style.width = original.width || "";
      document.body.style.paddingRight = original.paddingRight || "";
      if (y) {
        window.scrollTo(0, -y);
      }
    }
    return () => {
      const y = parseInt(document.body.style.top || "0", 10);
      document.documentElement.style.overflow = original.htmlOverflow || "";
      document.documentElement.style.scrollBehavior = original.htmlScrollBehavior || "";
      document.body.style.overflow = original.overflow || "";
      document.body.style.position = original.position || "";
      document.body.style.top = original.top || "";
      document.body.style.width = original.width || "";
      document.body.style.paddingRight = original.paddingRight || "";
      if (y) {
        window.scrollTo(0, -y);
      }
    };
  }, [showPrep]);

  // Debug: Log job data
  console.log("🎯 JobCard received job:", {
    job_id: job.job_id,
    job_title: job.job_title,
    employer_name: job.employer_name,
    job_apply_link: job.job_apply_link,
    fullJob: job,
  });

  const handleSave = async () => {
    try {
      await jobService.saveJob(job.job_id || job._id);
      onSave?.(job.job_id || job._id);
      alert("Job saved successfully!");
    } catch (error) {
      console.warn("Could not save job to database:", error.message);
      // For now, just show a message that the job would be saved
      alert(
        "Job bookmarked! (Note: Database save failed, but you can still access this job)"
      );
    }
  };

  const handleApply = async () => {
    // First, open the job application URL
    const jobUrl = job.job_apply_link || job.applyUrl;
    if (jobUrl) {
      window.open(jobUrl, "_blank");
    } else {
      alert("Job application link not available");
      return;
    }

    // Then try to record the application (optional, don't block if it fails)
    try {
      await jobService.applyJob(job.job_id || job._id);
      onApply?.(job.job_id || job._id);
    } catch (error) {
      // Silently fail - the important part (opening the URL) already happened
      console.warn("Could not record job application:", error.message);
    }
  };

  const normalizeInterviewPrep = (input) => {
    if (!input) return { content: "No interview preparation available." };
    
    // Handle string response from Gemini API
    if (typeof input === "string") {
      return { content: input };
    }
    
    // Handle object response
    const base = input.interviewPrep || input.data || input;
    
    if (typeof base === "string") {
      return { content: base };
    }
    
    // If it's a structured object, convert to readable text
    if (base && typeof base === "object") {
      let content = "";
      
      if (base.technicalQuestions && base.technicalQuestions.length > 0) {
        content += "**Technical Questions:**\n";
        base.technicalQuestions.forEach((q, i) => {
          content += `${i + 1}. ${q}\n`;
        });
        content += "\n";
      }
      
      if (base.behavioralQuestions && base.behavioralQuestions.length > 0) {
        content += "**Behavioral Questions:**\n";
        base.behavioralQuestions.forEach((q, i) => {
          content += `${i + 1}. ${q}\n`;
        });
        content += "\n";
      }
      
      if (base.skillsToHighlight && base.skillsToHighlight.length > 0) {
        content += "**Skills to Highlight:**\n";
        content += base.skillsToHighlight.join(", ") + "\n\n";
      }
      
      if (base.preparationChecklist && base.preparationChecklist.length > 0) {
        content += "**Preparation Checklist:**\n";
        base.preparationChecklist.forEach((item, i) => {
          content += `• ${item}\n`;
        });
        content += "\n";
      }
      
      if (base.questionsToAsk && base.questionsToAsk.length > 0) {
        content += "**Questions to Ask Interviewer:**\n";
        base.questionsToAsk.forEach((q, i) => {
          content += `• ${q}\n`;
        });
      }
      
      return { content: content || "Interview preparation generated successfully." };
    }
    
    return { content: "Interview preparation data received but could not be formatted." };
  };

  const handleInterviewPrep = async () => {
    if (isGeneratingPrep || showPrep) return;
    setIsGeneratingPrep(true);
    try {
      console.log('🤖 Generating interview prep for:', {
        jobTitle: job.job_title || job.title,
        company: job.employer_name || job.company
      });
      
      const prepData = await interviewService.generateInterviewPrep({
        jobTitle: job.job_title || job.title,
        companyName: job.employer_name || job.company,
        jobDescription: job.job_description || job.description,
      });
      
      console.log('📝 Interview prep response:', prepData);
      
      const normalized = normalizeInterviewPrep(prepData.data || prepData);
      setInterviewPrep(normalized);
      setShowPrep(true);
    } catch (error) {
      console.error("❌ Failed to generate interview prep:", error);
      setInterviewPrep({
        content: `**Interview Preparation Failed**\n\nUnable to generate personalized interview prep using AI. This could be due to:\n\n• Gemini API not configured\n• Network connectivity issues\n• Service temporarily unavailable\n\n**General Tips:**\n• Research ${job.employer_name || job.company || 'the company'} thoroughly\n• Review the job description for key requirements\n• Prepare examples using the STAR method\n• Practice common interview questions\n• Prepare thoughtful questions to ask the interviewer`
      });
      setShowPrep(true);
    } finally {
      setIsGeneratingPrep(false);
    }
  };

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return "Salary not specified";

    const format = (amount) => {
      if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(0)}k`;
      }
      return `$${amount}`;
    };

    if (salary.min && salary.max) {
      return `${format(salary.min)} - ${format(salary.max)}`;
    }
    return salary.min
      ? `From ${format(salary.min)}`
      : `Up to ${format(salary.max)}`;
  };

  return (
    <div className="job-card">
      <div className="job-header">
        <div className="job-title-section">
          <h3 className="job-title">
            {job.job_title || job.title || "Job Title Not Available"}
          </h3>
          <p className="job-company">
            {job.employer_name || job.company || "Company Not Available"}
          </p>
        </div>

        {job.aiScore && (
          <div className="ai-score">
            <span className="score">{job.aiScore}%</span>
            <span className="match-label">Match</span>
          </div>
        )}
      </div>

      <div className="job-meta">
        <div className="meta-item">
          <MapPin size={16} />
          <span>
            {job.job_city || job.location || "Location Not Specified"}
          </span>
          {(job.job_is_remote || job.remote) && (
            <span className="remote-badge">Remote</span>
          )}
        </div>

        <div className="meta-item">
          <DollarSign size={16} />
          <span>
            {job.job_salary ||
              formatSalary(job.salary) ||
              "Salary not specified"}
          </span>
        </div>

        <div className="meta-item">
          <Clock size={16} />
          <span>
            {job.job_posted_at_datetime_utc
              ? new Date(job.job_posted_at_datetime_utc).toLocaleDateString()
              : "Date not available"}
          </span>
        </div>
      </div>

      <div className="job-description">
        <p>
          {(
            job.job_description ||
            job.description ||
            "No description available"
          ).substring(0, 200)}
          ...
        </p>
      </div>

      {job.job_required_skills && job.job_required_skills.length > 0 && (
        <div className="job-skills">
          {job.job_required_skills.slice(0, 5).map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
            </span>
          ))}
          {job.job_required_skills.length > 5 && (
            <span className="skill-tag more">
              +{job.job_required_skills.length - 5} more
            </span>
          )}
        </div>
      )}

      {job.aiReason && (
        <div className="ai-reason">
          <p>
            <strong>Why this matches:</strong> {job.aiReason}
          </p>
        </div>
      )}

      {showPrep && interviewPrep && (
        <div className="interview-prep-modal">
          <div className="prep-content">
            <h4>Interview Preparation for {job.job_title || job.title}</h4>
            <div className="prep-text-content">
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '14px', lineHeight: '1.6' }}>
                {interviewPrep.content || 'No interview preparation content available.'}
              </pre>
            </div>
            <button
              onClick={() => setShowPrep(false)}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="job-actions">
        <button
          className="btn-interview"
          onClick={handleInterviewPrep}
          disabled={isGeneratingPrep}
        >
          <Brain size={16} />
          {isGeneratingPrep ? "Generating..." : "Interview Prep"}
        </button>

        <button className="btn-primary" onClick={handleApply}>
          <ExternalLink size={16} />
          Apply Now
        </button>
      </div>
    </div>
  );
};
