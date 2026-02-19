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
                setError('Document not found or error loading.');
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
                <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-4xl mb-6">⚠️</div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">{error}</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">
                    The link might be invalid or the lifetime of this temporary share has reached its limit.
                </p>
                <Link to="/" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition-all shadow-lg shadow-indigo-500/25 active:scale-95">
                    Start a New Document
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            <header className="h-16 flex items-center justify-between px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
                <Link to="/" className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        UltraWriter
                    </h1>
                </Link>
                <div className="flex items-center gap-4">
                    <button
                        onClick={copyToClipboard}
                        className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                    >
                        Copy Raw
                    </button>
                    <Link
                        to="/"
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold text-sm transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
                    >
                        New Shared Doc
                    </Link>
                </div>
            </header>

            <main className="flex-1 py-16 px-6 md:px-12">
                <article className="max-w-4xl mx-auto bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200 dark:shadow-none rounded-[2.5rem] p-12 md:p-20 border border-slate-200/60 dark:border-slate-800/60 transition-all duration-300">
                    <MarkdownPreview content={content} />
                </article>
                <footer className="mt-12 text-center text-slate-400 text-xs font-medium tracking-widest uppercase">
                    Temporary shared document • expires soon
                </footer>
            </main>
        </div>
    );
};

export default Viewer;
