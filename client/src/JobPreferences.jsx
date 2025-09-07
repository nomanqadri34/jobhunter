import React from 'react';

const JobPreferences = ({ preferences, onChange, onSubmit, loading }) => {
  return (
    <div style={{ 
      marginTop: 'clamp(1rem, 4vw, 2rem)', 
      borderTop: '1px solid #eee', 
      paddingTop: 'clamp(1rem, 3vw, 1.5rem)',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <h2 style={{ 
        fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
        marginBottom: 'clamp(1rem, 2vw, 1.5rem)'
      }}>Set Your Job Preferences</h2>
      <form
        onSubmit={onSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(0.75rem, 2vw, 1rem)',
          maxWidth: '500px',
          width: '100%',
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
              padding: 'clamp(0.5rem, 1.5vw, 0.75rem)',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              boxSizing: 'border-box',
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
              padding: 'clamp(0.5rem, 1.5vw, 0.75rem)',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              boxSizing: 'border-box',
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
              padding: 'clamp(0.5rem, 1.5vw, 0.75rem)',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              boxSizing: 'border-box',
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
              padding: 'clamp(0.5rem, 1.5vw, 0.75rem)',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              boxSizing: 'border-box',
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
              padding: 'clamp(0.5rem, 1.5vw, 0.75rem)',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              boxSizing: 'border-box',
            }}
            placeholder="React, JavaScript, Node.js"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 'clamp(0.8rem, 2vw, 1rem)',
            minWidth: 'fit-content',
            whiteSpace: 'nowrap',
            marginTop: 'clamp(0.5rem, 2vw, 1rem)',
          }}
        >
          {loading ? 'Searching Jobs...' : 'Search Jobs'}
        </button>
      </form>
    </div>
  );
};

export default JobPreferences;