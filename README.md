# RexJob: Professional Resume Optimizer

A modern web application built with React and TypeScript that helps users optimize their resumes for Applicant Tracking Systems (ATS), find matching job opportunities, and create professional resumes.

## Features

- **Resume Analysis**: Advanced algorithmic analysis of resumes for ATS compatibility
- **Job Matching**: Smart job recommendations based on resume content
- **Resume Builder**: Professional resume creation with customizable templates
- **PDF Support**: Upload and parse PDF resumes
- **Real-time Scoring**: Instant feedback on resume quality

## Technologies Used

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **PDF Processing**: PDF.js
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd rexjob-resume-optimizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # React components
│   ├── LandingPage.tsx     # Home page component
│   ├── UploadPage.tsx      # Resume upload and analysis
│   ├── AnalysisResultPage.tsx  # Analysis results display
│   ├── ResumeBuilder.tsx   # Resume creation tool
│   └── icons/              # Custom icon components
├── services/            # Business logic
│   └── resumeAnalyzer.ts   # Resume analysis algorithms
├── types.ts            # TypeScript type definitions
└── App.tsx             # Main application component
```

## Resume Analysis Algorithm

The application uses a sophisticated scoring algorithm that evaluates:

- **Contact Information**: Email and phone number presence
- **Professional Sections**: Experience, education, skills sections
- **Action Verbs**: Strong action words usage
- **Quantifiable Results**: Numbers, percentages, metrics
- **Technical Keywords**: Industry-relevant terms
- **Content Quality**: Appropriate length and language strength

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.