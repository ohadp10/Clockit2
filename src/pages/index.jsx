import Layout from "./Layout.jsx";

import Auth from "./Auth";

import ResetPassword from "./ResetPassword";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import ProtectedRoute from '@/routes/ProtectedRoute';
import LegacyDashboard from '@/legacyB/pages/Dashboard';
import LegacyLayout from '@/legacyB/pages/Layout.jsx';
import LegacyClients from '@/legacyB/pages/Clients.jsx';
import LegacySchedule from '@/legacyB/pages/Schedule.jsx';
import LegacyUpload from '@/legacyB/pages/VideoUpload.jsx';
import LegacyAnalytics from '@/legacyB/pages/Analytics.jsx';
import LegacySettings from '@/legacyB/pages/Settings.jsx';
import LegacyPlans from '@/legacyB/pages/plans.jsx';
import LegacyTermsOfService from '@/legacyB/pages/TermsOfService.jsx';
import LegacyPrivacyPolicy from '@/legacyB/pages/PrivacyPolicy.jsx';
import LegacyClientVideos from '@/legacyB/pages/ClientVideos.jsx';
import LegacyClientConnect from '@/legacyB/pages/ClientConnect.jsx';

const PAGES = {
    
    Auth: Auth,
    
    ResetPassword: ResetPassword,
    Dashboard: LegacyDashboard,
    
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
                
                    <Route path="/" element={<Auth />} />
                
                
                <Route path="/auth" element={<Auth />} />
                <Route path="/Auth" element={<Auth />} />
                
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/ResetPassword" element={<ResetPassword />} />
                
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <LegacyLayout currentPageName={'Dashboard'}>
                        <LegacyDashboard />
                      </LegacyLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/clients"
                  element={
                    <ProtectedRoute>
                      <LegacyLayout currentPageName={'Clients'}>
                        <LegacyClients />
                      </LegacyLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/schedule"
                  element={
                    <ProtectedRoute>
                      <LegacyLayout currentPageName={'Schedule'}>
                        <LegacySchedule />
                      </LegacyLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/upload"
                  element={
                    <ProtectedRoute>
                      <LegacyLayout currentPageName={'VideoUpload'}>
                        <LegacyUpload />
                      </LegacyLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/video-upload"
                  element={
                    <ProtectedRoute>
                      <LegacyLayout currentPageName={'VideoUpload'}>
                        <LegacyUpload />
                      </LegacyLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <LegacyLayout currentPageName={'Analytics'}>
                        <LegacyAnalytics />
                      </LegacyLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <LegacyLayout currentPageName={'Settings'}>
                        <LegacySettings />
                      </LegacyLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/plans"
                  element={
                    <ProtectedRoute>
                      <LegacyLayout currentPageName={'Plans'}>
                        <LegacyPlans />
                      </LegacyLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/client-videos"
                  element={
                    <ProtectedRoute>
                      <LegacyLayout currentPageName={'ClientVideos'}>
                        <LegacyClientVideos />
                      </LegacyLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/client-connect"
                  element={
                    <ProtectedRoute>
                      <LegacyLayout currentPageName={'ClientConnect'}>
                        <LegacyClientConnect />
                      </LegacyLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/terms-of-service"
                  element={
                    <LegacyLayout currentPageName={'TermsOfService'}>
                      <LegacyTermsOfService />
                    </LegacyLayout>
                  }
                />

                <Route
                  path="/privacy-policy"
                  element={
                    <LegacyLayout currentPageName={'PrivacyPolicy'}>
                      <LegacyPrivacyPolicy />
                    </LegacyLayout>
                  }
                />
                
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
