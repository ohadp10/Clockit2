import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Clients from "./Clients";

import VideoUpload from "./VideoUpload";

import Schedule from "./Schedule";

import ClientConnect from "./ClientConnect";

import Settings from "./Settings";

import ClientVideos from "./ClientVideos";

import plans from "./plans";

import Analytics from "./Analytics";

import Plans from "./Plans";

import SubscriptionRequired from "./SubscriptionRequired";

import TermsOfService from "./TermsOfService";

import PrivacyPolicy from "./PrivacyPolicy";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Clients: Clients,
    
    VideoUpload: VideoUpload,
    
    Schedule: Schedule,
    
    ClientConnect: ClientConnect,
    
    Settings: Settings,
    
    ClientVideos: ClientVideos,
    
    plans: plans,
    
    Analytics: Analytics,
    
    Plans: Plans,
    
    SubscriptionRequired: SubscriptionRequired,
    
    TermsOfService: TermsOfService,
    
    PrivacyPolicy: PrivacyPolicy,
    
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
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Clients" element={<Clients />} />
                
                <Route path="/VideoUpload" element={<VideoUpload />} />
                
                <Route path="/Schedule" element={<Schedule />} />
                
                <Route path="/ClientConnect" element={<ClientConnect />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/ClientVideos" element={<ClientVideos />} />
                
                <Route path="/plans" element={<plans />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/Plans" element={<Plans />} />
                
                <Route path="/SubscriptionRequired" element={<SubscriptionRequired />} />
                
                <Route path="/TermsOfService" element={<TermsOfService />} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
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