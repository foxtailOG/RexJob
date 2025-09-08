import type { AnalysisResult } from '../types';

// Local resume analysis without API dependency
export const analyzeResumeForATS = async (resumeText: string): Promise<AnalysisResult> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const text = resumeText.toLowerCase();
  const words = text.split(/\s+/);
  const wordCount = words.length;
  
  // Calculate ATS score based on various factors
  let score = 50; // Base score
  
  // Check for contact information
  if (text.includes('@') && (text.includes('.com') || text.includes('.org'))) score += 5;
  if (/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(text)) score += 5;
  
  // Check for professional sections
  if (text.includes('experience') || text.includes('work history')) score += 8;
  if (text.includes('education') || text.includes('degree')) score += 6;
  if (text.includes('skills') || text.includes('technical')) score += 7;
  
  // Check for action verbs
  const actionVerbs = ['managed', 'developed', 'created', 'implemented', 'designed', 'led', 'improved', 'achieved', 'delivered', 'collaborated', 'analyzed', 'optimized'];
  const foundActionVerbs = actionVerbs.filter(verb => text.includes(verb));
  score += Math.min(foundActionVerbs.length * 2, 10);
  
  // Check for quantifiable achievements
  const hasNumbers = /\b\d+%|\b\d+\s*(million|thousand|k\b)|\$\d+|\b\d+\s*years?|\b\d+\s*months?/i.test(text);
  if (hasNumbers) score += 8;
  
  // Check for technical keywords
  const techKeywords = ['javascript', 'python', 'react', 'node', 'sql', 'aws', 'docker', 'git', 'agile', 'scrum', 'api', 'database'];
  const foundTechKeywords = techKeywords.filter(keyword => text.includes(keyword));
  score += Math.min(foundTechKeywords.length * 1.5, 8);
  
  // Penalize for common issues
  if (wordCount < 200) score -= 10; // Too short
  if (wordCount > 1000) score -= 5; // Too long
  if (text.includes('responsible for')) score -= 3; // Weak language
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  // Generate strengths based on analysis
  const strengths = [];
  if (foundActionVerbs.length > 3) strengths.push("Strong use of action verbs throughout the resume");
  if (hasNumbers) strengths.push("Includes quantifiable achievements and metrics");
  if (foundTechKeywords.length > 2) strengths.push("Good technical keyword coverage");
  if (text.includes('education')) strengths.push("Clear educational background section");
  if (wordCount >= 300 && wordCount <= 800) strengths.push("Appropriate resume length and content density");
  
  // Default strengths if none found
  if (strengths.length === 0) {
    strengths.push("Resume contains relevant professional information");
    strengths.push("Basic structure and formatting appear appropriate");
  }
  
  // Generate recommendations
  const recommendations = [];
  
  if (foundActionVerbs.length < 3) {
    recommendations.push({
      area: "Action Verbs",
      suggestion: "Use more strong action verbs like 'developed', 'managed', 'implemented', 'optimized' to start your bullet points"
    });
  }
  
  if (!hasNumbers) {
    recommendations.push({
      area: "Quantifiable Results",
      suggestion: "Add specific numbers, percentages, or metrics to demonstrate your impact (e.g., 'Increased sales by 25%')"
    });
  }
  
  if (foundTechKeywords.length < 3) {
    recommendations.push({
      area: "Keywords",
      suggestion: "Include more industry-specific keywords and technical skills relevant to your target positions"
    });
  }
  
  if (wordCount < 200) {
    recommendations.push({
      area: "Content Length",
      suggestion: "Expand your resume with more detailed descriptions of your experience and achievements"
    });
  }
  
  if (text.includes('responsible for')) {
    recommendations.push({
      area: "Language Strength",
      suggestion: "Replace passive phrases like 'responsible for' with active accomplishment statements"
    });
  }
  
  if (!text.includes('@')) {
    recommendations.push({
      area: "Contact Information",
      suggestion: "Ensure your email address and phone number are clearly visible at the top of your resume"
    });
  }
  
  // Default recommendations if none generated
  if (recommendations.length === 0) {
    recommendations.push({
      area: "Formatting",
      suggestion: "Ensure consistent formatting throughout your resume with clear section headers"
    });
    recommendations.push({
      area: "Customization",
      suggestion: "Tailor your resume for each job application by matching relevant keywords from job descriptions"
    });
  }
  
  // Generate job suggestions based on content analysis
  const suggestedJobs = [];
  
  if (foundTechKeywords.includes('javascript') || foundTechKeywords.includes('react')) {
    suggestedJobs.push({
      title: "Frontend Developer",
      reason: "Strong frontend technology skills detected in your resume"
    });
  }
  
  if (foundTechKeywords.includes('python') || foundTechKeywords.includes('sql')) {
    suggestedJobs.push({
      title: "Data Analyst",
      reason: "Data analysis and programming skills align with this role"
    });
  }
  
  if (text.includes('manage') || text.includes('lead') || text.includes('team')) {
    suggestedJobs.push({
      title: "Project Manager",
      reason: "Leadership and management experience evident in your background"
    });
  }
  
  if (foundTechKeywords.includes('aws') || foundTechKeywords.includes('docker')) {
    suggestedJobs.push({
      title: "DevOps Engineer",
      reason: "Cloud and containerization technologies match DevOps requirements"
    });
  }
  
  if (text.includes('marketing') || text.includes('social media')) {
    suggestedJobs.push({
      title: "Digital Marketing Specialist",
      reason: "Marketing experience and digital skills are relevant for this position"
    });
  }
  
  // Fill with generic suggestions if needed
  while (suggestedJobs.length < 5) {
    const genericJobs = [
      { title: "Business Analyst", reason: "Analytical skills and business acumen from your experience" },
      { title: "Operations Coordinator", reason: "Organizational and coordination skills demonstrated" },
      { title: "Customer Success Manager", reason: "Communication and relationship management capabilities" },
      { title: "Technical Writer", reason: "Communication skills and technical knowledge combination" },
      { title: "Quality Assurance Specialist", reason: "Attention to detail and systematic approach evident" }
    ];
    
    for (const job of genericJobs) {
      if (!suggestedJobs.find(j => j.title === job.title) && suggestedJobs.length < 5) {
        suggestedJobs.push(job);
      }
    }
    break;
  }
  
  return {
    atsScore: score,
    strengths,
    recommendations,
    suggestedJobs: suggestedJobs.slice(0, 5)
  };
};