import React, { useState, useCallback, useRef } from 'react';
import { analyzeResumeForATS } from '../services/geminiService';
import type { AnalysisResult, BulkAnalysisItem } from '../types';

declare const pdfjsLib: any;

interface UploadPageProps {
    onBackToHome: () => void;
    onAnalysisComplete: (result: AnalysisResult, text: string) => void;
    onBulkAnalysisComplete: (results: BulkAnalysisItem[]) => void;
}

const UploadIcon: React.FC<{className?: string}> = ({ className = "h-12 w-12 text-gray-400 dark:text-gray-500" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const LoadingSpinner: React.FC = () => (
  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const parsePdfText = async (file: File): Promise<string> => {
    if (!file || file.type !== 'application/pdf') {
        throw new Error('Invalid file type. Please select a PDF.');
    }
     if (typeof pdfjsLib === 'undefined') {
        throw new Error("PDF library not loaded. Please refresh the page.");
    }

    const readFile = (fileToRead: File): Promise<ArrayBuffer> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(fileToRead);
        });
    };

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
    const fullText = pageTexts.join('\n\n');
    if (!fullText.trim()) {
        throw new Error('Could not extract text. PDF might be image-based.');
    }
    return fullText;
};

const UploadPage: React.FC<UploadPageProps> = ({ onBackToHome, onAnalysisComplete, onBulkAnalysisComplete }) => {
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [bulkFiles, setBulkFiles] = useState<{ name: string; status: 'parsing' | 'done' | 'error'; text?: string; error?: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bulkFileInputRef = useRef<HTMLInputElement>(null);

    const handleAnalyze = useCallback(async () => {
        const readyBulkFiles = bulkFiles.filter(f => f.status === 'done' && f.text);

        if (readyBulkFiles.length > 0) { // Bulk Analysis
             if (!jobDescription.trim()) {
                setError("Please paste the job description for a tailored analysis.");
                return;
            }
            setIsLoading(true);
            setError(null);
            const results: BulkAnalysisItem[] = [];
            try {
                for (const file of readyBulkFiles) {
                    setLoadingMessage(`Analyzing ${file.name}...`);
                    const result = await analyzeResumeForATS(file.text!, jobDescription);
                    results.push({ filename: file.name, result });
                }
                onBulkAnalysisComplete(results);
            } catch (e) {
                 setError(e instanceof Error ? e.message : 'An unknown error occurred during bulk analysis.');
            } finally {
                setIsLoading(false);
                setLoadingMessage('');
            }
        } else { // Single Analysis
            if (!resumeText.trim()) {
                setError("Please paste or upload your resume before analyzing.");
                return;
            }
            if (!jobDescription.trim()) {
                setError("Please paste the job description for a tailored analysis.");
                return;
            }
            setIsLoading(true);
            setLoadingMessage('Analyzing Resume...');
            setError(null);
            try {
                const result = await analyzeResumeForATS(resumeText, jobDescription);
                onAnalysisComplete(result, resumeText);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'An unknown error occurred.');
            } finally {
                setIsLoading(false);
                setLoadingMessage('');
            }
        }
    }, [resumeText, jobDescription, onAnalysisComplete, bulkFiles, onBulkAnalysisComplete]);
    
    const processSingleFile = async (file: File | null) => {
        if (!file) return;
        setIsLoading(true);
        setLoadingMessage('Parsing PDF...');
        setError(null);
        setResumeText('');
        setBulkFiles([]);
        try {
            const text = await parsePdfText(file);
            setResumeText(text);
        } catch(e) {
             setError(e instanceof Error ? e.message : 'Failed to parse PDF.');
        } finally {
             setIsLoading(false);
             setLoadingMessage('');
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processSingleFile(file);
        }
        if(event.target) {
            event.target.value = '';
        }
    };
    
    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if(isLoading) return;
        const file = event.dataTransfer.files?.[0];
        if (file) {
            processSingleFile(file);
        }
    }, [isLoading]);
    
    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleBulkFilesChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files ? Array.from(event.target.files) : [];
        if (files.length === 0) return;

        setResumeText('');
        setError(null);
        const filesToParse = files.map(f => ({ name: f.name, status: 'parsing' as const }));
        setBulkFiles(filesToParse);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const text = await parsePdfText(file);
                setBulkFiles(prev => prev.map(bf => bf.name === file.name ? { ...bf, status: 'done', text } : bf));
            } catch (e) {
                const errorMsg = e instanceof Error ? e.message : 'Unknown parsing error';
                setBulkFiles(prev => prev.map(bf => bf.name === file.name ? { ...bf, status: 'error', error: errorMsg } : bf));
            }
        }
         if(event.target) {
            event.target.value = '';
        }
    };
    
    const readyBulkFilesCount = bulkFiles.filter(f => f.status === 'done').length;
    const isBulkMode = bulkFiles.length > 0;
    const analysisButtonText = isBulkMode ? `Analyze All (${readyBulkFilesCount}) Resumes` : 'Analyze Resume';
    const isAnalyzeDisabled = isLoading || !jobDescription.trim() || (!isBulkMode && !resumeText.trim()) || (isBulkMode && readyBulkFilesCount === 0);

    return (
        <div className="animated-gradient-bg min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                <button onClick={onBackToHome} className="text-primary-800 hover:text-primary-900 dark:text-primary-200 dark:hover:text-white font-semibold mb-8 flex items-center group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Home
                </button>

                <div className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl shadow-primary-200/20 dark:shadow-black/30 border border-gray-100 dark:border-slate-700/50 border-t-4 border-t-primary-500">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Analyze Your Resume</h1>
                        <p className="mt-3 text-gray-600 dark:text-gray-300">
                           Upload or paste your resume and the job description to get detailed ATS analysis.
                        </p>
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                             <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Your Resume</h2>
                             <div
                                className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center transition-all duration-300 ${!isLoading && !isBulkMode ? 'cursor-pointer hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20' : 'bg-gray-100 dark:bg-gray-800/50 opacity-60'}`}
                                onClick={() => !isLoading && !isBulkMode && fileInputRef.current?.click()}
                                onDrop={!isBulkMode ? handleDrop : undefined}
                                onDragOver={!isBulkMode ? handleDragOver : undefined}
                                onDragEnter={!isBulkMode ? handleDragOver : undefined}
                                aria-disabled={isLoading || isBulkMode}
                            >
                                 <input
                                    type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf"
                                    className="hidden" disabled={isLoading || isBulkMode}
                                />
                                <div className="flex justify-center mb-4">
                                    <UploadIcon />
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">Drag & drop a single PDF</p>
                                <p className="text-sm text-gray-500 my-1">or</p>
                                <span className={`font-semibold ${!isBulkMode ? 'text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                    Browse for a file
                                </span>
                            </div>
                            <textarea
                                value={resumeText}
                                onChange={(e) => { setResumeText(e.target.value); if (isBulkMode) setBulkFiles([]); }}
                                placeholder="...or paste your resume text here."
                                className="w-full mt-4 h-64 p-4 border border-gray-200 dark:border-gray-600 rounded-md resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                disabled={isLoading}
                                aria-label="Resume text input"
                            />
                        </div>
                         <div>
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Job Description</h2>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description here to get a tailored analysis and score."
                                className="w-full h-full p-4 border border-gray-200 dark:border-gray-600 rounded-md resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                disabled={isLoading}
                                aria-label="Job description input"
                                style={{ minHeight: '338px' }}
                            />
                        </div>
                    </div>
                    {isBulkMode && (
                        <div className="mt-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Resumes for Bulk Analysis</h3>
                                <button onClick={() => setBulkFiles([])} className="text-sm font-semibold text-red-500 hover:underline">Clear</button>
                            </div>
                            <ul className="mt-2 space-y-2 max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                                {bulkFiles.map(file => (
                                    <li key={file.name} className="flex items-center justify-between text-sm p-1 rounded">
                                        <span className="truncate pr-2 dark:text-gray-300">{file.name}</span>
                                        {file.status === 'parsing' && <span className="text-blue-500 font-medium">Parsing...</span>}
                                        {file.status === 'done' && <span className="text-green-600 font-medium flex items-center"><svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>Ready</span>}
                                        {file.status === 'error' && <span title={file.error} className="text-red-500 font-medium flex items-center"><svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>Error</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                     <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">Your data is processed securely and is not stored.</p>
                     {error && <p className="text-red-500 text-center mt-4" role="alert">{error}</p>}
                    
                    <div className="mt-8 relative pt-8 border-t border-gray-200/80 dark:border-gray-700/80">
                         <div className="absolute left-0 bottom-0">
                             <label
                                htmlFor="bulk-file-input"
                                className={`flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-600 dark:text-primary-300 dark:hover:text-primary-200 transition-colors ${isLoading ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                <UploadIcon className="h-5 w-5" />
                                Analyze Multiple Resumes
                            </label>
                             <input
                                id="bulk-file-input"
                                type="file" ref={bulkFileInputRef} onChange={handleBulkFilesChange} accept="application/pdf"
                                className="hidden" disabled={isLoading} multiple
                            />
                         </div>
                        <div className="text-center">
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzeDisabled}
                                className="w-full sm:w-auto px-10 py-4 bg-primary-600 text-white font-semibold rounded-lg shadow-lg shadow-primary-300/60 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-75 transition-all duration-300 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                            >
                                {isLoading ? <><LoadingSpinner /> <span className="ml-3">{loadingMessage}</span></> : analysisButtonText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadPage;