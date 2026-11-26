import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { OverviewPage } from './pages/OverviewPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { ProtocolPage } from './pages/ProtocolPage';
import { ImplementationPage } from './pages/ImplementationPage';
import { DemoPage } from './pages/DemoPage';
import { EvidencePage } from './pages/EvidencePage';
import { ResultsPage } from './pages/ResultsPage';
import { TeamPage } from './pages/TeamPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/protocol" element={<ProtocolPage />} />
            <Route path="/implementation" element={<ImplementationPage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/evidence" element={<EvidencePage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
