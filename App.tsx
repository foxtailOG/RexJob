import React, { useState, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import ResumeBuilder from './components/ResumeBuilder';
import UploadPage from './components/UploadPage';
import AnalysisResultPage from './components/AnalysisResultPage';
import BulkAnalysisResultPage from './components/BulkAnalysisResultPage';
import { ThemeProvider } from './contexts/ThemeContext';
import type { AnalysisResult, BulkAnalysisItem } from './types';

export type Page = 'home' | 'builder' | 'upload' | 'analysis' | 'bulk-analysis';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [bulkAnalysisResults, setBulkAnalysisResults] = useState<BulkAnalysisItem[] | null>(null);

  const handleAnalysisComplete = useCallback((result: AnalysisResult, text: string) => {
    setAnalysisResult(result);
    setResumeText(text);
    setCurrentPage('analysis');
  }, []);
  
  const handleBulkAnalysisComplete = useCallback((results: BulkAnalysisItem[]) => {
    setBulkAnalysisResults(results);
    setCurrentPage('bulk-analysis');
  }, []);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'builder':
        return <ResumeBuilder onBackToHome={() => navigateTo('home')} />;
      case 'upload':
        return <UploadPage onBackToHome={() => navigateTo('home')} onAnalysisComplete={handleAnalysisComplete} onBulkAnalysisComplete={handleBulkAnalysisComplete} />;
      case 'analysis':
        return <AnalysisResultPage result={analysisResult} resumeText={resumeText} onBackToHome={() => navigateTo('home')} />;
      case 'bulk-analysis':
        return <BulkAnalysisResultPage results={bulkAnalysisResults} onBackToHome={() => navigateTo('home')} />;
      case 'home':
      default:
        return <LandingPage onNavigate={navigateTo} />;
    }
  };

  return (
    <ThemeProvider>
        <div className="min-h-screen bg-transparent text-primary-800 dark:text-primary-200 font-sans transition-colors duration-300">
          {renderPage()}
        </div>
    </ThemeProvider>
  );
};

export default App;