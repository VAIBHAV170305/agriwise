import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingView from './components/LandingView';
import FarmerDashboard from './components/FarmerDashboard';
import FarmManagement from './components/FarmManagement';
import CropRecommendationView from './components/CropRecommendationView';
import DiseaseScannerView from './components/DiseaseScannerView';
import WeatherCenterView from './components/WeatherCenterView';
import AgronomyAssistantView from './components/AgronomyAssistantView';
import MarketIntelligenceView from './components/MarketIntelligenceView';
import FarmerListingsView from './components/FarmerListingsView';
import FarmerOrdersView from './components/FarmerOrdersView';
import MarketplaceBuyer from './components/MarketplaceBuyer';
import BuyerOrdersView from './components/BuyerOrdersView';
import FpoDashboard from './components/FpoDashboard';
import AdminDashboard from './components/AdminDashboard';
import DeliveryDashboard from './components/DeliveryDashboard';
import AuthModal from './components/AuthModal';
import ErrorBoundary from './components/ErrorBoundary';
import RakshakFabWidget from './components/RakshakFabWidget';
import LogoutConfirmModal from './components/LogoutConfirmModal';
import { ToastProvider } from './context/ToastContext';
import { api, DEMO_ACCOUNTS } from './api';
import { useLanguage } from './i18n/LanguageContext';
import { 
  Home, Activity, Layers, Sparkles, Camera, CloudSun, 
  TrendingUp, ShoppingBag, Package, Users, ShieldAlert,
  Truck, Navigation, CheckCircle2
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState('Farmer');
  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState('light');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Auto-login default demo farmer on first load
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const storedUser = api.getUser();
    if (storedUser) {
      setCurrentUser(storedUser);
      setCurrentRole(storedUser.role);
    } else {
      handleRoleSwitch('Farmer');
    }
  }, [theme]);

  // Open auth modal if activeTab is 'login'
  useEffect(() => {
    if (activeTab === 'login') {
      setShowAuthModal(true);
      setActiveTab(currentUser ? 'overview' : 'landing');
    }
  }, [activeTab, currentUser]);

  const handleRoleSwitch = async (roleKey) => {
    const acc = DEMO_ACCOUNTS[roleKey];
    if (!acc) return;
    try {
      const data = await api.login(acc.email, acc.password);
      setCurrentUser(data.user);
      setCurrentRole(data.user.role);

      if (roleKey === 'Farmer') setActiveTab('overview');
      else if (roleKey === 'Buyer') setActiveTab('marketplace');
      else if (roleKey === 'Delivery') setActiveTab('delivery-ops');
      else if (roleKey === 'FPO') setActiveTab('fpo');
      else if (roleKey === 'Admin') setActiveTab('admin');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await api.logout();
    setCurrentUser(null);
    setActiveTab('landing');
  };

  const handleExitToLanding = () => {
    setShowLogoutModal(false);
    setActiveTab('landing');
  };

  const { t } = useLanguage();

  // Functionally grouped sidebar navigation items
  const getRoleTabGroups = () => {
    const role = currentRole || 'Farmer';

    if (role === 'Farmer') {
      return [
        {
          group: t('nav.groupOps', 'Farm Operations & Records'),
          items: [
            { id: 'overview', label: t('nav.overview', 'Dashboard'), icon: <Activity size={16} /> },
            { id: 'farms', label: t('nav.farms', 'Farms & Crops'), icon: <Layers size={16} /> },
          ]
        },
        {
          group: t('nav.groupDecision', 'Decision Intelligence'),
          items: [
            { id: 'crops-recommend', label: t('nav.cropsRecommend', 'Crop Advisory'), icon: <Sparkles size={16} /> },
            { id: 'disease', label: t('nav.disease', 'Disease Scanner'), icon: <Camera size={16} /> },
            { id: 'weather', label: t('nav.weather', 'Weather & Soil'), icon: <CloudSun size={16} /> },
          ]
        },
        {
          group: t('nav.groupCommerce', 'Financial Commerce'),
          items: [
            { id: 'market', label: t('nav.market', 'Demand Forecast'), icon: <TrendingUp size={16} /> },
            { id: 'listings', label: t('nav.listings', 'Produce Listings'), icon: <ShoppingBag size={16} /> },
            { id: 'orders', label: t('nav.orders', 'Orders Received'), icon: <Package size={16} /> },
          ]
        }
      ];
    } else if (role === 'Buyer') {
      return [
        {
          group: t('nav.groupBuyerCommerce', 'Produce Marketplace'),
          items: [
            { id: 'marketplace', label: t('nav.marketplace', 'Discover Produce'), icon: <ShoppingBag size={16} /> },
            { id: 'buyer-orders', label: t('nav.buyerOrders', 'My Orders & Tracking'), icon: <Package size={16} /> },
          ]
        },
        {
          group: t('nav.groupMarketIntel', 'Market Intelligence'),
          items: [
            { id: 'market', label: t('nav.market', 'Mandi Demand Trends'), icon: <TrendingUp size={16} /> },
          ]
        }
      ];
    } else if (role === 'Delivery') {
      return [
        {
          group: t('nav.groupDelivery', 'Logistics & Dispatch'),
          items: [
            { id: 'delivery-ops', label: t('nav.deliveryOps', 'Assigned Deliveries & Dispatch'), icon: <Truck size={16} /> },
            { id: 'delivery-gps', label: t('nav.deliveryGps', 'Live GPS & Route Optimization'), icon: <Navigation size={16} /> },
            { id: 'delivery-history', label: t('nav.deliveryHistory', 'Logistics History & Earnings'), icon: <CheckCircle2 size={16} /> },
          ]
        }
      ];
    } else if (role === 'FPO') {
      return [
        {
          group: t('nav.groupFpo', 'FPO Management'),
          items: [
            { id: 'fpo', label: t('nav.fpo', 'FPO Overview & Aggregated Supply'), icon: <Users size={16} /> },
            { id: 'marketplace', label: t('nav.marketplace', 'Marketplace Directory'), icon: <ShoppingBag size={16} /> },
            { id: 'market', label: t('nav.market', 'Mandi Demand Trends'), icon: <TrendingUp size={16} /> },
          ]
        }
      ];
    } else if (role === 'Admin') {
      return [
        {
          group: t('nav.groupAdmin', 'Platform Telemetry & Audit'),
          items: [
            { id: 'admin', label: t('nav.admin', 'Platform Telemetry & Audit'), icon: <ShieldAlert size={16} /> },
            { id: 'farms', label: t('nav.farms', 'Farms Directory'), icon: <Layers size={16} /> },
            { id: 'marketplace', label: t('nav.marketplace', 'Listing Moderation'), icon: <ShoppingBag size={16} /> },
          ]
        }
      ];
    }
    return [];
  };

  const tabGroups = getRoleTabGroups();
  const allTabs = tabGroups.flatMap(g => g.items);
  const activeTabObj = allTabs.find(t => t.id === activeTab);

  const isLanding = !currentUser || activeTab === 'landing';

  return (
    <ToastProvider>
      {isLanding ? (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8faf7' }}>
          {/* Landing Top Navbar */}
          <Navbar 
            isLanding={true}
            currentUser={currentUser}
            currentRole={currentRole}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onRoleSwitch={handleRoleSwitch}
            onLogout={handleLogout}
            onOpenLogin={() => setShowAuthModal(true)}
          />

          {/* Public Landing View */}
          <main style={{ flex: 1, maxWidth: '1360px', width: '100%', margin: '0 auto', padding: '0 24px 60px' }}>
            <LandingView 
              onRoleSwitch={handleRoleSwitch} 
              onLoginSuccess={() => setActiveTab('overview')} 
              onOpenLogin={() => setShowAuthModal(true)}
            />
          </main>

          {/* Platform Footer */}
          <footer style={{
            borderTop: '1px solid rgba(18, 53, 36, 0.08)',
            padding: '24px',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: '#657e70',
            background: '#ffffff'
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <strong style={{ color: '#123524' }}>agriwise FIELD DESK</strong> • Smart Agriculture, Farm Records & Market Intelligence
              </div>
              <div>
                Enterprise Agricultural Intelligence Platform
              </div>
            </div>
          </footer>
        </div>
      ) : (
        /* Logged-in App Layout: Dedicated Sidebar Navigation on the Left */
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%', maxWidth: '100vw', overflowX: 'hidden', background: '#f8faf7' }}>
          {/* Sidebar Navigation */}
          <Sidebar 
            currentUser={currentUser}
            currentRole={currentRole}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabGroups={tabGroups}
            onLogout={handleLogout}
            onOpenProfile={() => setShowProfileModal(true)}
          />

          {/* Main Workspace Area (Header + Active Module Content) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, width: 'calc(100% - 264px)', overflowX: 'hidden' }}>
            <Navbar 
              isLanding={false}
              currentUser={currentUser}
              currentRole={currentRole}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onRoleSwitch={handleRoleSwitch}
              onLogout={handleLogout}
              onOpenLogin={() => setShowAuthModal(true)}
              activeTabLabel={activeTabObj?.label}
              showProfileModal={showProfileModal}
              setShowProfileModal={setShowProfileModal}
            />

            <main style={{ flex: 1, padding: '20px 24px 60px', width: '100%', maxWidth: '1440px', boxSizing: 'border-box', margin: '0 auto' }}>
              <ErrorBoundary>
                {activeTab === 'overview' && <FarmerDashboard onNavigate={setActiveTab} />}
                {activeTab === 'farms' && <FarmManagement />}
                {activeTab === 'crops-recommend' && <CropRecommendationView />}
                {activeTab === 'disease' && <DiseaseScannerView />}
                {activeTab === 'weather' && <WeatherCenterView />}
                {activeTab === 'assistant' && <AgronomyAssistantView />}
                {activeTab === 'market' && <MarketIntelligenceView />}
                {activeTab === 'listings' && <FarmerListingsView />}
                {activeTab === 'orders' && <FarmerOrdersView />}
                {activeTab === 'marketplace' && <MarketplaceBuyer onNavigate={setActiveTab} />}
                {activeTab === 'buyer-orders' && <BuyerOrdersView onNavigate={setActiveTab} />}
                {activeTab === 'fpo' && <FpoDashboard />}
                {activeTab === 'admin' && <AdminDashboard />}
                {(activeTab === 'delivery-ops' || activeTab === 'delivery-gps' || activeTab === 'delivery-history') && (
                  <DeliveryDashboard activeSubTab={activeTab} setActiveSubTab={setActiveTab} />
                )}
              </ErrorBoundary>
            </main>

            <footer style={{
              borderTop: '1px solid rgba(18, 53, 36, 0.08)',
              padding: '16px 32px',
              fontSize: '0.78rem',
              color: '#657e70',
              background: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong style={{ color: '#123524' }}>agriwise FIELD DESK</strong> • Real-time Agronomy & Telemetry Network
              </div>
              <div style={{ color: '#7e9688' }}>
                Role: <strong>{currentRole}</strong> • Session Active
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* Persistent Rakshak AI Corner Toggle Widget (Accessible across every page) */}
      <RakshakFabWidget />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onRoleSwitch={handleRoleSwitch}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setCurrentRole(user.role);
          if (user.role === 'Farmer') setActiveTab('overview');
          else if (user.role === 'Buyer') setActiveTab('marketplace');
          else if (user.role === 'Delivery') setActiveTab('delivery-ops');
          else if (user.role === 'FPO') setActiveTab('fpo');
          else if (user.role === 'Admin') setActiveTab('admin');
          setShowAuthModal(false);
        }}
      />

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirmLogout={handleConfirmLogout}
        onExitToLanding={handleExitToLanding}
        currentUser={currentUser}
      />
    </ToastProvider>
  );
}
