import React, { useReducer, useEffect, useRef, useState, useLayoutEffect } from 'react';
import type { ResumeState, PersonalInfo, WorkExperience, Education, Skill, TemplateOption, ColorScheme, FontFamily, Project, SectionVisibility, Certification, ResumeData } from '../types';
// Dummy import for jsPDF and html2canvas from window
declare const jspdf: any;
declare const html2canvas: any;

// --- ICONS ---
const DownloadIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const SaveIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>;
const AddIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const TrashIcon: React.FC<{onClick: () => void}> = ({onClick}) => <button onClick={onClick} className="text-slate-400 hover:text-red-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>;
const WorkIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const EducationIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v5.5" /></svg>;
const ProjectIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517M11.75 3.25l-.172.48a6 6 0 01-3.86.517l-2.387-.477a2 2 0 00-1.022.547M3 11a23.931 23.931 0 0118 0m-18 0v7a2 2 0 002 2h14a2 2 0 002-2v-7m-16.554 5.996v.002c0 .016.016.023.028.013a6 6 0 011.858-.844l.058-.011a6 6 0 000-11.152l-.058-.011a6 6 0 01-1.858-.844c-.012-.01-.028-.003-.028.013v.002z" /></svg>;
const SkillIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const CertificationIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806 1.946 3.42 3.42 0 013.138-3.138z" /></svg>;
const DragHandleIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 cursor-grab active:cursor-grabbing" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;

// --- INITIAL STATE ---
const initialState: ResumeState = {
    data: {
        personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', website: '' },
        professionalSummary: '',
        workExperience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
    },
    style: {
        template: 'professional',
        fontFamily: 'Inter',
        colorScheme: 'Blue',
        columnWidth: 33,
        fontSize: 10,
        rowGap: 1.2,
        columnGap: 1.5,
    },
    sections: {
        professionalSummary: true,
        workExperience: true,
        education: true,
        skills: true,
        projects: true,
        certifications: true,
    },
    sectionOrder: ['professionalSummary', 'workExperience', 'education', 'projects', 'skills', 'certifications'],
};


// --- REDUCER ---
type Action =
  | { type: 'LOAD_STATE', payload: ResumeState }
  | { type: 'UPDATE_PERSONAL', payload: { field: keyof PersonalInfo; value: string } }
  | { type: 'UPDATE_SUMMARY', payload: string }
  | { type: 'ADD_ITEM', payload: { section: 'workExperience' | 'education' | 'skills' | 'projects' | 'certifications' } }
  | { type: 'UPDATE_ITEM', payload: { section: 'workExperience' | 'education' | 'skills' | 'projects' | 'certifications', id: string, field: string, value: string } }
  | { type: 'REMOVE_ITEM', payload: { section: 'workExperience' | 'education' | 'skills' | 'projects' | 'certifications', id: string } }
  | { type: 'TOGGLE_SECTION', payload: keyof SectionVisibility }
  | { type: 'UPDATE_STYLE', payload: { field: keyof ResumeState['style']; value: string | number } }
  | { type: 'REORDER_SECTIONS', payload: { sourceIndex: number, destinationIndex: number } };

const resumeReducer = (state: ResumeState, action: Action): ResumeState => {
    switch (action.type) {
        case 'LOAD_STATE':
            return { ...action.payload, sectionOrder: action.payload.sectionOrder || initialState.sectionOrder };
        case 'UPDATE_PERSONAL':
            return { ...state, data: { ...state.data, personalInfo: { ...state.data.personalInfo, [action.payload.field]: action.payload.value } } };
        case 'UPDATE_SUMMARY':
            return { ...state, data: { ...state.data, professionalSummary: action.payload } };
        case 'ADD_ITEM': {
            const id = new Date().getTime().toString();
            const section = action.payload.section;
            let newItem;
            if (section === 'workExperience') newItem = { id, jobTitle: '', company: '', startDate: '', endDate: '', description: '' };
            else if (section === 'education') newItem = { id, institution: '', degree: '', startDate: '', endDate: '' };
            else if (section === 'skills') newItem = { id, name: ''};
            else if (section === 'projects') newItem = { id, projectName: '', description: '', link: '', technologies: '' };
            else if (section === 'certifications') newItem = { id, name: '', organization: '', about: '', date: '' };
            
            if(newItem) {
                return { ...state, data: { ...state.data, [section]: [...(state.data[section] as any[]), newItem] } };
            }
            return state;
        }
        case 'UPDATE_ITEM': {
            const { section, id, field, value } = action.payload;
            const updatedSection = (state.data[section] as any[]).map(item => item.id === id ? { ...item, [field]: value } : item);
            return { ...state, data: { ...state.data, [section]: updatedSection as any } };
        }
        case 'REMOVE_ITEM': {
             const { section, id } = action.payload;
             const filteredSection = (state.data[section] as any[]).filter(item => item.id !== id);
             return { ...state, data: { ...state.data, [section]: filteredSection as any } };
        }
        case 'TOGGLE_SECTION':
            return { ...state, sections: { ...state.sections, [action.payload]: !state.sections[action.payload] } };
        case 'UPDATE_STYLE': {
            return { ...state, style: { ...state.style, [action.payload.field]: action.payload.value } };
        }
        case 'REORDER_SECTIONS': {
            const { sourceIndex, destinationIndex } = action.payload;
            const newOrder = Array.from(state.sectionOrder);
            const [movedItem] = newOrder.splice(sourceIndex, 1);
            newOrder.splice(destinationIndex, 0, movedItem);
            return { ...state, sectionOrder: newOrder };
        }
        default:
            return state;
    }
};


// --- HELPER COMPONENTS ---

const ColorSchemes: { [key in ColorScheme]: { name: string; bg: string; text: string; ring: string; border: string; shades: [string, string]; boxBg: string; } } = {
    Blue: { name: 'Blue', bg: 'bg-blue-500', text: 'text-blue-700', ring: 'ring-blue-500', border: 'border-blue-500', shades: ['bg-blue-500', 'bg-blue-200'], boxBg: 'bg-blue-50' },
    Purple: { name: 'Purple', bg: 'bg-purple-500', text: 'text-purple-700', ring: 'ring-purple-500', border: 'border-purple-500', shades: ['bg-purple-500', 'bg-purple-200'], boxBg: 'bg-purple-50' },
    Green: { name: 'Green', bg: 'bg-green-500', text: 'text-green-700', ring: 'ring-green-500', border: 'border-green-500', shades: ['bg-green-500', 'bg-green-200'], boxBg: 'bg-green-50' },
    Gray: { name: 'Gray', bg: 'bg-slate-500', text: 'text-slate-700', ring: 'ring-slate-500', border: 'border-slate-500', shades: ['bg-slate-500', 'bg-slate-200'], boxBg: 'bg-slate-100' },
    Cyan: { name: 'Cyan', bg: 'bg-cyan-500', text: 'text-cyan-700', ring: 'ring-cyan-500', border: 'border-cyan-500', shades: ['bg-cyan-500', 'bg-cyan-200'], boxBg: 'bg-cyan-50' },
    Pink: { name: 'Pink', bg: 'bg-pink-500', text: 'text-pink-700', ring: 'ring-pink-500', border: 'border-pink-500', shades: ['bg-pink-500', 'bg-pink-200'], boxBg: 'bg-pink-50' },
};
const FontFamilies: FontFamily[] = ['Inter', 'Roboto', 'Lato', 'Montserrat'];
const TemplateOptions: { id: TemplateOption; name: string; desc: string }[] = [
    { id: 'professional', name: 'Professional', desc: 'Clean and corporate' },
    { id: 'creative', name: 'Creative', desc: 'Bold and innovative' },
    { id: 'modern', name: 'Modern', desc: 'Stylish two-column' },
    { id: 'minimalist', name: 'Minimalist', desc: 'Simple and elegant' },
];

const ControlPanel: React.FC<{ state: ResumeState; dispatch: React.Dispatch<Action> }> = ({ state, dispatch }) => {
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragItem.current = index;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
             e.currentTarget.classList.add('opacity-50', 'bg-secondary-100', 'scale-105');
        }, 0);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragOverItem.current = index;
        e.currentTarget.classList.add('bg-secondary-50');
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('bg-secondary-50');
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        if (dragItem.current !== null && dragOverItem.current !== null) {
            dispatch({ type: 'REORDER_SECTIONS', payload: { sourceIndex: dragItem.current, destinationIndex: dragOverItem.current } });
        }
        dragItem.current = null;
        dragOverItem.current = null;
        handleDragEnd(e);
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        const elements = document.querySelectorAll('.draggable-section');
        elements.forEach(el => {
            el.classList.remove('opacity-50', 'bg-secondary-100', 'scale-105', 'bg-secondary-50');
        });
    };
    
    return (
    <div className="p-6 space-y-8 bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg shadow-purple-100/50 border border-white/50">
        <div>
            <h3 className="font-bold text-lg mb-4 text-primary-800">Templates</h3>
            <div className="grid grid-cols-2 gap-4">
                {TemplateOptions.map(template => (
                    <button key={template.id} onClick={() => dispatch({ type: 'UPDATE_STYLE', payload: { field: 'template', value: template.id } })}
                        className={`p-3 text-left border-2 rounded-xl transition-all duration-300 ${state.style.template === template.id ? 'border-transparent ring-2 ring-secondary-500 bg-secondary-500/10' : 'border-slate-200/80 hover:border-secondary-400'}`}>
                        <div className={`h-16 rounded-lg flex items-center justify-center bg-gradient-to-br ${
                            template.id === 'professional' ? 'from-blue-100 to-slate-100' :
                            template.id === 'creative' ? 'from-purple-100 to-pink-100' :
                            template.id === 'modern' ? 'from-cyan-100 to-blue-100' :
                            'from-slate-100 to-gray-200' // minimalist
                        }`}>
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <p className="text-sm font-semibold capitalize mt-2 text-primary-900">{template.name}</p>
                        <p className="text-xs text-slate-500">{template.desc}</p>
                    </button>
                ))}
            </div>
        </div>
        <div>
            <h3 className="font-bold text-lg mb-4 text-primary-800">Styling</h3>
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-slate-700">Font Family</label>
                    <select value={state.style.fontFamily} onChange={e => dispatch({ type: 'UPDATE_STYLE', payload: { field: 'fontFamily', value: e.target.value }})} 
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300/80 bg-white/80 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm rounded-md">
                        {FontFamilies.map(font => <option key={font}>{font}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700">Color Scheme</label>
                    <div className="mt-2 grid grid-cols-3 gap-3">
                        {(Object.keys(ColorSchemes) as ColorScheme[]).map(color => (
                            <button key={color} onClick={() => dispatch({ type: 'UPDATE_STYLE', payload: { field: 'colorScheme', value: color } })}
                                className={`flex items-center space-x-2 p-2 rounded-lg border-2 transition-all ${state.style.colorScheme === color ? 'border-transparent ring-2 ring-secondary-500' : 'border-slate-200/80 hover:border-secondary-400'}`}>
                                <div className="flex -space-x-1">
                                    <span className={`h-4 w-4 rounded-full ${ColorSchemes[color].shades[0]} border-2 border-white`}></span>
                                    <span className={`h-4 w-4 rounded-full ${ColorSchemes[color].shades[1]} border-2 border-white`}></span>
                                </div>
                                <span className="text-sm text-slate-700">{ColorSchemes[color].name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
         <div>
            <h3 className="font-bold text-lg mb-4 text-primary-800">Layout</h3>
            <div className="space-y-4">
                 <div>
                    <label className="text-sm font-medium text-slate-700 flex justify-between">
                        <span>Font Size</span>
                        <span>{state.style.fontSize}pt</span>
                    </label>
                    <input type="range" min="8" max="14" step="1" value={state.style.fontSize}
                        onChange={e => dispatch({ type: 'UPDATE_STYLE', payload: { field: 'fontSize', value: Number(e.target.value) }})}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1 accent-secondary-500" />
                </div>
                 <div>
                    <label className="text-sm font-medium text-slate-700 flex justify-between">
                        <span>Row Spacing</span>
                        <span>{state.style.rowGap.toFixed(1)}rem</span>
                    </label>
                    <input type="range" min="0.5" max="2.5" step="0.1" value={state.style.rowGap}
                        onChange={e => dispatch({ type: 'UPDATE_STYLE', payload: { field: 'rowGap', value: Number(e.target.value) }})}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1 accent-secondary-500" />
                </div>
                {(state.style.template === 'modern' || state.style.template === 'creative') && (
                    <>
                        <div>
                            <label className="text-sm font-medium text-slate-700 flex justify-between">
                                <span>Column Width</span>
                                <span>{state.style.columnWidth}%</span>
                            </label>
                            <input type="range" min="25" max="50" value={state.style.columnWidth}
                                onChange={e => dispatch({ type: 'UPDATE_STYLE', payload: { field: 'columnWidth', value: Number(e.target.value) }})}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1 accent-secondary-500" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 flex justify-between">
                                <span>Column Gap</span>
                                <span>{state.style.columnGap.toFixed(1)}rem</span>
                            </label>
                            <input type="range" min="0.5" max="2.5" step="0.1" value={state.style.columnGap}
                                onChange={e => dispatch({ type: 'UPDATE_STYLE', payload: { field: 'columnGap', value: Number(e.target.value) }})}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1 accent-secondary-500" />
                        </div>
                    </>
                )}
            </div>
        </div>
        <div>
            <h3 className="font-bold text-lg mb-4 text-primary-800">Sections</h3>
            <div className="space-y-3 bg-slate-500/5 p-4 rounded-lg" onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
                {state.sectionOrder.map((section, index) => (
                    <div 
                        key={section} 
                        className="flex items-center justify-between bg-white/80 p-2 rounded-md draggable-section transition-all"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragLeave={handleDragLeave}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex items-center">
                            <DragHandleIcon />
                            <span className="text-slate-700 capitalize text-sm font-medium ml-2">{section.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={state.sections[section]} onChange={() => dispatch({ type: 'TOGGLE_SECTION', payload: section })} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-secondary-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-500"></div>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    </div>
    )
};

const FormPanel: React.FC<{ state: ResumeState; dispatch: React.Dispatch<Action> }> = ({ state, dispatch }) => {
    const { data, sections } = state;
    const formInputClass = "w-full p-2 border border-slate-300/80 rounded-md focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-shadow bg-white/50 placeholder:text-slate-400";
    const addButtonClass = "flex items-center px-4 py-2 bg-secondary-600 text-white font-semibold rounded-lg text-sm hover:bg-secondary-500 transition-colors shadow-sm shadow-secondary-500/30";
    const cardClass = "p-6 bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg shadow-purple-100/50 border border-white/50";

    const EmptyState: React.FC<{icon: React.ReactNode, title: string, text: string}> = ({icon, title, text}) => (
        <div className="text-center text-slate-500 py-6 bg-slate-500/5 rounded-lg border border-dashed border-slate-300/70">
            {icon}
            <p className="mt-2 font-semibold text-slate-600">{title}</p>
            <p className="text-sm">{text}</p>
        </div>
    );
    
    return (
    <div className="space-y-6">
        <div className={cardClass}>
            <h3 className="font-bold text-lg mb-4 text-primary-800">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={data.personalInfo.fullName} onChange={e => dispatch({type: 'UPDATE_PERSONAL', payload: {field: 'fullName', value: e.target.value}})} placeholder="Full Name" className={formInputClass} />
                <input value={data.personalInfo.email} onChange={e => dispatch({type: 'UPDATE_PERSONAL', payload: {field: 'email', value: e.target.value}})} placeholder="Email" type="email" className={formInputClass} />
                <input value={data.personalInfo.phone} onChange={e => dispatch({type: 'UPDATE_PERSONAL', payload: {field: 'phone', value: e.target.value}})} placeholder="Phone" type="tel" className={formInputClass} />
                <input value={data.personalInfo.location} onChange={e => dispatch({type: 'UPDATE_PERSONAL', payload: {field: 'location', value: e.target.value}})} placeholder="City, State" className={formInputClass} />
                <input value={data.personalInfo.linkedin} onChange={e => dispatch({type: 'UPDATE_PERSONAL', payload: {field: 'linkedin', value: e.target.value}})} placeholder="linkedin.com/in/user" className={formInputClass} />
                <input value={data.personalInfo.website} onChange={e => dispatch({type: 'UPDATE_PERSONAL', payload: {field: 'website', value: e.target.value}})} placeholder="yourwebsite.com" className={formInputClass} />
            </div>
        </div>

        {sections.professionalSummary && <div className={cardClass}>
            <h3 className="font-bold text-lg mb-4 text-primary-800">Professional Summary</h3>
             <textarea value={data.professionalSummary} onChange={e => dispatch({type: 'UPDATE_SUMMARY', payload: e.target.value})} placeholder="Write a compelling professional summary..." rows={4} maxLength={300} className={`${formInputClass} resize-none w-full`}></textarea>
             <p className="text-xs text-right text-slate-500 mt-1">{data.professionalSummary.length}/300 characters</p>
             <p className="text-xs text-slate-500 mt-2 p-2 bg-slate-500/10 rounded-md">Tip: Keep it concise and impactful (2-3 sentences).</p>
        </div>}

        {sections.workExperience && <div className={cardClass}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-primary-800">Work Experience</h3>
                <button onClick={() => dispatch({type: 'ADD_ITEM', payload: {section: 'workExperience'}})} className={addButtonClass}><AddIcon /> Add Experience</button>
            </div>
            <div className="space-y-4">
            {data.workExperience.map((exp, index) => (
                <div key={exp.id} className="p-4 border border-slate-200/80 rounded-lg space-y-3 bg-white/50">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold text-slate-700">Experience #{index + 1}</p>
                        <TrashIcon onClick={() => dispatch({type: 'REMOVE_ITEM', payload: {section: 'workExperience', id: exp.id}})} />
                    </div>
                    <input value={exp.jobTitle} onChange={e => dispatch({type: 'UPDATE_ITEM', payload: {section: 'workExperience', id: exp.id, field: 'jobTitle', value: e.target.value}})} placeholder="Job Title" className={formInputClass} />
                    <input value={exp.company} onChange={e => dispatch({type: 'UPDATE_ITEM', payload: {section: 'workExperience', id: exp.id, field: 'company', value: e.target.value}})} placeholder="Company" className={formInputClass} />
                    <div className="grid grid-cols-2 gap-2">
                        <input value={exp.startDate} onChange={e => dispatch({type: 'UPDATE_ITEM', payload: {section: 'workExperience', id: exp.id, field: 'startDate', value: e.target.value}})} placeholder="Start Date" className={formInputClass} />
                        <input value={exp.endDate} onChange={e => dispatch({type: 'UPDATE_ITEM', payload: {section: 'workExperience', id: exp.id, field: 'endDate', value: e.target.value}})} placeholder="End Date" className={formInputClass} />
                    </div>
                    <textarea value={exp.description} onChange={e => dispatch({type: 'UPDATE_ITEM', payload: {section: 'workExperience', id: exp.id, field: 'description', value: e.target.value}})} placeholder="Description..." rows={3} className={`${formInputClass} w-full resize-none`}></textarea>
                </div>
            ))}
            {data.workExperience.length === 0 && <EmptyState icon={<WorkIcon />} title="No work experience yet" text="Click 'Add Experience' to get started!" />}
            </div>
        </div>}

        {sections.education && <div className={cardClass}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-primary-800">Education</h3>
                <button onClick={() => dispatch({type: 'ADD_ITEM', payload: {section: 'education'}})} className={addButtonClass}><AddIcon /> Add Education</button>
            </div>
            <div className="space-y-4">
            {data.education.map((edu, index) => (
                <div key={edu.id} className="p-4 border border-slate-200/80 rounded-lg space-y-3 bg-white/50">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold text-slate-700">Education #{index + 1}</p>
                        <TrashIcon onClick={() => dispatch({type: 'REMOVE_ITEM', payload: {section: 'education', id: edu.id}})} />
                    </div>
                    <input value={edu.institution} onChange={e => dispatch({type: 'UPDATE_ITEM', payload: {section: 'education', id: edu.id, field: 'institution', value: e.target.value}})} placeholder="Institution" className={formInputClass} />
                    <input value={edu.degree} onChange={e => dispatch({type: 'UPDATE_ITEM', payload: {section: 'education', id: edu.id, field: 'degree', value: e.target.value}})} placeholder="Degree/Certificate" className={formInputClass} />
                    <div className="grid grid-cols-2 gap-2">
                        <input value={edu.startDate} onChange={e => dispatch({type: 'UPDATE_ITEM', payload: {section: 'education', id: edu.id, field: 'startDate', value: e.target.value}})} placeholder="Start Date" className={formInputClass} />
                        <input value={edu.endDate} onChange={e => dispatch({type: 'UPDATE_ITEM', payload: {section: 'education', id: edu.id, field: 'endDate', value: e.target.value}})} placeholder="End Date" className={formInputClass} />
                    </div>
                </div>
            ))}
            {data.education.length === 0 && <EmptyState icon={<EducationIcon />} title="No education listed" text="Add your degrees and certifications." />}
            </div>
        </div>}

        {sections.projects && <div className={cardClass}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-primary-800">Projects</h3>
                <button onClick={() => dispatch({type: 'ADD_ITEM', payload: {section: 'projects'}})} className={addButtonClass}><AddIcon /> Add Project</button>
            </div>
            <div className="space-y-4">
            {data.projects.map((proj, index) => (
                <div key={proj.id} className="p-4 border border-slate-200/80 rounded-lg space-y-3 bg-white/50">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold text-slate-700">Project #{index + 1}</p>
                        <TrashIcon onClick={() => dispatch({type: 'REMOVE_ITEM', payload: {section: 'projects', id: proj.id}})} />
                    </div>
                    <input value={proj.projectName} onChange={e => dispatch({type: 'UPDATE_ITEM', payload: {section: 'projects', id: proj.id, field: 'projectName', value: e.target.value}})} placeholder="Project Name" className={formInputClass} />
                    <input value={proj.link} onChange={e => dispatch({type: 'UPDATE_ITEM', payload: {section: 'projects', id: proj.id, field: 'link', value: e.target.value}})} placeholder="Project Link (optional)" className={formInputClass} />
                    <textarea value={proj.description} onChange={e => dispatch({type: 'UPDATE_ITEM', payload: {section: 'projects', id: proj.id, field: 'description', value: e.target.value}})} placeholder="Project Description..." rows={3} className={`${formInputClass} w-full resize-none`}></textarea>
                    <input value={proj.technologies} onChange={e => dispatch({type: 'UPDATE_ITEM', payload: {section: 'projects', id: proj.id, field: 'technologies', value: e.target.value}})} placeholder="Technologies Used (e.g., React, Node.js)" className={formInputClass} />
                </div>
            ))}
            {data.projects.length === 0 && <EmptyState icon={<ProjectIcon />} title="No projects added yet" text="Showcase your best work!" />}
            </div>
        </div>}
        
        {sections.certifications && <div className={cardClass}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-primary-800">Certifications</h3>
                <button onClick={() => dispatch({type: 'ADD_ITEM', payload: {section: 'certifications'}})} className={addButtonClass}><AddIcon /> Add Certification</button>
            </div>
            <div className="space-y-4">
            {data.certifications.map((cert, index) => (
                <div key={cert.id} className="p-4 border border-slate-200/80 rounded-lg space-y-3 bg-white/50">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold text-slate-700">Certification #{index + 1}</p>
                        <TrashIcon onClick={() => dispatch({type: 'REMOVE_ITEM', payload: {section: 'certifications', id: cert.id}})} />
                    </div>
                    <input value={cert.name} onChange={e => dispatch({type: 'UPDATE_ITEM', payload: {section: 'certifications', id: cert.id, field: 'name', value: e.target.value}})} placeholder="Certification Name" className={formInputClass} />
                    <input value={cert.organization} onChange={e => dispatch({type: 'UPDATE_ITEM', payload: {section: 'certifications', id: cert.id, field: 'organization', value: e.target.value}})} placeholder="Issuing Organization" className={formInputClass} />
                    <textarea value={cert.about} onChange={e => dispatch({type: 'UPDATE_ITEM', payload: {section: 'certifications', id: cert.id, field: 'about', value: e.target.value}})} placeholder="About certificate..." rows={2} className={`${formInputClass} w-full resize-none`}></textarea>
                    <input value={cert.date} onChange={e => dispatch({type: 'UPDATE_ITEM', payload: {section: 'certifications', id: cert.id, field: 'date', value: e.target.value}})} placeholder="Date Obtained" className={formInputClass} />
                </div>
            ))}
            {data.certifications.length === 0 && <EmptyState icon={<CertificationIcon />} title="No certifications added" text="List any relevant certifications." />}
            </div>
        </div>}

         {sections.skills && <div className={cardClass}>
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-primary-800">Skills</h3>
                <button onClick={() => dispatch({type: 'ADD_ITEM', payload: {section: 'skills'}})} className={addButtonClass}><AddIcon /> Add Skill</button>
            </div>
             {data.skills.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                    {data.skills.map((skill) => (
                         <div key={skill.id} className="flex items-center bg-slate-500/10 rounded-full">
                            <input value={skill.name} onChange={e => dispatch({type: 'UPDATE_ITEM', payload: {section: 'skills', id: skill.id, field: 'name', value: e.target.value}})} placeholder="Skill" className="bg-transparent px-4 py-1.5 text-sm w-36 focus:outline-none" />
                            <button onClick={() => dispatch({type: 'REMOVE_ITEM', payload: {section: 'skills', id: skill.id}})} className="text-slate-400 hover:text-red-500 p-1 mr-2 rounded-full transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
             ) : (
                <EmptyState icon={<SkillIcon />} title="No skills added yet" text="List your technical and soft skills." />
             )}
        </div>}
    </div>
    );
};

// --- TEMPLATE & PREVIEW LOGIC ---

const ResumeTemplate: React.FC<{ state: ResumeState }> = ({ state }) => {
    const { data, style, sections, sectionOrder } = state;
    const color = ColorSchemes[style.colorScheme];
     const fontClass = {
        Inter: 'font-sans', Roboto: 'font-[Roboto,sans-serif]',
        Lato: 'font-[Lato,sans-serif]', Montserrat: 'font-[Montserrat,sans-serif]',
    }[style.fontFamily];

    const sectionHeaderClass = `text-lg font-bold uppercase tracking-wider ${color.text} ${style.template !== 'minimalist' ? `border-b-2 ${color.border}` : ''} pb-1`;
    
    const Section: React.FC<{title: string; children: React.ReactNode; sectionKey: string }> = ({ title, children, sectionKey }) => {
        const isModernSidebarSection = style.template === 'modern' && ['skills', 'certifications'].includes(sectionKey);
        const boxBgClass = ColorSchemes[style.colorScheme].boxBg;

        const wrapperClass = isModernSidebarSection ? `p-4 rounded-lg ${boxBgClass}` : '';
        
        return (
            <div data-type="section" data-key={sectionKey} className={`break-inside-avoid ${wrapperClass}`}>
                <h2 className={sectionHeaderClass}>{title}</h2>
                <div className="mt-2 space-y-3">{children}</div>
            </div>
        );
    };

    const sectionTitles: Record<keyof Omit<ResumeData, 'personalInfo'>, string> = {
        professionalSummary: 'Summary', workExperience: 'Work Experience', education: 'Education',
        projects: 'Projects', skills: 'Skills', certifications: 'Certifications',
    };

    const isTwoColumn = style.template === 'modern' || style.template === 'creative';

    const renderSectionContent = (key: keyof SectionVisibility) => {
        let content: React.ReactNode = null;
        switch (key) {
            case 'professionalSummary':
                if (data.professionalSummary) content = <div data-type="item">{data.professionalSummary}</div>;
                break;
            case 'workExperience':
                 content = data.workExperience.map(exp => (
                    <div key={exp.id} data-type="item">
                        <div className="flex justify-between font-semibold"><span>{exp.jobTitle || "Job Title"}</span><span className="text-gray-600">{exp.startDate} - {exp.endDate}</span></div>
                        <div className="italic text-gray-600">{exp.company || "Company"}</div>
                        <ul className="text-gray-700 whitespace-pre-wrap mt-1 list-disc list-inside">
                            {exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^-/, '').trim()}</li>)}
                        </ul>
                    </div>
                ));
                break;
             case 'education':
                content = data.education.map(edu => (
                    <div key={edu.id} data-type="item">
                         <div className="flex justify-between font-semibold"><span>{edu.degree || "Degree"}</span><span className="text-gray-600">{edu.startDate} - {edu.endDate}</span></div>
                        <div className="italic text-gray-600">{edu.institution || "Institution"}</div>
                    </div>
                ));
                break;
            case 'projects':
                 content = data.projects.map(proj => (
                    <div key={proj.id} data-type="item">
                        <div className="flex justify-between font-semibold items-center"><span>{proj.projectName || "Project Name"}</span>{proj.link && <a href={`https://${proj.link}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">View Project</a>}</div>
                        {proj.technologies && <div className="italic text-gray-600 text-sm">Technologies: {proj.technologies}</div>}
                        <p className="text-gray-700 whitespace-pre-wrap mt-1">{proj.description}</p>
                    </div>
                ));
                break;
            case 'certifications':
                 content = data.certifications.map(cert => (
                    <div key={cert.id} data-type="item">
                        <div className="flex justify-between font-semibold"><span>{cert.name || "Certification Name"}</span><span className="text-gray-600">{cert.date}</span></div>
                        <div className="italic text-gray-600">{cert.organization || "Issuing Organization"}</div>
                        {cert.about && <p className="text-gray-700 whitespace-pre-wrap mt-1 text-sm">{cert.about}</p>}
                    </div>
                ));
                break;
            case 'skills':
                 if (data.skills.length > 0) content = <div data-type="item"><p className="text-gray-700 break-words">{data.skills.map(s => s.name).filter(Boolean).join(' • ')}</p></div>;
                 break;
        }
        if (!content || (Array.isArray(content) && content.length === 0)) return null;
        return <Section key={key} sectionKey={key} title={sectionTitles[key]}>{content}</Section>;
    };

    if (isTwoColumn) {
        const mainSections: Array<keyof SectionVisibility> = ['professionalSummary', 'workExperience', 'education', 'projects'];
        const sideSections: Array<keyof SectionVisibility> = ['skills', 'certifications'];
        const personalDetails = [data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location, data.personalInfo.linkedin, data.personalInfo.website].filter(Boolean);
        const isModern = style.template === 'modern';
        const boxBgClass = ColorSchemes[style.colorScheme].boxBg;

        return (
             <div className={`${fontClass} bg-white p-10`}>
                <div data-type="header">
                    <h1 className={`text-4xl font-bold ${color.text}`}>{data.personalInfo.fullName || "Your Name"}</h1>
                </div>
                <div className="flex" style={{gap: `${style.columnGap}rem`, marginTop: `${style.rowGap}rem`}}>
                    <div className="main-column" style={{width: `${100 - style.columnWidth}%`, display: 'flex', flexDirection: 'column', gap: `${style.rowGap}rem`}}>
                        {sectionOrder.filter(s => mainSections.includes(s) && sections[s]).map(renderSectionContent)}
                    </div>
                    <div className={`side-column`} style={{width: `${style.columnWidth}%`, display: 'flex', flexDirection: 'column', gap: `${style.rowGap}rem`}}>
                        <div data-type="section" data-key="contact" className={`break-inside-avoid ${isModern ? `p-4 rounded-lg ${boxBgClass}` : ''}`}>
                           <h2 className={sectionHeaderClass}>Contact</h2>
                           <div className="mt-2 space-y-1 text-sm" data-type="item">
                                {personalDetails.map(detail => <p key={detail}>{detail}</p>)}
                           </div>
                        </div>
                        {sectionOrder.filter(s => sideSections.includes(s) && sections[s]).map(renderSectionContent)}
                    </div>
                </div>
             </div>
        );
    }

    // Single Column Layout
    const personalDetails = [data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location, data.personalInfo.linkedin, data.personalInfo.website].filter(Boolean);
    return (
        <div className={`${fontClass} bg-white p-10`} style={{ display: 'flex', flexDirection: 'column', gap: `${style.rowGap}rem` }}>
            <div className="text-center break-inside-avoid-page" data-type="header">
                <h1 className={`text-3xl font-bold ${color.text}`}>{data.personalInfo.fullName || "Your Name"}</h1>
                <div className="text-center text-gray-600 break-words px-2 mt-1 text-sm">{personalDetails.join(' • ')}</div>
            </div>
            {sectionOrder.filter(s => sections[s]).map(renderSectionContent)}
        </div>
    );
};


// This component renders a single, unpaginated version of the resume for measurement purposes
const ResumeMeasurement: React.FC<{ state: ResumeState; renderId: number }> = ({ state, renderId }) => {
    return (
        <div 
          id={`measurement-container-${renderId}`}
          className="absolute top-0 left-0 -z-10 opacity-0 pointer-events-none"
          style={{ width: '210mm', fontSize: `${state.style.fontSize}pt` }}
        >
            <ResumeTemplate state={state} />
        </div>
    );
};


const ResumePreview: React.FC<{ state: ResumeState; resumeRef: React.RefObject<HTMLDivElement> }> = ({ state, resumeRef }) => {
    const [pages, setPages] = useState<React.ReactNode[]>([]);
    const [renderId, setRenderId] = useState(0);

    const fontClass = {
        Inter: 'font-sans', Roboto: 'font-[Roboto,sans-serif]',
        Lato: 'font-[Lato,sans-serif]', Montserrat: 'font-[Montserrat,sans-serif]',
    }[state.style.fontFamily];
    
    useEffect(() => {
        setRenderId(id => id + 1);
    }, [state]);

    useLayoutEffect(() => {
        const measurementNode = document.getElementById(`measurement-container-${renderId}`);
        if (!measurementNode) return;

        // Use pixels for calculation consistency, assuming 1rem = 16px
        const A4_HEIGHT_IN_PX = 1122.5;
        const PADDING_TOP_BOTTOM_PX = 80;
        const MAX_CONTENT_HEIGHT = A4_HEIGHT_IN_PX - PADDING_TOP_BOTTOM_PX;
        const rowGapInPx = state.style.rowGap * 16;

        const paginateSections = (
            sectionNodes: HTMLElement[], 
            initialContent: React.ReactNode[] = [], 
            initialHeight: number = 0
        ): React.ReactNode[][] => {
            const allPages: React.ReactNode[][] = [];
            let currentPageContent: React.ReactNode[] = [...initialContent];
            let currentPageHeight = initialHeight; // in px

            const startNewPage = () => {
                if (currentPageContent.length > 0) {
                    allPages.push(currentPageContent);
                }
                currentPageContent = [];
                currentPageHeight = 0;
            };
            
            sectionNodes.forEach((sectionNode) => {
                const sectionKey = sectionNode.dataset.key;
                const sectionTitleNode = sectionNode.querySelector('h2');
                const itemNodes = Array.from(sectionNode.querySelectorAll<HTMLElement>('[data-type="item"]'));
                
                if (!sectionTitleNode || itemNodes.length === 0) return;

                const sectionTitleHeight = sectionTitleNode.getBoundingClientRect().height + 8; // in px
                let itemsForCurrentSectionPage: React.ReactNode[] = [];
                let sectionTitleHasBeenPlaced = false;

                const renderSectionOnPage = () => {
                    if (itemsForCurrentSectionPage.length === 0) return;
                    const titleEl = <h2 key={`title-${sectionKey}-${allPages.length}`} className={sectionTitleNode.className} dangerouslySetInnerHTML={{__html: sectionTitleNode.innerHTML}} />;
                    const itemsEl = <div key={`items-${sectionKey}-${allPages.length}`} className="mt-2 space-y-3">{itemsForCurrentSectionPage}</div>;
                    const fullSectionEl = <div key={`section-${sectionKey}-${allPages.length}`}>{titleEl}{itemsEl}</div>;
                    currentPageContent.push(fullSectionEl);
                    itemsForCurrentSectionPage = [];
                    sectionTitleHasBeenPlaced = true;
                };

                for (let i = 0; i < itemNodes.length; i++) {
                    const itemNode = itemNodes[i];
                    const itemHeight = itemNode.getBoundingClientRect().height + 12; // in px, magic number includes item spacing

                    let heightOfNextChunk = itemHeight;
                    if (itemsForCurrentSectionPage.length === 0 && !sectionTitleHasBeenPlaced) {
                        heightOfNextChunk += sectionTitleHeight;
                        if (currentPageHeight > 0) { // Gap needed before a new section starts
                            heightOfNextChunk += rowGapInPx;
                        }
                    }

                    if (currentPageHeight > 0 && (currentPageHeight + heightOfNextChunk > MAX_CONTENT_HEIGHT)) {
                        if (itemsForCurrentSectionPage.length > 0) renderSectionOnPage();
                        startNewPage();
                        sectionTitleHasBeenPlaced = false;
                    }
                    
                    if (itemsForCurrentSectionPage.length === 0 && !sectionTitleHasBeenPlaced) {
                        if (currentPageHeight > 0) {
                            currentPageHeight += rowGapInPx;
                        }
                        currentPageHeight += sectionTitleHeight;
                    }
                    currentPageHeight += itemHeight;

                    const clonedItem = <div key={`${sectionKey}-item-${i}-${allPages.length}`} className={itemNode.className} dangerouslySetInnerHTML={{ __html: itemNode.innerHTML }} />;
                    itemsForCurrentSectionPage.push(clonedItem);
                }
                
                if (itemsForCurrentSectionPage.length > 0) renderSectionOnPage();
            });

            if (currentPageContent.length > 0) {
                allPages.push(currentPageContent);
            }
            return allPages;
        };
        
        const headerNode = measurementNode.querySelector<HTMLElement>('[data-type="header"]');
        const headerHeight = headerNode ? headerNode.getBoundingClientRect().height : 0;
        const clonedHeader = headerNode ? <div key="header-0" className={headerNode.className} dangerouslySetInnerHTML={{ __html: headerNode.innerHTML }} data-type='header' /> : null;
        
        const isTwoColumn = state.style.template === 'modern' || state.style.template === 'creative';

        if(isTwoColumn) {
             const sideColumnNode = measurementNode.querySelector<HTMLElement>('.side-column');
             const mainSectionNodes = Array.from(measurementNode.querySelectorAll<HTMLElement>('.main-column [data-type="section"]'));

             if(!sideColumnNode) return;
             
             const clonedSideColumn = <div key="side-col-0" className={sideColumnNode.className} style={{width: `${state.style.columnWidth}%`, display: 'flex', flexDirection: 'column', gap: `${state.style.rowGap}rem`}} dangerouslySetInnerHTML={{__html: sideColumnNode.innerHTML}} />;
             const sideColumnPlaceholder = <div key="side-col-placeholder" className={sideColumnNode.className} style={{width: `${state.style.columnWidth}%`}}></div>;
             
             // Paginate main column content, starting after header
             const mainPages = paginateSections(mainSectionNodes, [], 0);

             const finalPages: React.ReactNode[] = [];
             if (mainPages.length > 0) {
                // Page 1
                 const page1MainContent = mainPages[0];
                 const isModern = state.style.template === 'modern';
                 const page1 = (
                    <div className="p-10">
                        {clonedHeader}
                        <div className="flex" style={{gap: `${state.style.columnGap}rem`, marginTop: `${state.style.rowGap}rem`}}>
                            <div className="main-column" style={{width: `${100 - state.style.columnWidth}%`, display: 'flex', flexDirection: 'column', gap: `${state.style.rowGap}rem`}}>{page1MainContent}</div>
                            {clonedSideColumn}
                        </div>
                    </div>
                 );
                 finalPages.push(page1);

                 // Subsequent Pages
                 for(let i = 1; i < mainPages.length; i++) {
                     const subsequentPage = (
                         <div className="p-10 flex" style={{gap: `${state.style.columnGap}rem`}}>
                             <div className="main-column" style={{width: `${100 - state.style.columnWidth}%`, display: 'flex', flexDirection: 'column', gap: `${state.style.rowGap}rem`}}>{mainPages[i]}</div>
                             {isModern ? <div className={`side-column`} style={{width: `${state.style.columnWidth}%`}}></div> : sideColumnPlaceholder}
                         </div>
                     );
                     finalPages.push(subsequentPage);
                 }
             } else if(clonedHeader) { // Handle case where there is only a header and sidebar
                 finalPages.push(
                    <div className="p-10">
                        {clonedHeader}
                        <div className="flex" style={{gap: `${state.style.columnGap}rem`, marginTop: `${state.style.rowGap}rem`}}>
                             <div className="main-column" style={{width: `${100 - state.style.columnWidth}%`}}></div>
                            {clonedSideColumn}
                        </div>
                    </div>
                 )
             }
             setPages(finalPages);

        } else {
            // Single Column
            const allSectionNodes = Array.from(measurementNode.querySelectorAll<HTMLElement>('[data-type="section"]'));
            const pagesContent = paginateSections(allSectionNodes, clonedHeader ? [clonedHeader] : [], headerHeight);
            const finalPages = pagesContent.map((pageContent, index) => (
                 <div key={index} className="p-10" style={{display: 'flex', flexDirection: 'column', gap: `${state.style.rowGap}rem`}}>
                    {pageContent}
                </div>
            ));
            setPages(finalPages);
        }

    }, [renderId, state]);

    return (
        <div className="w-full h-full bg-slate-200/50 p-4 md:p-8 overflow-y-auto">
            <ResumeMeasurement state={state} renderId={renderId} />

            <div ref={resumeRef} className="flex flex-col items-center space-y-8">
                {pages.length > 0 ? pages.map((page, pageIndex) => (
                    <div
                        key={pageIndex}
                        className={`aspect-[8.5/11] w-[210mm] shadow-2xl shadow-slate-400/50 bg-white ${fontClass} overflow-hidden`}
                        style={{ fontSize: `${state.style.fontSize}pt` }}
                    >
                        {page}
                    </div>
                )) : (
                     <div className={`aspect-[8.5/11] w-[210mm] shadow-2xl shadow-slate-400/50 bg-white ${fontClass} overflow-hidden flex items-center justify-center`}>
                        <p className="text-slate-400">Your resume will appear here.</p>
                     </div>
                )}
            </div>
        </div>
    );
};

interface ResumeBuilderProps {
    onBackToHome: () => void;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ onBackToHome }) => {
    const [state, dispatch] = useReducer(resumeReducer, initialState);
    const resumeRef = useRef<HTMLDivElement>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    
    useEffect(() => {
        try {
            const savedState = localStorage.getItem('resumeState');
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                if(parsedState.data && parsedState.style) {
                    dispatch({ type: 'LOAD_STATE', payload: parsedState });
                }
            }
        } catch (error) {
            console.error("Failed to load state from localStorage", error);
        }
    }, []);

    const handleSave = () => {
        setIsSaving(true);
        try {
            localStorage.setItem('resumeState', JSON.stringify(state));
            setTimeout(() => {
                setIsSaving(false);
                setShowSaved(true);
                setTimeout(() => setShowSaved(false), 2000);
            }, 500);
        } catch (error) {
             console.error("Failed to save state to localStorage", error);
             setIsSaving(false);
        }
    };

    const handleDownloadPdf = async () => {
        const element = resumeRef.current;
        if (!element) {
            alert('Could not find resume content to download.');
            return;
        }

        const { jsPDF } = jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4',
        });

        try {
             const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                width: element.offsetWidth,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / pdfWidth;
            const totalImgHeight = canvasHeight / ratio;

            let heightLeft = totalImgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeight, undefined, 'FAST');
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
               position = position - pdfHeight;
               pdf.addPage();
               pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeight, undefined, 'FAST');
               heightLeft -= pdfHeight;
            }
            pdf.save(`${state.data.personalInfo.fullName.replace(' ','_') || 'Resume'}_Resume.pdf`);

        } catch(error) {
             console.error(`Error processing PDF:`, error);
             alert(`An error occurred while generating the PDF.`);
        }
    };
    
    return (
         <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-background to-secondary-50 font-sans text-slate-800">
            <header className="bg-white/70 backdrop-blur-lg sticky top-0 z-30 shadow-sm flex-shrink-0">
                <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                     <button onClick={onBackToHome} className="text-primary-600 hover:text-primary-700 font-semibold flex items-center group">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Home
                    </button>
                    <h1 className="text-xl font-bold text-primary-800">Resume Builder</h1>
                    <div className="flex space-x-3">
                         <button onClick={handleSave} className="flex items-center justify-center px-4 py-2 bg-white text-primary-700 font-semibold rounded-lg border border-slate-300/80 shadow-sm hover:bg-slate-50 transition-all text-sm disabled:opacity-50" disabled={isSaving}>
                            {isSaving ? <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <SaveIcon />}
                            {isSaving ? 'Saving...' : showSaved ? 'Saved!' : 'Save Draft'}
                        </button>
                        <button onClick={handleDownloadPdf} className="flex items-center px-4 py-2 bg-secondary-600 text-white font-semibold rounded-lg shadow-md shadow-secondary-500/40 hover:bg-secondary-500 transition-all text-sm">
                            <DownloadIcon /> Download PDF
                        </button>
                    </div>
                </div>
            </header>
            <main className="flex-grow flex flex-col xl:flex-row max-w-[100rem] mx-auto w-full">
                <div className="xl:w-1/3 xl:max-w-md w-full p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar flex-shrink-0">
                    <div className="space-y-6">
                        <ControlPanel state={state} dispatch={dispatch} />
                        <FormPanel state={state} dispatch={dispatch} />
                    </div>
                </div>
                <div className="flex-grow">
                    <ResumePreview state={state} resumeRef={resumeRef} />
                </div>
            </main>
         </div>
    );
};

export default ResumeBuilder;