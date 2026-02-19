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
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <Routes>
                    <Route path="/" element={<Editor />} />
                    <Route path="/view/:id" element={<Viewer />} />
                </Routes>
                <Toaster position="bottom-right" />
            </div>
        </Router>
    );
}

export default App;
