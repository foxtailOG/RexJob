export interface AnalysisResult {
  atsScore: number;
  strengths: string[];
  recommendations: {
    area: string;
    suggestion: string;
  }[];
  suggestedJobs: {
    title: string;
    reason: string;
  }[];
}

export type TemplateOption = 'professional' | 'creative' | 'modern' | 'minimalist';
export type ColorScheme = 'Blue' | 'Purple' | 'Green' | 'Gray' | 'Cyan' | 'Pink';
export type FontFamily = 'Inter' | 'Roboto' | 'Lato' | 'Montserrat';

export interface PersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
}

export interface WorkExperience {
    id: string;
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
}

export interface Education {
    id: string;
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
}

export interface Skill {
    id: string;
    name: string;
}

export interface Project {
    id: string;
    projectName: string;
    description: string;
    link: string;
    technologies: string;
}

export interface Certification {
    id: string;
    name: string;
    organization: string;
    about: string;
    date: string;
}

export interface ResumeData {
    personalInfo: PersonalInfo;
    professionalSummary: string;
    workExperience: WorkExperience[];
    education: Education[];
    skills: Skill[];
    projects: Project[];
    certifications: Certification[];
}

export interface ResumeStyle {
    template: TemplateOption;
    fontFamily: FontFamily;
    colorScheme: ColorScheme;
    columnWidth: number;
    fontSize: number;
    rowGap: number;
    columnGap: number;
}

export interface SectionVisibility {
    professionalSummary: boolean;
    workExperience: boolean;
    education: boolean;
    skills: boolean;
    projects: boolean;
    certifications: boolean;
}

export interface ResumeState {
    data: ResumeData;
    style: ResumeStyle;
    sections: SectionVisibility;
    sectionOrder: Array<keyof SectionVisibility>;
}
