import React, { useState, useEffect } from "react";
import { useDescope, useSession, useUser } from "@descope/react-sdk";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Sidebar } from "./components/common/Sidebar";
import { Navbar } from "./components/common/Navbar";
import JobPreferencesForm from "./components/forms/JobPreferencesForm";
import ResumeUpload from "./components/resume/ResumeUpload";
import JobCard from "./components/dashboard/JobCard";
import InterviewPrep from "./components/interview/InterviewPrep";
import InterviewDetails from "./components/interview/InterviewDetails";
import AdvancedJobSearch from "./components/jobs/AdvancedJobSearch";
import CareerRoadmap from "./components/career/CareerRoadmap";
import OAuthConnections from "./components/oauth/OAuthConnections";
import "./App.css"; // Ensure App.css is imported for general styles

const Dashboard = () => {
  const { isAuthenticated, isSessionLoading } = useSession();
  const { user, isUserLoading } = useUser();
  const { logout } = useDescope();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [showSidebar, setShowSidebar] = useState(false);

  const { sessionToken } = useSession();
  const [jobPreferences, setJobPreferences] = useState({
    jobTitle: "",
    location: "",
    experienceLevel: "",
    jobType: "",
    skills: "",
  });
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobSearchError, setJobSearchError] = useState(null);
  const [reminderMessage, setReminderMessage] = useState(null);
  const [interviewJobTitle, setInterviewJobTitle] = useState("");
  const [interviewExperience, setInterviewExperience] = useState("");
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [loadingInterviewQuestions, setLoadingInterviewQuestions] =
    useState(false);
  const [interviewError, setInterviewError] = useState(null);
  const [slackAlertMessage, setSlackAlertMessage] = useState("");
  const [slackResponse, setSlackResponse] = useState(null);
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [whatsappResponse, setWhatsappResponse] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [interviewRoadmap, setInterviewRoadmap] = useState("");
  const [youtubeVideos, setYoutubeVideos] = useState([]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setShowSidebar(false); // Close sidebar on tab change
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "interviewJobTitle") {
      setInterviewJobTitle(value);
    } else if (name === "interviewExperience") {
      setInterviewExperience(value);
    } else {
      setJobPreferences((prevPrefs) => ({
        ...prevPrefs,
        [name]: value,
      }));
    }
  };

  const fetchJobs = async () => {
    setLoadingJobs(true);
    setJobSearchError(null);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/jobs/search",
        jobPreferences,
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobSearchError("Failed to fetch jobs. Please try again.");
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchJobsWithPreferences = async (preferences) => {
    setLoadingJobs(true);
    setJobSearchError(null);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/jobs/search",
        preferences,
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobSearchError("Failed to fetch jobs. Please try again.");
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Job Preferences Submitted:", jobPreferences);
    await fetchJobs();
  };

  const handleGenerateInterviewQuestions = async () => {
    setLoadingInterviewQuestions(true);
    setInterviewError(null);
    setInterviewRoadmap("");
    setYoutubeVideos([]);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/interview/prepare",
        {
          jobTitle: interviewJobTitle,
          experience: interviewExperience,
          skills: jobPreferences.skills,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );
      setInterviewRoadmap(response.data.roadmap);
      setYoutubeVideos(response.data.youtubeVideos || []);
    } catch (error) {
      console.error("Error generating interview preparation:", error);
      setInterviewError(
        "Failed to generate interview preparation. Please try again."
      );
    } finally {
      setLoadingInterviewQuestions(false);
    }
  };

  const handleSendSlackAlert = async () => {
    setSlackResponse(null);
    if (!slackAlertMessage) {
      alert("Please enter a message for the Slack alert.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/slack/alert",
        { message: slackAlertMessage },
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );
      setSlackResponse({ success: true, message: response.data.message });
      setSlackAlertMessage(""); // Clear message after sending
    } catch (error) {
      console.error("Error sending Slack alert:", error);
      setSlackResponse({
        success: false,
        message: error.response?.data?.message || "Failed to send Slack alert.",
      });
    }
  };

  const handleSendWhatsAppAlert = async () => {
    setWhatsappResponse(null);
    if (!whatsappMessage || !whatsappPhone) {
      alert("Please enter both message and phone number for WhatsApp alert.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/whatsapp/alert",
        { message: whatsappMessage, phoneNumber: whatsappPhone },
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );
      setWhatsappResponse({ success: true, message: response.data.message });
      setWhatsappMessage("");
      setWhatsappPhone("");
    } catch (error) {
      console.error("Error sending WhatsApp alert:", error);
      setWhatsappResponse({
        success: false,
        message:
          error.response?.data?.message || "Failed to send WhatsApp alert.",
      });
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingResume(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/resume/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setResumeData(response.data);

      // Auto-fill preferences and trigger job search
      const suggestions = response.data.suggested_preferences;
      if (suggestions) {
        const autoPreferences = {
          jobTitle: suggestions.jobTitle || "Software Developer",
          location: "Remote",
          experienceLevel: suggestions.experienceLevel || "associate",
          jobType: "full-time",
          skills: suggestions.skills || "",
        };
        setJobPreferences(autoPreferences);

        // Automatically search for jobs based on resume
        fetchJobsWithPreferences(autoPreferences);
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload resume";
      alert(`Resume upload failed: ${errorMessage}`);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSetReminder = async (job) => {
    setReminderMessage(null);
    const reminderDate = prompt(
      "Enter reminder date and time (YYYY-MM-DDTHH:MM:SS, e.g., 2024-12-25T10:00:00):"
    );
    if (!reminderDate) {
      return; // User cancelled
    }

    try {
      const eventStart = new Date(reminderDate);
      const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000); // 1 hour duration

      const response = await axios.post(
        "http://localhost:5000/api/calendar/event",
        {
          summary: `Apply for ${job.title} at ${job.company}`,
          description: `Job Link: [Link to job if available]\nLocation: ${job.location}\nDescription: ${job.description}`,
          start: eventStart.toISOString(),
          end: eventEnd.toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );
      setReminderMessage(`Reminder set: ${response.data.htmlLink}`);
    } catch (error) {
      console.error("Error setting reminder:", error);
      setReminderMessage(
        "Failed to set reminder. Please ensure your Google account is connected."
      );
    }
  };

  // Optionally fetch jobs on initial load if preferences are already set
  useEffect(() => {
    if (isAuthenticated && sessionToken) {
      // You might want to load saved preferences here and then call fetchJobs
      // For now, we'll just fetch if there are any default preferences or after submission
    }
  }, [isAuthenticated, sessionToken]);

  if (isSessionLoading || isUserLoading) {
    return <div>Loading user session...</div>;
  }

  if (!isAuthenticated) {
    navigate("/"); // Redirect to login if not authenticated
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        resumeData={resumeData}
        showSidebar={showSidebar}
        onCloseSidebar={closeSidebar}
      />
      <div className="main-content">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="content-area">
          {activeTab === "dashboard" && (
            <>
              <h1>
                Welcome to your Job Hunting Dashboard,{" "}
                {user?.name || user?.email}!
              </h1>
              <p>
                This is where you will manage your job preferences, view job
                listings, and get interview preparation.
              </p>
              <button onClick={handleLogout}>Logout</button>
              {reminderMessage && (
                <p
                  style={{
                    marginTop: "10px",
                    color: reminderMessage.includes("Failed") ? "red" : "green",
                  }}
                >
                  {reminderMessage}
                </p>
              )}

              <ResumeUpload
                handleResumeUpload={handleResumeUpload}
                uploadingResume={uploadingResume}
                resumeData={resumeData}
                jobPreferences={jobPreferences}
              />

              {!resumeData && (
                <JobPreferencesForm
                  jobPreferences={jobPreferences}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                />
              )}

              <div
                style={{
                  marginTop: "30px",
                  borderTop: "1px solid #eee",
                  paddingTop: "20px",
                }}
              >
                <h2>Job Listings</h2>
                {loadingJobs && <p>Loading jobs...</p>}
                {jobSearchError && (
                  <p style={{ color: "red" }}>{jobSearchError}</p>
                )}
                {jobs.length === 0 && !loadingJobs && !jobSearchError && (
                  <p>
                    No jobs found. Adjust your preferences and search again.
                  </p>
                )}
                {jobs.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(300px, 1fr))",
                      gap: "20px",
                    }}
                  >
                    {jobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        handleSetReminder={handleSetReminder}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "jobs" && (
            <div className="job-feed-content">
              <h2>Job Feed</h2>
              <JobPreferencesForm
                jobPreferences={jobPreferences}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
              />
              {loadingJobs && <p>Loading jobs...</p>}
              {jobSearchError && (
                <p style={{ color: "red" }}>{jobSearchError}</p>
              )}
              {jobs.length === 0 && !loadingJobs && !jobSearchError && (
                <p>No jobs found. Adjust your preferences and search again.</p>
              )}
              {jobs.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "20px",
                    marginTop: "20px",
                  }}
                >
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      handleSetReminder={handleSetReminder}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "advanced-search" && (
            <AdvancedJobSearch
              sessionToken={sessionToken}
              setJobs={setJobs}
              setLoadingJobs={setLoadingJobs}
              setJobSearchError={setJobSearchError}
              handleSetReminder={handleSetReminder}
            />
          )}

          {activeTab === "applied" && (
            <div>
              <h2>Applied Jobs</h2>
              <p>Content for Applied Jobs will go here.</p>
            </div>
          )}

          {activeTab === "calendar" && (
            <div>
              <h2>Calendar</h2>
              <p>Content for Calendar will go here.</p>
            </div>
          )}

          {activeTab === "interview" && (
            <InterviewPrep
              interviewJobTitle={interviewJobTitle}
              setInterviewJobTitle={setInterviewJobTitle}
              interviewExperience={interviewExperience}
              setInterviewExperience={setInterviewExperience}
              jobPreferencesSkills={jobPreferences.skills}
              handleGenerateInterviewQuestions={
                handleGenerateInterviewQuestions
              }
              loadingInterviewQuestions={loadingInterviewQuestions}
              interviewError={interviewError}
              interviewRoadmap={interviewRoadmap}
              youtubeVideos={youtubeVideos}
            />
          )}

          {activeTab === "interview-details" && (
            <InterviewDetails
              slackAlertMessage={slackAlertMessage}
              setSlackAlertMessage={setSlackAlertMessage}
              handleSendSlackAlert={handleSendSlackAlert}
              slackResponse={slackResponse}
              whatsappMessage={whatsappMessage}
              setWhatsappMessage={setWhatsappMessage}
              whatsappPhone={whatsappPhone}
              setWhatsappPhone={setWhatsappPhone}
              handleSendWhatsAppAlert={handleSendWhatsAppAlert}
              whatsappResponse={whatsappResponse}
            />
          )}

          {activeTab === "career-roadmap" && (
            <CareerRoadmap sessionToken={sessionToken} />
          )}

          {activeTab === "resume" && (
            <ResumeUpload
              handleResumeUpload={handleResumeUpload}
              uploadingResume={uploadingResume}
              resumeData={resumeData}
              jobPreferences={jobPreferences}
            />
          )}

          {activeTab === "profile" && (
            <div>
              <h2>Profile</h2>
              <p>Content for Profile will go here.</p>
            </div>
          )}

          {activeTab === "settings" && (
            <OAuthConnections sessionToken={sessionToken} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
