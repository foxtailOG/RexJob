import React from 'react';
import type { Page } from '../App';
import LogoIcon from './icons/LogoIcon';

const FeatureIcon1: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const FeatureIcon2: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const FeatureIcon3: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100/80">
        <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-secondary-500 mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-primary-800 mb-3">{title}</h3>
        <p className="text-primary-700 leading-relaxed">{description}</p>
    </div>
);


interface LandingPageProps {
    onNavigate: (page: Page) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
    return (
        <div className="bg-gradient-to-b from-background to-white">
            <header className="py-6">
                <div className="container mx-auto flex items-center px-6">
                    <LogoIcon />
                    <span className="text-2xl font-bold ml-2 text-primary-800">RexJob</span>
                </div>
            </header>

            <main className="container mx-auto px-6">
                <section className="py-24 md:py-32 flex flex-col justify-center items-center text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-primary-900 leading-tight">
                        Optimize Your Resume for <br />
                        <span className="text-secondary-600">ATS Success</span>
                    </h1>
                    <p className="mt-6 text-lg md:text-xl text-primary-700 max-w-3xl">
                        Beat applicant tracking systems, get matched with perfect jobs, and create stunning resumes.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        <button
                            onClick={() => onNavigate('upload')}
                            className="px-8 py-4 bg-secondary-600 text-white font-semibold rounded-lg shadow-lg shadow-secondary-500/40 hover:bg-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-opacity-75 transition-all transform hover:scale-105 duration-300">
                            Analyze My Resume
                        </button>
                        <button
                            onClick={() => onNavigate('builder')}
                            className="px-8 py-4 bg-white text-primary-800 font-semibold rounded-lg border border-gray-200 shadow-md shadow-gray-200/50 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-75 transition-all transform hover:scale-105 duration-300">
                            Create New Resume
                        </button>
                    </div>
                </section>

                <section className="py-20">
                    <div className="text-center mb-16">
                      <h2 className="text-4xl font-bold text-primary-900">
                        Everything You Need to Land Your Dream Job
                      </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-10">
                        <FeatureCard
                            icon={<FeatureIcon1 />}
                            title="ATS Optimization"
                            description="Our AI analyzes your resume against ATS requirements and provides detailed optimization recommendations."
                        />
                        <FeatureCard
                            icon={<FeatureIcon2 />}
                            title="Job Matching"
                            description="Get personalized job recommendations based on your skills, experience, and career goals."
                        />
                        <FeatureCard
                            icon={<FeatureIcon3 />}
                            title="Resume Builder"
                            description="Create professional resumes with our customizable templates and drag-and-drop editor."
                        />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default LandingPage;