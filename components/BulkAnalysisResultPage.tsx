import React, { useState } from 'react';
import type { BulkAnalysisItem } from '../types';

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;
    const colorClass = score > 80 ? 'text-green-500' : score > 60 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="relative flex items-center justify-center h-24 w-24 flex-shrink-0">
            <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 100 100">
                <circle className="text-gray-200 dark:text-gray-700" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                <circle
                    className={colorClass} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50"
                />
            </svg>
            <span className={`absolute text-2xl font-bold ${colorClass}`}>{score}</span>
        </div>
    );
};

const AnalysisDetails: React.FC<{ result: BulkAnalysisItem['result'] }> = ({ result }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div>
            <h3 className="text-xl font-bold mb-3 text-primary-800 dark:text-primary-200">Strengths</h3>
             <ul className="space-y-3">
                {result.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                    </li>
                ))}
            </ul>
        </div>
        <div>
            <h3 className="text-xl font-bold text-primary-800 dark:text-primary-200 mb-3">Actionable Recommendations</h3>
             <div className="space-y-4">
                {result.recommendations.map((rec, index) => (
                     <div key={index} className="bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500 p-4 rounded-r-lg">
                        <h4 className="font-bold text-primary-800 dark:text-primary-200">{rec.area}</h4>
                        <p className="text-primary-700 dark:text-primary-300">{rec.suggestion}</p>
                    </div>
                ))}
             </div>
        </div>
    </div>
);


const BulkAnalysisResultPage: React.FC<{ results: BulkAnalysisItem[] | null, onBackToHome: () => void }> = ({ results, onBackToHome }) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

    if (!results) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-xl text-gray-600 dark:text-gray-300">No analysis data available.</p>
                <button onClick={onBackToHome} className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    Back to Home
                </button>
            </div>
        );
    }

    const sortedResults = [...results].sort((a, b) => b.result.atsScore - a.result.atsScore);

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-dark-background">
            <div className="max-w-4xl mx-auto">
                <button onClick={onBackToHome} className="text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200 font-semibold mb-8 flex items-center group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Home
                </button>
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Bulk Analysis Report</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">Showing results for {results.length} resumes, sorted by ATS score.</p>
                    <div className="mt-4 mb-12 w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-400 mx-auto rounded-full"></div>
                </div>

                <div className="space-y-4">
                    {sortedResults.map((item, index) => (
                        <div key={item.filename} className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm border border-gray-200/80 dark:border-slate-700/80 rounded-2xl shadow-lg shadow-primary-100/30 dark:shadow-black/30 overflow-hidden">
                            <button 
                                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-primary-50/50 dark:hover:bg-slate-800/50 transition-colors"
                                aria-expanded={expandedIndex === index}
                            >
                                <div className="flex items-center">
                                    <div className={`mr-4 transition-transform duration-300 ${expandedIndex === index ? 'rotate-90' : ''}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </div>
                                    <p className="font-bold text-lg text-primary-800 dark:text-primary-200 truncate">{item.filename}</p>
                                </div>
                                <div className="flex items-center gap-4 ml-4">
                                     <span className="font-semibold text-gray-600 dark:text-gray-400">ATS Score</span>
                                     <ScoreCircle score={item.result.atsScore} />
                                </div>
                            </button>
                             {expandedIndex === index && (
                                <div className="p-6 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-dark-surface">
                                    <AnalysisDetails result={item.result} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BulkAnalysisResultPage;