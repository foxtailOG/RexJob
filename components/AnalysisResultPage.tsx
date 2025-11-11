import React from 'react';
import type { AnalysisResult } from '../types';

interface AnalysisResultPageProps {
    result: AnalysisResult | null;
    resumeText: string;
    onBackToHome: () => void;
}

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;
    const colorClass = score > 80 ? 'text-green-500' : score > 60 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="relative flex items-center justify-center h-48 w-48">
            <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 100 100">
                <circle
                    className="text-gray-200 dark:text-gray-700"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                />
                <circle
                    className={colorClass}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                />
            </svg>
            <span className={`absolute text-4xl font-bold ${colorClass}`}>{score}</span>
        </div>
    );
};


const AnalysisResultPage: React.FC<AnalysisResultPageProps> = ({ result, onBackToHome }) => {
    if (!result) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-xl text-gray-600 dark:text-gray-300">No analysis data available.</p>
                <button onClick={onBackToHome} className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    Back to Home
                </button>
            </div>
        );
    }
    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-dark-background">
            <div className="max-w-7xl mx-auto">
                <button onClick={onBackToHome} className="text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200 font-semibold mb-8 flex items-center group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Home
                </button>
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Resume Analysis Report</h1>
                    <div className="mt-2 mb-12 w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-400 mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-xl shadow-primary-100/50 dark:shadow-black/30 border border-gray-100 dark:border-slate-700 text-center transition-all duration-300 hover:scale-105">
                            <h2 className="text-2xl font-bold mb-4">ATS Score</h2>
                            <ScoreCircle score={result.atsScore} />
                             <p className="mt-4 text-gray-600 dark:text-gray-300">This score estimates your resume's compatibility with Applicant Tracking Systems.</p>
                        </div>

                        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-xl shadow-primary-100/50 dark:shadow-black/30 border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:scale-105">
                            <h2 className="text-2xl font-bold mb-4">Strengths</h2>
                             <ul className="space-y-3">
                                {result.strengths.map((strength, index) => (
                                    <li key={index} className="flex items-start">
                                        <svg className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                        <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-xl shadow-primary-100/50 dark:shadow-black/30 border border-gray-100 dark:border-slate-700">
                             <h2 className="text-2xl font-bold text-primary-800 dark:text-primary-200 mb-4">Actionable Recommendations</h2>
                             <div className="space-y-4">
                                {result.recommendations.map((rec, index) => (
                                     <div key={index} className="bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500 p-4 rounded-r-lg">
                                        <h3 className="font-bold text-primary-800 dark:text-primary-200">{rec.area}</h3>
                                        <p className="text-primary-700 dark:text-primary-300">{rec.suggestion}</p>
                                    </div>
                                ))}
                             </div>
                        </div>

                         <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-xl shadow-primary-100/50 dark:shadow-black/30 border border-gray-100 dark:border-slate-700">
                             <h2 className="text-2xl font-bold text-secondary-800 dark:text-secondary-300 mb-4">Suggested Job Roles</h2>
                             <div className="space-y-4">
                                {result.suggestedJobs.map((job, index) => (
                                     <div key={index} className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-secondary-400 dark:hover:border-secondary-500 hover:bg-secondary-50 dark:hover:bg-secondary-900/10 transition-colors">
                                        <h3 className="font-bold text-secondary-700 dark:text-secondary-300">{job.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">{job.reason}</p>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisResultPage;