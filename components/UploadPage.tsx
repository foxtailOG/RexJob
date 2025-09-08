import React, { useState, useCallback, useRef } from 'react';
import { analyzeResumeForATS } from '../services/geminiService';
import type { AnalysisResult } from '../types';

declare const pdfjsLib: any;

interface UploadPageProps {
    onBackToHome: () => void;
    onAnalysisComplete: (result: AnalysisResult, text: string) => void;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const LoadingSpinner: React.FC = () => (
  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


const UploadPage: React.FC<UploadPageProps> = ({ onBackToHome, onAnalysisComplete }) => {
    const [resumeText, setResumeText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAnalyze = useCallback(async () => {
        if (!resumeText.trim()) {
            setError("Please paste or upload your resume before analyzing.");
            return;
        }
        setIsLoading(true);
        setLoadingMessage('Analyzing with AI...');
        setError(null);
        try {
            const result = await analyzeResumeForATS(resumeText);
            onAnalysisComplete(result, resumeText);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [resumeText, onAnalysisComplete]);
    
    const parsePdf = useCallback(async (file: File) => {
        if (!file || file.type !== 'application/pdf') {
            setError('Please select a valid PDF file.');
            return;
        }
        if (typeof pdfjsLib === 'undefined') {
            setError("PDF library not loaded. Please refresh the page and try again.");
            return;
        }
        setIsLoading(true);
        setLoadingMessage('Parsing PDF...');
        setError(null);
        setResumeText('');

        const readFile = (fileToRead: File): Promise<ArrayBuffer> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as ArrayBuffer);
                reader.onerror = (error) => reject(error);
                reader.readAsArrayBuffer(fileToRead);
            });
        };

        try {
            const arrayBuffer = await readFile(file);
            const typedarray = new Uint8Array(arrayBuffer);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            
            const pageTexts = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                pageTexts.push(pageText);
            }
            setResumeText(pageTexts.join('\n\n'));
        } catch (e) {
            setError('Failed to parse PDF. The file might be image-based or corrupted. Please try pasting the content manually.');
            console.error('PDF parsing error:', e);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, []);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            parsePdf(file);
        }
        if(event.target) {
            event.target.value = ''; // Allow re-uploading the same file
        }
    };
    
    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if(isLoading) return;
        const file = event.dataTransfer.files?.[0];
        if (file) {
            parsePdf(file);
        }
    }, [isLoading, parsePdf]);
    
    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-primary-200/50 rounded-full opacity-50 blur-3xl -z-10" aria-hidden="true"></div>
            <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-96 h-96 bg-secondary-200/50 rounded-full opacity-50 blur-3xl -z-10" aria-hidden="true"></div>
            
            <div className="w-full max-w-3xl z-10">
                <button onClick={onBackToHome} className="text-primary-600 hover:text-primary-700 font-semibold mb-8 flex items-center group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Home
                </button>

                <div className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl shadow-primary-200/20 border border-gray-100 border-t-4 border-t-primary-500">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900">Analyze Your Resume</h1>
                        <p className="mt-3 text-gray-600">
                           Upload or paste your resume content below to get detailed ATS analysis and job recommendations.
                        </p>
                    </div>

                    <div className="mt-8">
                        <div
                            className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-all duration-300 ${!isLoading ? 'cursor-pointer hover:border-primary-500 hover:bg-primary-50' : 'bg-gray-100'}`}
                            onClick={() => !isLoading && fileInputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragOver}
                            aria-disabled={isLoading}
                        >
                             <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="application/pdf"
                                className="hidden"
                                disabled={isLoading}
                            />
                            <div className="flex justify-center mb-4">
                                <UploadIcon />
                            </div>
                            <p className="text-gray-600">Drag & drop your PDF resume here</p>
                            <p className="text-sm text-gray-500 my-1">or</p>
                            <span className="font-semibold text-primary-600 hover:text-primary-500">
                                Browse for a file
                            </span>
                        </div>
                        <textarea
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            placeholder="PDF content will appear here after upload, or you can paste your resume directly."
                            className="w-full mt-4 h-64 p-4 border border-gray-200 rounded-md resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                            disabled={isLoading}
                            aria-label="Resume text input"
                        />
                        <p className="text-xs text-gray-500 mt-2">Your data is processed securely and is not stored.</p>
                    </div>
                     {error && <p className="text-red-500 text-center mt-4" role="alert">{error}</p>}
                    <div className="mt-8 text-center">
                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading || !resumeText}
                            className="w-full sm:w-auto px-10 py-4 bg-primary-600 text-white font-semibold rounded-lg shadow-lg shadow-primary-300/60 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-75 transition-all duration-300 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                        >
                            {isLoading ? <><LoadingSpinner /> <span className="ml-3">{loadingMessage}</span></> : 'Analyze with AI'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadPage;