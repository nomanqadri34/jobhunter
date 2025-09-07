import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  descopeId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar: { type: String },
  
  // OAuth connections
  googleConnected: { type: Boolean, default: false },
  linkedinConnected: { type: Boolean, default: false },
  googleTokens: {
    accessToken: String,
    refreshToken: String,
    expiryDate: Date
  },
  linkedinTokens: {
    accessToken: String,
    refreshToken: String,
    expiryDate: Date
  },
  
  // Profile
  phone: String,
  location: String,
  timezone: { type: String, default: 'UTC' },
  
  // Preferences
  jobPreferences: {
    title: String,
    location: String,
    remote: { type: Boolean, default: false },
    salaryMin: Number,
    salaryMax: Number,
    skills: [String],
    experienceLevel: { type: String, enum: ['entry', 'associate', 'mid', 'senior', 'director'] }
  },
  
  // Activity
  appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);