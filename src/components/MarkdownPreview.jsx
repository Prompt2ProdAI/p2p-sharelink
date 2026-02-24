import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import toast from 'react-hot-toast';

// Configure marked
marked.use({
    gfm: true,
    breaks: true,
    highlight: function (code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    },
    langPrefix: 'hljs language-',
});

const MarkdownPreview = ({ content }) => {
    const previewRef = useRef(null);

    useEffect(() => {
        if (previewRef.current) {
            previewRef.current.innerHTML = marked.parse(content || '');

            // Add Copy Buttons and Spotlight to Code Blocks
            const preTags = previewRef.current.querySelectorAll('pre');
            preTags.forEach((pre) => {
                if (pre.parentNode.classList.contains('code-wrapper')) return;

                const wrapper = document.createElement('div');
                wrapper.className = 'relative group code-wrapper spotlight liquid-glass refractive-edge mt-12 mb-16 overflow-hidden tactile-bounce';

                const button = document.createElement('button');
                button.className = 'absolute top-6 right-8 p-2 rounded-xl bg-white/5 refractive-edge text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90 text-[9px] font-black uppercase tracking-widest z-20';
                button.innerText = 'Copy';

                button.addEventListener('click', () => {
                    const code = pre.querySelector('code')?.innerText || '';
                    navigator.clipboard.writeText(code);
                    toast.success('Code copied!');
                    button.innerText = 'Copied!';
                    setTimeout(() => button.innerText = 'Copy', 2000);
                });

                pre.parentNode.insertBefore(wrapper, pre);
                wrapper.appendChild(pre);
                wrapper.appendChild(button);
            });
        }
    }, [content]);

    useEffect(() => {
        const handlePointerMove = (e) => {
            const spotlights = document.querySelectorAll('.spotlight');
            spotlights.forEach(spot => {
                const rect = spot.getBoundingClientRect();
                spot.style.setProperty('--x', `${e.clientX - rect.left}px`);
                spot.style.setProperty('--y', `${e.clientY - rect.top}px`);
            });
        };
        window.addEventListener('pointermove', handlePointerMove);
        return () => window.removeEventListener('pointermove', handlePointerMove);
    }, []);

    return (
        <div
            ref={previewRef}
            className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none markdown-body"
        />
    );
};

export default MarkdownPreview;
