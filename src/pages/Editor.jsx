import React, { useEffect, useRef, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import MarkdownPreview from '../components/MarkdownPreview';
import toast from 'react-hot-toast';

const Editor = () => {
    const [content, setContent] = useState('# Smart Editor\n\nEnter your text here. Markdown tables are supported!\n\n| Feature | Status | Description |\n| :--- | :---: | :--- |\n| Tables | ✅ | Beautifully styled |\n| Spacing | ✅ | Clean and modern |\n| Markdown | ✅ | Full GFM support |');
    const [isSaving, setIsSaving] = useState(false);
    const [expiryType, setExpiryType] = useState('48h');
    const [shareUrl, setShareUrl] = useState('');
    const [showSharePopover, setShowSharePopover] = useState(false);
    const shareAreaRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (!shareAreaRef.current?.contains(event.target)) {
                setShowSharePopover(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const getShareErrorMessage = (error) => {
        const raw = String(error?.message || '').toLowerCase();
        if (raw.includes('supabase not configured')) {
            return 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_KEY to .env.';
        }
        if (raw.includes('row-level security') || raw.includes('permission denied')) {
            return 'Supabase rejected insert. Add an INSERT policy for anon users on documents (or disable RLS for testing).';
        }
        if (raw.includes('relation') && raw.includes('documents') && raw.includes('does not exist')) {
            return 'Table "documents" does not exist. Run the SQL setup from README.';
        }
        return 'Failed to create share link.';
    };

    const handleShare = async () => {
        if (!content.trim()) {
            toast.error('Cannot share empty content');
            return;
        }
        if (!supabaseConfigured) {
            toast.error('Supabase is not configured. Create .env and restart dev server.');
            return;
        }

        setIsSaving(true);
        try {
            const expiresAt = expiryType === 'never'
                ? null
                : new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
            const { data, error } = await supabase
                .from('documents')
                .insert([{ content, expires_at: expiresAt }])
                .select()
                .single();

            if (error) throw error;
            if (!data?.id) throw new Error('Insert succeeded but no document id was returned.');

            const nextShareUrl = `${window.location.origin}/view/${data.id}`;
            setShareUrl(nextShareUrl);
            setShowSharePopover(true);
            try {
                await navigator.clipboard.writeText(nextShareUrl);
                toast.success(expiryType === 'never' ? 'Link copied! Never expires.' : 'Link copied! Valid for 48 hours.');
            } catch (clipboardError) {
                console.warn('Clipboard write failed:', clipboardError);
                toast.success('Link created. Use the Copy button below Share.');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            toast.error(getShareErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    };

    const copyShareUrl = async () => {
        if (!shareUrl) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Share URL copied.');
        } catch (error) {
            console.error('Clipboard write failed:', error);
            window.prompt('Copy your share link:', shareUrl);
        }
    };

    const insertTable = () => {
        const tableTemplate = '\n\n| Header 1 | Header 2 | Header 3 |\n| :--- | :---: | ---: |\n| Row 1 Col 1 | Row 1 Col 2 | Row 1 Col 3 |\n| Row 2 Col 1 | Row 2 Col 2 | Row 2 Col 3 |\n\n';
        setContent(prev => prev + tableTemplate);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
            <header className="h-16 flex items-center justify-between px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50">
                <div className="flex items-center gap-8">
                    <h1 className="text-xl font-bold tracking-tight bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        UltraWriter
                    </h1>
                    <nav className="hidden md:flex items-center gap-4">
                        <button
                            onClick={insertTable}
                            className="text-sm font-medium text-slate-500 hover:text-indigo-500 flex items-center gap-1.5 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" /></svg>
                            Insert Table
                        </button>
                    </nav>
                </div>

                <div ref={shareAreaRef} className="relative flex items-center gap-2">
                    <select
                        value={expiryType}
                        onChange={(e) => setExpiryType(e.target.value)}
                        className="h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    >
                        <option value="48h">Expires in 48h</option>
                        <option value="never">Never expires</option>
                    </select>
                    <button
                        onClick={handleShare}
                        disabled={isSaving}
                        className="relative group px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-full font-semibold text-sm transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-95 flex items-center gap-2 overflow-hidden"
                    >
                        <span className="relative z-10">{isSaving ? 'Saving...' : 'Share Document'}</span>
                        {!isSaving && (
                            <svg className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                    {showSharePopover && shareUrl && (
                        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-3 shadow-2xl z-50">
                            <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">Share URL</p>
                            <p className="text-[11px] text-slate-400 mb-2">{expiryType === 'never' ? 'Never expires' : 'Expires in 48 hours'}</p>
                            <div className="flex items-center gap-2">
                                <input
                                    readOnly
                                    value={shareUrl}
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-700 dark:text-slate-200"
                                />
                                <button
                                    onClick={copyShareUrl}
                                    className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Editor Section */}
                <section className="flex-1 relative flex flex-col min-w-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 pointer-events-none">
                        Editor
                    </div>
                    <textarea
                        className="flex-1 w-full p-12 pt-16 resize-none focus:outline-none dark:bg-transparent bg-transparent font-mono text-base leading-relaxed text-slate-700 dark:text-slate-300 selection:bg-indigo-100 dark:selection:bg-indigo-900/40"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your amazing content here..."
                        spellCheck="false"
                    />
                    <div className="h-8 flex items-center justify-between px-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                        <span>{content.split(/\s+/).filter(Boolean).length} words</span>
                        <span>{content.length} characters</span>
                    </div>
                </section>

                {/* Preview Section */}
                <section className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50 scroll-smooth">
                    <div className="max-w-3xl mx-auto py-16 px-12">
                        <div className="bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-[2rem] p-12 min-h-[calc(100vh-12rem)] border border-slate-200/60 dark:border-slate-800/60 transition-all duration-300">
                            <MarkdownPreview content={content} />
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Editor;
