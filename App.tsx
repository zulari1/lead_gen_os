import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import Leads from './pages/Leads';
import Agents from './pages/Agents';
import Inbox from './pages/Inbox';
import Outreach from './pages/Outreach';
import Meetings from './pages/Meetings';
import WebsiteAI from './pages/WebsiteAI';
import Knowledge from './pages/Knowledge';
import Workflow from './pages/Workflow';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/outreach" element={<Outreach />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/web-ai" element={<WebsiteAI />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/workflow" element={<Workflow />} />
          <Route path="/settings" element={<Settings />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;