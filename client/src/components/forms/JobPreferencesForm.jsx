import React, { useState, useEffect } from "react";
import { MapPin, DollarSign, Briefcase, Clock, Save } from "lucide-react";
import "./JobPreferencesForm.css";

export const JobPreferencesForm = ({ onSave, initialData = {} }) => {
  const [preferences, setPreferences] = useState({
    title: "",
    location: "",
    remote: false,
    salaryMin: "",
    salaryMax: "",
    experienceLevel: "associate",
    employmentType: "fulltime",
    skills: [],
    industries: [],
    companySize: "",
    benefits: [],
    ...initialData,
  });

  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);

  const experienceLevels = [
    { value: "entry", label: "Entry Level (0-2 years)" },
    { value: "associate", label: "Associate (2-4 years)" },
    { value: "mid", label: "Mid Level (4-7 years)" },
    { value: "senior", label: "Senior (7+ years)" },
    { value: "director", label: "Director/Executive" },
  ];

  const employmentTypes = [
    { value: "fulltime", label: "Full-time" },
    { value: "parttime", label: "Part-time" },
    { value: "contract", label: "Contract" },
    { value: "freelance", label: "Freelance" },
    { value: "internship", label: "Internship" },
  ];

  const companySizes = [
    { value: "startup", label: "Startup (1-50)" },
    { value: "small", label: "Small (51-200)" },
    { value: "medium", label: "Medium (201-1000)" },
    { value: "large", label: "Large (1000+)" },
  ];

  const commonSkills = [
    "JavaScript",
    "Python",
    "React",
    "Node.js",
    "Java",
    "C++",
    "SQL",
    "AWS",
    "Docker",
    "Kubernetes",
    "Git",
    "MongoDB",
    "PostgreSQL",
    "Machine Learning",
    "Data Analysis",
    "UI/UX Design",
    "Project Management",
  ];

  const commonBenefits = [
    "Health Insurance",
    "Dental Insurance",
    "Vision Insurance",
    "401k Matching",
    "Flexible Hours",
    "Remote Work",
    "Paid Time Off",
    "Professional Development",
    "Stock Options",
    "Gym Membership",
  ];

  const handleInputChange = (field, value) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addSkill = (skill) => {
    if (skill && !preferences.skills.includes(skill)) {
      setPreferences((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
    setSkillInput("");
  };

  const removeSkill = (skillToRemove) => {
    setPreferences((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const toggleBenefit = (benefit) => {
    setPreferences((prev) => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter((b) => b !== benefit)
        : [...prev.benefits, benefit],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(preferences);
    } catch (error) {
      console.error("Failed to save preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="job-preferences-form">
      <div className="form-header">
        <h2>Job Preferences</h2>
        <p>Set your preferences to get better job recommendations</p>
      </div>

      <div className="form-sections">
        {/* Basic Information */}
        <div className="form-section">
          <h3>
            <Briefcase size={20} /> Job Details
          </h3>

          <div className="form-group">
            <label>Job Title</label>
            <input
              type="text"
              placeholder="e.g., Software Developer, Data Scientist"
              value={preferences.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Experience Level</label>
            <select
              value={preferences.experienceLevel}
              onChange={(e) =>
                handleInputChange("experienceLevel", e.target.value)
              }
            >
              {experienceLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Employment Type</label>
            <select
              value={preferences.employmentType}
              onChange={(e) =>
                handleInputChange("employmentType", e.target.value)
              }
            >
              {employmentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location & Remote */}
        <div className="form-section">
          <h3>
            <MapPin size={20} /> Location
          </h3>

          <div className="form-group">
            <label>Preferred Location</label>
            <input
              type="text"
              placeholder="e.g., San Francisco, CA or Remote"
              value={preferences.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={preferences.remote}
                onChange={(e) => handleInputChange("remote", e.target.checked)}
              />
              <span>Open to remote work</span>
            </label>
          </div>
        </div>

        {/* Salary */}
        <div className="form-section">
          <h3>
            <DollarSign size={20} /> Salary Expectations
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label>Minimum Salary</label>
              <input
                type="number"
                placeholder="50000"
                value={preferences.salaryMin}
                onChange={(e) => handleInputChange("salaryMin", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Maximum Salary</label>
              <input
                type="number"
                placeholder="100000"
                value={preferences.salaryMax}
                onChange={(e) => handleInputChange("salaryMax", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="form-section">
          <h3>Skills & Technologies</h3>

          <div className="form-group">
            <label>Add Skills</label>
            <div className="skill-input">
              <input
                type="text"
                placeholder="Type a skill and press Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(skillInput);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addSkill(skillInput)}
                disabled={!skillInput}
              >
                Add
              </button>
            </div>
          </div>

          <div className="common-skills">
            <p>Common skills:</p>
            <div className="skill-tags">
              {commonSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  className={`skill-tag ${
                    preferences.skills.includes(skill) ? "selected" : ""
                  }`}
                  onClick={() => addSkill(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {preferences.skills.length > 0 && (
            <div className="selected-skills">
              <p>Selected skills:</p>
              <div className="skill-tags">
                {preferences.skills.map((skill) => (
                  <span key={skill} className="skill-tag selected">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="remove-skill"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Company Preferences */}
        <div className="form-section">
          <h3>Company Preferences</h3>

          <div className="form-group">
            <label>Company Size</label>
            <select
              value={preferences.companySize}
              onChange={(e) => handleInputChange("companySize", e.target.value)}
            >
              <option value="">No preference</option>
              {companySizes.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Benefits */}
        <div className="form-section">
          <h3>Desired Benefits</h3>

          <div className="benefits-grid">
            {commonBenefits.map((benefit) => (
              <label key={benefit} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={preferences.benefits.includes(benefit)}
                  onChange={() => toggleBenefit(benefit)}
                />
                <span>{benefit}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          <Save size={20} />
          {loading ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </form>
  );
};
