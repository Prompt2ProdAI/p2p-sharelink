import React, { useEffect, useRef, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import MarkdownPreview from '../components/MarkdownPreview';
import toast from 'react-hot-toast';

const Editor = () => {
    const [content, setContent] = useState('# Smart Editor\n\nEnter your text here. Markdown tables are supported!\n\n| Feature | Status | Description |\n| :--- | :---: | :--- |\n| Tables | ✅ | Beautifully styled |\n| Spacing | ✅ | Clean and modern |\n| Markdown | ✅ | Full GFM support |');
    const [isSaving, setIsSaving] = useState(false);
    const [focusMode, setFocusMode] = useState(false);
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
        const tableTemplate = `
| Header 1 | Header 2 | Header 3 |
| :--- | :--- | :--- |
| Row 1, Col 1 | Row 1, Col 2 | Row 1, Col 3 |
| Row 2, Col 1 | Row 2, Col 2 | Row 2, Col 3 |
`;
        setContent(prev => prev + tableTemplate);
        toast.success('Table template inserted!');
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden relative">
            <div className={`mesh-background transition-opacity duration-1000 ${focusMode ? 'opacity-20' : 'opacity-60'}`} />

            {/* Minimalist Header */}
            <header className={`h-14 flex items-center justify-between px-8 relative z-50 transition-all duration-700 ${focusMode ? 'focus-dim' : ''}`}>
                <div className="flex items-center gap-6">
                    <h1 className="text-lg gradient-text tracking-tighter opacity-80 hover:opacity-100 transition-opacity cursor-default">
                        UltraWriter
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setFocusMode(!focusMode)}
                        className="px-4 py-1 rounded-full bg-white/5 refractive-edge text-[9px] font-black tracking-widest text-slate-400 hover:text-indigo-400 transition-colors tactile-bounce"
                    >
                        FOCUS MODE: {focusMode ? 'ON' : 'OFF'}
                    </button>

                    <div ref={shareAreaRef} className="relative flex items-center gap-2">
                        <select
                            value={expiryType}
                            onChange={(e) => setExpiryType(e.target.value)}
                            className="h-8 rounded-full border border-white/10 bg-white/5 backdrop-blur px-4 text-[9px] font-black uppercase tracking-widest text-slate-400 focus:outline-none transition-all hover:bg-white/10"
                        >
                            <option value="48h">48H</option>
                            <option value="never">∞ INF</option>
                        </select>
                        <button
                            onClick={handleShare}
                            disabled={isSaving}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-full font-black text-[9px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95 tactile-bounce"
                        >
                            {isSaving ? 'Syncing...' : 'Share Link'}
                        </button>

                        {showSharePopover && shareUrl && (
                            <div className="absolute right-0 top-full mt-4 w-72 liquid-glass refractive-edge p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500/60 mb-2">Transmission Secure</p>
                                <div className="flex items-center gap-2">
                                    <input
                                        readOnly
                                        value={shareUrl}
                                        className="w-full rounded-xl bg-white/5 border border-white/5 px-4 py-3 text-[10px] text-slate-300 focus:outline-none"
                                    />
                                    <button
                                        onClick={copyShareUrl}
                                        className="rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden p-4 lg:p-8 gap-6 lg:gap-10 relative z-10">
                {/* Editor Panel */}
                <section className={`flex-1 flex flex-col overflow-hidden group transition-all duration-700 ${focusMode ? 'focus-active' : 'premium-card'}`}>
                    <div className={`h-10 flex items-center px-8 border-b border-white/5 text-[8px] font-black uppercase tracking-[0.3em] text-indigo-500/40 transition-opacity duration-700 ${focusMode ? 'opacity-0' : 'opacity-100'}`}>
                        Input Buffer
                    </div>
                    <textarea
                        className="flex-1 w-full p-10 lg:p-14 resize-none focus:outline-none bg-transparent font-mono text-sm leading-[2] text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-800 transition-all duration-700"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Begin your creative flow..."
                        spellCheck="false"
                    />
                </section>

                {/* Preview Panel */}
                <section className={`flex-1 overflow-y-auto scroll-smooth group transition-all duration-700 ${focusMode ? 'focus-dim translate-x-12' : 'premium-card'}`}>
                    <div className="h-10 flex items-center px-8 border-b border-white/5 text-[8px] font-black uppercase tracking-[0.3em] text-indigo-500/40 sticky top-0 bg-transparent backdrop-blur-md z-10">
                        Rendered Output
                    </div>
                    <article className="p-10 lg:p-14 editorial-text text-slate-800 dark:text-slate-300">
                        <MarkdownPreview content={content} />
                    </article>
                </section>
            </main>

            {/* Floating Toolbar */}
            <nav className={`floating-toolbar group tactile-bounce ${focusMode ? 'translate-y-32' : ''}`}>
                <div className="flex items-center gap-1 border-r border-white/10 pr-6 mr-6">
                    <button onClick={insertTable} className="toolbar-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" /></svg>
                        <span>Table</span>
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end mr-4">
                        <span className="text-[10px] font-black text-indigo-500/60 leading-none mb-1">DRAFT</span>
                        <span className="text-[9px] font-bold text-slate-400 leading-none">{content.length} CHARS</span>
                    </div>

                    <button
                        onClick={handleShare}
                        disabled={isSaving}
                        className="px-8 py-3 rounded-full bg-indigo-600 text-white text-[10px] font-black tracking-[0.2em] shadow-2xl shadow-indigo-500/40 hover:bg-indigo-500 hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 tactile-bounce"
                    >
                        {isSaving ? (
                            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3"><path d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        )}
                        SYNC
                    </button>
                </div>
            </nav>

            {/* Subtle Intel Sidebar */}
            <div className={`fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-50 transition-all duration-700 ${focusMode ? 'opacity-0 translate-x-12' : 'opacity-100'}`}>
                <div className="w-[1px] h-32 bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500/40 blur-[2px]" />
                </div>
            </div>
        </div>
    );
};

export default Editor;
