import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Editor from './pages/Editor';
import Viewer from './pages/Viewer';

// Import highlight.js styles
import 'highlight.js/styles/atom-one-dark.css';

function App() {
    return (
        <Router>
            <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500 selection:bg-indigo-500/20">
                <div className="mesh-background" />
                <div className="relative z-10 w-full h-full">
                    <Routes>
                        <Route path="/" element={<Editor />} />
                        <Route path="/view/:id" element={<Viewer />} />
                    </Routes>
                </div>
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        className: 'liquid-glass refractive-edge dark:text-white dark:border-white/10 rounded-3xl shadow-2xl',
                        duration: 5000,
                    }}
                />
            </div>
        </Router>
    );
}

export default App;
