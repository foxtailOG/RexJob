import React, { useState, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import ResumeBuilder from './components/ResumeBuilder';
import UploadPage from './components/UploadPage';
import AnalysisResultPage from './components/AnalysisResultPage';
import type { AnalysisResult } from './types';

export type Page = 'home' | 'builder' | 'upload' | 'analysis';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [resumeText, setResumeText] = useState<string>('');

  const handleAnalysisComplete = useCallback((result: AnalysisResult, text: string) => {
    setAnalysisResult(result);
    setResumeText(text);
    setCurrentPage('analysis');
  }, []);
  
  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'builder':
        return <ResumeBuilder onBackToHome={() => navigateTo('home')} />;
      case 'upload':
        return <UploadPage onBackToHome={() => navigateTo('home')} onAnalysisComplete={handleAnalysisComplete} />;
      case 'analysis':
        return <AnalysisResultPage result={analysisResult} resumeText={resumeText} onBackToHome={() => navigateTo('home')} />;
      case 'home':
      default:
        return <LandingPage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-primary-800 font-sans">
      {renderPage()}
    </div>
  );
};

export default App;