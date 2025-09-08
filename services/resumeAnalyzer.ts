import type { AnalysisResult } from '../types';

interface KeywordCategory {
  name: string;
  keywords: string[];
  weight: number;
}

const KEYWORD_CATEGORIES: KeywordCategory[] = [
  {
    name: 'Technical Skills',
    keywords: [
      'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js', 'typescript',
      'html', 'css', 'sql', 'mongodb', 'postgresql', 'mysql', 'git', 'docker', 'kubernetes',
      'aws', 'azure', 'gcp', 'linux', 'windows', 'macos', 'agile', 'scrum', 'devops',
      'ci/cd', 'jenkins', 'terraform', 'ansible', 'microservices', 'api', 'rest', 'graphql'
    ],
    weight: 0.3
  },
  {
    name: 'Action Verbs',
    keywords: [
      'achieved', 'managed', 'led', 'developed', 'created', 'implemented', 'designed',
      'optimized', 'improved', 'increased', 'reduced', 'streamlined', 'collaborated',
      'coordinated', 'supervised', 'trained', 'mentored', 'analyzed', 'researched',
      'established', 'launched', 'delivered', 'executed', 'facilitated', 'negotiated'
    ],
    weight: 0.25
  },
  {
    name: 'Soft Skills',
    keywords: [
      'leadership', 'communication', 'teamwork', 'problem-solving', 'analytical',
      'creative', 'adaptable', 'organized', 'detail-oriented', 'time management',
      'project management', 'critical thinking', 'collaboration', 'innovation',
      'strategic planning', 'customer service', 'presentation', 'negotiation'
    ],
    weight: 0.2
  },
  {
    name: 'Industry Terms',
    keywords: [
      'software development', 'web development', 'mobile development', 'data analysis',
      'machine learning', 'artificial intelligence', 'cybersecurity', 'cloud computing',
      'digital marketing', 'product management', 'user experience', 'user interface',
      'quality assurance', 'business analysis', 'project coordination', 'sales',
      'marketing', 'finance', 'accounting', 'human resources', 'operations'
    ],
    weight: 0.25
  }
];

const COMMON_JOB_ROLES = [
  {
    title: 'Software Engineer',
    keywords: ['javascript', 'python', 'java', 'react', 'node.js', 'git', 'api', 'software development'],
    requiredCount: 3
  },
  {
    title: 'Frontend Developer',
    keywords: ['javascript', 'react', 'angular', 'vue', 'html', 'css', 'typescript', 'web development'],
    requiredCount: 4
  },
  {
    title: 'Backend Developer',
    keywords: ['python', 'java', 'node.js', 'sql', 'api', 'microservices', 'database'],
    requiredCount: 3
  },
  {
    title: 'Full Stack Developer',
    keywords: ['javascript', 'react', 'node.js', 'sql', 'html', 'css', 'api', 'git'],
    requiredCount: 4
  },
  {
    title: 'Data Analyst',
    keywords: ['python', 'sql', 'data analysis', 'excel', 'tableau', 'power bi', 'statistics'],
    requiredCount: 3
  },
  {
    title: 'DevOps Engineer',
    keywords: ['docker', 'kubernetes', 'aws', 'azure', 'ci/cd', 'jenkins', 'terraform', 'linux'],
    requiredCount: 3
  },
  {
    title: 'Product Manager',
    keywords: ['product management', 'agile', 'scrum', 'project management', 'analytics', 'strategy'],
    requiredCount: 3
  },
  {
    title: 'UX/UI Designer',
    keywords: ['user experience', 'user interface', 'figma', 'sketch', 'adobe', 'design', 'prototyping'],
    requiredCount: 3
  },
  {
    title: 'Digital Marketing Specialist',
    keywords: ['digital marketing', 'seo', 'sem', 'social media', 'analytics', 'content marketing'],
    requiredCount: 3
  },
  {
    title: 'Business Analyst',
    keywords: ['business analysis', 'requirements', 'process improvement', 'stakeholder', 'documentation'],
    requiredCount: 3
  }
];

export class ResumeAnalyzer {
  private resumeText: string;
  private normalizedText: string;
  private words: string[];
  private lines: string[];

  constructor(resumeText: string) {
    this.resumeText = resumeText;
    this.normalizedText = resumeText.toLowerCase().replace(/[^\w\s]/g, ' ');
    this.words = this.normalizedText.split(/\s+/).filter(word => word.length > 0);
    this.lines = resumeText.split('\n').filter(line => line.trim().length > 0);
  }

  analyze(): AnalysisResult {
    const keywordScore = this.calculateKeywordScore();
    const formatScore = this.calculateFormatScore();
    const contentScore = this.calculateContentScore();
    const lengthScore = this.calculateLengthScore();

    const atsScore = Math.round(
      keywordScore * 0.4 + 
      formatScore * 0.25 + 
      contentScore * 0.25 + 
      lengthScore * 0.1
    );

    return {
      atsScore: Math.min(100, Math.max(0, atsScore)),
      strengths: this.identifyStrengths(),
      recommendations: this.generateRecommendations(),
      suggestedJobs: this.suggestJobs()
    };
  }

  private calculateKeywordScore(): number {
    let totalScore = 0;
    let totalWeight = 0;

    for (const category of KEYWORD_CATEGORIES) {
      const foundKeywords = category.keywords.filter(keyword => 
        this.normalizedText.includes(keyword)
      );
      const categoryScore = Math.min(100, (foundKeywords.length / category.keywords.length) * 100);
      totalScore += categoryScore * category.weight;
      totalWeight += category.weight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  private calculateFormatScore(): number {
    let score = 100;
    const issues = [];

    // Check for email
    if (!/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(this.resumeText)) {
      score -= 15;
      issues.push('Missing email address');
    }

    // Check for phone number
    if (!/(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/.test(this.resumeText)) {
      score -= 10;
      issues.push('Missing phone number');
    }

    // Check for dates (various formats)
    const datePatterns = [
      /\b(19|20)\d{2}\b/, // 4-digit years
      /\b(0?[1-9]|1[0-2])\/(19|20)\d{2}\b/, // MM/YYYY
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(19|20)\d{2}\b/i // Month YYYY
    ];
    
    const hasDateFormat = datePatterns.some(pattern => pattern.test(this.resumeText));
    if (!hasDateFormat) {
      score -= 10;
      issues.push('Missing or inconsistent date formatting');
    }

    // Check for bullet points or structured formatting
    const hasBullets = /[•·▪▫‣⁃]/.test(this.resumeText) || /^\s*[-*+]\s/m.test(this.resumeText);
    if (!hasBullets) {
      score -= 10;
      issues.push('Consider using bullet points for better readability');
    }

    return Math.max(0, score);
  }

  private calculateContentScore(): number {
    let score = 0;

    // Check for quantifiable achievements
    const quantifiers = /\b(\d+%|\d+\+|increased|decreased|improved|reduced|saved|\$\d+|[0-9,]+)\b/gi;
    const quantifiableAchievements = this.resumeText.match(quantifiers);
    if (quantifiableAchievements && quantifiableAchievements.length >= 3) {
      score += 30;
    } else if (quantifiableAchievements && quantifiableAchievements.length >= 1) {
      score += 15;
    }

    // Check for action verbs
    const actionVerbsFound = KEYWORD_CATEGORIES.find(cat => cat.name === 'Action Verbs')?.keywords
      .filter(verb => this.normalizedText.includes(verb)).length || 0;
    score += Math.min(25, actionVerbsFound * 2);

    // Check for professional summary/objective
    const hasSummary = /\b(summary|objective|profile|about)\b/i.test(this.resumeText);
    if (hasSummary) score += 15;

    // Check for skills section
    const hasSkills = /\b(skills|technologies|competencies|expertise)\b/i.test(this.resumeText);
    if (hasSkills) score += 15;

    // Check for education section
    const hasEducation = /\b(education|degree|university|college|bachelor|master|phd)\b/i.test(this.resumeText);
    if (hasEducation) score += 15;

    return Math.min(100, score);
  }

  private calculateLengthScore(): number {
    const wordCount = this.words.length;
    
    if (wordCount >= 300 && wordCount <= 800) {
      return 100;
    } else if (wordCount >= 200 && wordCount < 300) {
      return 80;
    } else if (wordCount > 800 && wordCount <= 1000) {
      return 80;
    } else if (wordCount >= 150 && wordCount < 200) {
      return 60;
    } else if (wordCount > 1000 && wordCount <= 1200) {
      return 60;
    } else {
      return 40;
    }
  }

  private identifyStrengths(): string[] {
    const strengths: string[] = [];

    // Check for quantifiable achievements
    const quantifiers = this.resumeText.match(/\b(\d+%|\d+\+|increased|decreased|improved|reduced|saved|\$\d+)\b/gi);
    if (quantifiers && quantifiers.length >= 2) {
      strengths.push('Includes quantifiable achievements and metrics');
    }

    // Check for action verbs
    const actionVerbsFound = KEYWORD_CATEGORIES.find(cat => cat.name === 'Action Verbs')?.keywords
      .filter(verb => this.normalizedText.includes(verb)).length || 0;
    if (actionVerbsFound >= 5) {
      strengths.push('Strong use of action verbs throughout');
    }

    // Check for technical skills
    const techSkillsFound = KEYWORD_CATEGORIES.find(cat => cat.name === 'Technical Skills')?.keywords
      .filter(skill => this.normalizedText.includes(skill)).length || 0;
    if (techSkillsFound >= 5) {
      strengths.push('Comprehensive technical skills listed');
    }

    // Check for professional formatting
    const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(this.resumeText);
    const hasPhone = /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/.test(this.resumeText);
    if (hasEmail && hasPhone) {
      strengths.push('Complete contact information provided');
    }

    // Check for structured content
    const hasBullets = /[•·▪▫‣⁃]/.test(this.resumeText) || /^\s*[-*+]\s/m.test(this.resumeText);
    if (hasBullets) {
      strengths.push('Well-structured with bullet points for readability');
    }

    // Check for appropriate length
    const wordCount = this.words.length;
    if (wordCount >= 300 && wordCount <= 800) {
      strengths.push('Appropriate resume length for ATS scanning');
    }

    if (strengths.length === 0) {
      strengths.push('Resume contains relevant professional information');
    }

    return strengths;
  }

  private generateRecommendations(): Array<{ area: string; suggestion: string }> {
    const recommendations: Array<{ area: string; suggestion: string }> = [];

    // Keyword recommendations
    const techSkillsFound = KEYWORD_CATEGORIES.find(cat => cat.name === 'Technical Skills')?.keywords
      .filter(skill => this.normalizedText.includes(skill)).length || 0;
    if (techSkillsFound < 3) {
      recommendations.push({
        area: 'Keywords',
        suggestion: 'Add more relevant technical skills and industry keywords to improve ATS matching'
      });
    }

    // Action verbs
    const actionVerbsFound = KEYWORD_CATEGORIES.find(cat => cat.name === 'Action Verbs')?.keywords
      .filter(verb => this.normalizedText.includes(verb)).length || 0;
    if (actionVerbsFound < 3) {
      recommendations.push({
        area: 'Action Verbs',
        suggestion: 'Use more strong action verbs like "achieved," "managed," "developed," and "implemented"'
      });
    }

    // Quantifiable achievements
    const quantifiers = this.resumeText.match(/\b(\d+%|\d+\+|increased|decreased|improved|reduced|saved|\$\d+)\b/gi);
    if (!quantifiers || quantifiers.length < 2) {
      recommendations.push({
        area: 'Achievements',
        suggestion: 'Include more quantifiable achievements with specific numbers, percentages, or dollar amounts'
      });
    }

    // Contact information
    const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(this.resumeText);
    const hasPhone = /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/.test(this.resumeText);
    if (!hasEmail || !hasPhone) {
      recommendations.push({
        area: 'Contact Information',
        suggestion: 'Ensure complete contact information including email and phone number is clearly visible'
      });
    }

    // Formatting
    const hasBullets = /[•·▪▫‣⁃]/.test(this.resumeText) || /^\s*[-*+]\s/m.test(this.resumeText);
    if (!hasBullets) {
      recommendations.push({
        area: 'Formatting',
        suggestion: 'Use bullet points to organize information and improve readability for ATS systems'
      });
    }

    // Length
    const wordCount = this.words.length;
    if (wordCount < 200) {
      recommendations.push({
        area: 'Content Length',
        suggestion: 'Expand your resume with more detailed descriptions of your experience and achievements'
      });
    } else if (wordCount > 1000) {
      recommendations.push({
        area: 'Content Length',
        suggestion: 'Consider condensing your resume to focus on the most relevant and impactful information'
      });
    }

    // Skills section
    const hasSkills = /\b(skills|technologies|competencies|expertise)\b/i.test(this.resumeText);
    if (!hasSkills) {
      recommendations.push({
        area: 'Skills Section',
        suggestion: 'Add a dedicated skills section to highlight your technical and professional competencies'
      });
    }

    return recommendations;
  }

  private suggestJobs(): Array<{ title: string; reason: string }> {
    const suggestions: Array<{ title: string; reason: string }> = [];
    
    for (const jobRole of COMMON_JOB_ROLES) {
      const matchingKeywords = jobRole.keywords.filter(keyword => 
        this.normalizedText.includes(keyword)
      );
      
      if (matchingKeywords.length >= jobRole.requiredCount) {
        const matchPercentage = Math.round((matchingKeywords.length / jobRole.keywords.length) * 100);
        suggestions.push({
          title: jobRole.title,
          reason: `${matchPercentage}% keyword match - Strong alignment with required skills: ${matchingKeywords.slice(0, 3).join(', ')}`
        });
      }
    }

    // Sort by relevance and take top 5
    suggestions.sort((a, b) => {
      const aMatch = parseInt(a.reason.match(/(\d+)%/)?.[1] || '0');
      const bMatch = parseInt(b.reason.match(/(\d+)%/)?.[1] || '0');
      return bMatch - aMatch;
    });

    // If no strong matches, provide general suggestions
    if (suggestions.length === 0) {
      const techSkillsFound = KEYWORD_CATEGORIES.find(cat => cat.name === 'Technical Skills')?.keywords
        .filter(skill => this.normalizedText.includes(skill)).length || 0;
      
      if (techSkillsFound > 0) {
        suggestions.push(
          { title: 'Software Developer', reason: 'Technical skills present - consider highlighting programming experience' },
          { title: 'IT Specialist', reason: 'Technology-related keywords found in resume' },
          { title: 'Technical Analyst', reason: 'Analytical and technical skills indicated' }
        );
      } else {
        suggestions.push(
          { title: 'Project Coordinator', reason: 'Organizational and coordination skills suggested by resume content' },
          { title: 'Business Analyst', reason: 'Professional experience indicates analytical capabilities' },
          { title: 'Administrative Specialist', reason: 'Professional background suitable for administrative roles' }
        );
      }
    }

    return suggestions.slice(0, 5);
  }
}

export const analyzeResumeForATS = async (resumeText: string): Promise<AnalysisResult> => {
  // Add a small delay to simulate processing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const analyzer = new ResumeAnalyzer(resumeText);
  return analyzer.analyze();
};