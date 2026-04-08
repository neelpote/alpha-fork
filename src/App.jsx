import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { WalletProvider, useWallet } from './context/WalletContext';
import { Loader2 } from 'lucide-react';

// ── Lazy-load every page — only downloads when first visited ──────────────────
const LandingPage    = lazy(() => import('./pages/LandingPage'));
const AboutPage      = lazy(() => import('./pages/AboutPage'));
const DashboardPage  = lazy(() => import('./pages/DashboardPage'));
const ConnectWallPage= lazy(() => import('./pages/ConnectWallPage'));
const StrategyPage   = lazy(() => import('./pages/StrategyPage'));
const AnalyticsPage  = lazy(() => import('./pages/AnalyticsPage'));
const DocsPage       = lazy(() => import('./pages/DocsPage'));
const BotSubmitPage  = lazy(() => import('./pages/BotSubmitPage'));

const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-[50vh]">
    <Loader2 size={32} className="animate-spin text-accent-blue" />
  </div>
);

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('App error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-6">
          <div className="glass p-10 rounded-2xl max-w-md border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
            <p className="text-gray-400 mb-6 text-sm font-mono">{this.state.error?.message}</p>
            <button onClick={() => this.setState({ hasError: false, error: null })} className="btn-primary px-6 py-2.5 rounded-xl">
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ProtectedRoute = ({ children }) => {
  const { connected } = useWallet();
  return connected ? children : <Navigate to="/connect" replace />;
};

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

const AppRoutes = () => (
  <div className="min-h-screen w-full bg-background text-gray-100 flex flex-col font-sans overflow-x-hidden">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent-blue focus:text-white focus:rounded-lg focus:text-sm focus:font-medium">
      Skip to content
    </a>
    <ScrollToTop />
    <Navbar />
    <main id="main-content" className="flex-1 flex flex-col">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"          element={<LandingPage />} />
          <Route path="/workflow"  element={<AboutPage />} />
          <Route path="/strategy"  element={<StrategyPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/docs"      element={<DocsPage />} />
          <Route path="/connect"   element={<ConnectWallPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/submit-bot" element={<BotSubmitPage />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </main>
    <Footer />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <WalletProvider>
      <Router>
        <AppRoutes />
      </Router>
    </WalletProvider>
  </ErrorBoundary>
);

export default App;
