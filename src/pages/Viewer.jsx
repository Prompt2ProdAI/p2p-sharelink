import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import MarkdownPreview from '../components/MarkdownPreview';
import toast from 'react-hot-toast';

const Viewer = () => {
    const { id } = useParams();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const { data, error } = await supabase
                    .from('documents')
                    .select('content, expires_at')
                    .eq('id', id)
                    .single();

                if (error) throw error;

                if (new Date(data.expires_at) < new Date()) {
                    setError('This document has expired.');
                } else {
                    setContent(data.content);
                }
            } catch (err) {
                console.error('Error fetching document:', err);
                if (err.message === 'Failed to fetch') {
                    setError('Connection error. Please check your network or Supabase status.');
                } else {
                    setError('Document not found or error loading.');
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDocument();
    }, [id]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(content);
        toast.success('Raw content copied!');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-900 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="mt-4 text-slate-500 font-medium animate-pulse">Retrieving document...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-slate-50 dark:bg-slate-950">
                <div className="w-24 h-24 glass dark:bg-red-500/10 rounded-full flex items-center justify-center text-4xl mb-8 animate-bounce">⚠️</div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-6 tracking-tight">{error}</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-12 max-w-md mx-auto leading-relaxed font-medium">
                    The link might be invalid or the lifetime of this temporary share has reached its limit.
                </p>
                <Link to="/" className="premium-button-primary group">
                    <span className="relative z-10 flex items-center gap-2">
                        Start a New Document
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden selection:bg-indigo-500/20">
            <div className="mesh-background opacity-40 animate-pulse" style={{ animationDuration: '20s' }} />

            <header className="h-16 flex items-center justify-between px-10 relative z-50">
                <Link to="/" className="text-[10px] font-black text-slate-500 hover:text-indigo-400 transition-colors uppercase tracking-[0.4em] tactile-bounce">
                    ← Back to Flux
                </Link>
                <div className="flex items-center gap-4">
                    <span className="text-[8px] font-black text-indigo-500/50 tracking-[0.3em] uppercase liquid-glass px-6 py-2 rounded-full">
                        Secure Transmission
                    </span>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-start p-6 lg:p-16 relative z-10 overflow-y-auto">
                <article className="w-full max-w-4xl liquid-glass rounded-[3rem] p-12 lg:p-24 mb-16 animate-in fade-in slide-in-from-bottom-10 duration-1000 editorial-text">
                    <MarkdownPreview content={content} />
                </article>

                <footer className="w-full max-w-4xl flex items-center justify-between text-[8px] font-black uppercase tracking-[0.3em] text-slate-600 pb-16 opacity-60">
                    <div className="flex gap-10">
                        <span className="hover:text-indigo-400 transition-colors cursor-default">Valid Until: {expiresAt ? new Date(expiresAt).toLocaleDateString() : 'N/A'}</span>
                        <span className="hover:text-indigo-400 transition-colors cursor-default">{content.split(/\s+/).filter(Boolean).length} Words</span>
                    </div>
                    <div className="tracking-[0.5em] group cursor-default">
                        Infinite Aesthetic V3 <span className="text-indigo-500 group-hover:animate-ping inline-block ml-2">●</span>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default Viewer;
