import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  // External job data
  externalId: { type: String, required: true, unique: true },
  source: { type: String, required: true }, // 'rapidapi', 'linkedin', etc.
  
  // Job details
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  requirements: [String],
  benefits: [String],
  
  // Compensation
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' },
    period: { type: String, enum: ['hourly', 'monthly', 'yearly'], default: 'yearly' }
  },
  
  // Job meta
  employmentType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship'] },
  experienceLevel: { type: String, enum: ['entry', 'associate', 'mid', 'senior', 'director'] },
  remote: { type: Boolean, default: false },
  skills: [String],
  
  // Application
  applyUrl: { type: String, required: true },
  applicationDeadline: Date,
  
  // Metadata
  postedDate: { type: Date, required: true },
  scrapedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  
  // AI scoring
  aiScore: Number,
  aiReason: String,
  
  createdAt: { type: Date, default: Date.now }
});

jobSchema.index({ title: 'text', company: 'text', description: 'text' });
jobSchema.index({ location: 1, remote: 1 });
jobSchema.index({ postedDate: -1 });

export default mongoose.model('Job', jobSchema);