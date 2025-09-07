import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  
  // Parsed content
  extractedText: { type: String },
  skills: [String],
  experience: {
    level: { type: String, enum: ['entry', 'associate', 'mid', 'senior', 'director'] },
    years: Number,
    positions: [{
      title: String,
      company: String,
      duration: String,
      description: String
    }]
  },
  
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  
  // AI Analysis
  aiSummary: String,
  suggestedJobTitles: [String],
  matchingKeywords: [String],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Resume', resumeSchema);