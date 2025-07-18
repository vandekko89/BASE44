import Layout from "./Layout.jsx";

import AI from "./AI";

import Logs from "./Logs";

import Backtest from "./Backtest";

import Settings from "./Settings";

import Support from "./Support";

import BinaryTerminal from "./BinaryTerminal";

import DerivAPIResearch from "./DerivAPIResearch";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    AI: AI,
    
    Logs: Logs,
    
    Backtest: Backtest,
    
    Settings: Settings,
    
    Support: Support,
    
    BinaryTerminal: BinaryTerminal,
    
    DerivAPIResearch: DerivAPIResearch,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<AI />} />
                
                
                <Route path="/AI" element={<AI />} />
                
                <Route path="/Logs" element={<Logs />} />
                
                <Route path="/Backtest" element={<Backtest />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Support" element={<Support />} />
                
                <Route path="/BinaryTerminal" element={<BinaryTerminal />} />
                
                <Route path="/DerivAPIResearch" element={<DerivAPIResearch />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}