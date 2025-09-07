import React from 'react';

const JobPreferences = ({ preferences, onChange, onSubmit, loading }) => {
  return (
    <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
      <h2>Set Your Job Preferences</h2>
      <form
        onSubmit={onSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          maxWidth: '500px',
        }}
      >
        <div>
          <label htmlFor="jobTitle" style={{ display: 'block', marginBottom: '5px' }}>
            Job Title:
          </label>
          <input
            type="text"
            id="jobTitle"
            name="jobTitle"
            value={preferences.jobTitle}
            onChange={onChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
            required
          />
        </div>
        
        <div>
          <label htmlFor="location" style={{ display: 'block', marginBottom: '5px' }}>
            Location:
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={preferences.location}
            onChange={onChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>
        
        <div>
          <label htmlFor="experienceLevel" style={{ display: 'block', marginBottom: '5px' }}>
            Experience Level:
          </label>
          <select
            id="experienceLevel"
            name="experienceLevel"
            value={preferences.experienceLevel}
            onChange={onChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            <option value="">Select...</option>
            <option value="entry">Entry Level</option>
            <option value="associate">Associate</option>
            <option value="mid">Mid-Senior Level</option>
            <option value="director">Director</option>
            <option value="executive">Executive</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="jobType" style={{ display: 'block', marginBottom: '5px' }}>
            Job Type:
          </label>
          <select
            id="jobType"
            name="jobType"
            value={preferences.jobType}
            onChange={onChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            <option value="">Select...</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="temporary">Temporary</option>
            <option value="internship">Internship</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="skills" style={{ display: 'block', marginBottom: '5px' }}>
            Skills (comma-separated):
          </label>
          <input
            type="text"
            id="skills"
            name="skills"
            value={preferences.skills}
            onChange={onChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
            placeholder="React, JavaScript, Node.js"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
          }}
        >
          {loading ? 'Searching Jobs...' : 'Search Jobs'}
        </button>
      </form>
    </div>
  );
};

export default JobPreferences;