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

            // Add Copy Buttons to Code Blocks
            const preTags = previewRef.current.querySelectorAll('pre');
            preTags.forEach((pre) => {
                // Create wrapper if not already wrapped
                if (pre.parentNode.classList.contains('code-wrapper')) return;

                const wrapper = document.createElement('div');
                wrapper.className = 'relative group code-wrapper';

                // Setup button
                const button = document.createElement('button');
                button.className = 'absolute top-2 right-2 p-1 rounded bg-gray-700 text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs';
                button.innerText = 'Copy';

                button.addEventListener('click', () => {
                    const code = pre.querySelector('code')?.innerText || '';
                    navigator.clipboard.writeText(code);
                    toast.success('Code copied!');
                    button.innerText = 'Copied!';
                    setTimeout(() => button.innerText = 'Copy', 2000);
                });

                // Insert wrapper
                pre.parentNode.insertBefore(wrapper, pre);
                wrapper.appendChild(pre);
                wrapper.appendChild(button);
            });
        }
    }, [content]);

    return (
        <div
            ref={previewRef}
            className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none p-4 markdown-body"
        >
            {/* Content injected via innerHTML */}
        </div>
    );
};

export default MarkdownPreview;
