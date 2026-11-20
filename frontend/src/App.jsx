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
import { RakshakIcon } from './components/RakshakLogo';
import RakshakFabWidget from './components/RakshakFabWidget';
import LogoutConfirmModal from './components/LogoutConfirmModal';
import { useToast } from './context/ToastContext';
import { api, DEMO_ACCOUNTS } from './api';
import { useLanguage } from './i18n/LanguageContext';
import { 
  Home, Activity, Layers, Camera, CloudSun, 
  MessageSquare, TrendingUp, ShoppingBag, Package, Users, ShieldAlert,
  Truck, Navigation, CheckCircle2
} from 'lucide-react';

export default function App() {
  const { showToast } = useToast();
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
      // Default auto-login as Farmer for immediate rich dashboard experience
      handleRoleSwitch('Farmer', false);
    }
  }, [theme]);

  // Open auth modal if activeTab is 'login'
  useEffect(() => {
    if (activeTab === 'login') {
      setShowAuthModal(true);
      setActiveTab(currentUser ? 'overview' : 'landing');
    }
  }, [activeTab, currentUser]);

  const handleRoleSwitch = async (roleKey, notify = true) => {
    const acc = DEMO_ACCOUNTS[roleKey];
    if (!acc) return;
    try {
      const data = await api.login(acc.email, acc.password);
      setCurrentUser(data.user);
      setCurrentRole(data.user.role);

      // Set default tab for role
      if (roleKey === 'Farmer') setActiveTab('overview');
      else if (roleKey === 'Buyer') setActiveTab('marketplace');
      else if (roleKey === 'Delivery') setActiveTab('delivery-ops');
      else if (roleKey === 'FPO') setActiveTab('fpo');
      else if (roleKey === 'Admin') setActiveTab('admin');

      if (notify) {
        showToast({
          title: `Switched to ${data.user.role} Persona`,
          message: `Active profile: ${data.user.name}. Dashboard synchronized.`,
          type: 'success'
        });
      }
    } catch (err) {
      console.error(err);
      showToast({
        title: 'Persona Switch Error',
        message: err.message || 'Could not switch persona.',
        type: 'critical'
      });
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setActiveTab('landing');
    showToast({
      title: 'Signed Out',
      message: 'You have been safely signed out of Agri-Wise.',
      type: 'info'
    });
  };

  const { t } = useLanguage();

  const getRoleTabs = () => {
    const role = currentRole || 'Farmer';

    if (role === 'Farmer') {
      return [
        {
          group: 'overview',
          groupLabel: t('nav.groupOverview', 'Overview'),
          tabs: [
            { id: 'overview', label: t('nav.overview', 'Decision Intelligence'), icon: <Activity size={16} /> }
          ]
        },
        {
          group: 'crop_intelligence',
          groupLabel: t('nav.groupCropIntelligence', 'Crop & Intelligence'),
          tabs: [
            { id: 'farms', label: t('nav.farms', 'Farms & Crops'), icon: <Layers size={16} /> },
            { id: 'crops-recommend', label: t('nav.cropsRecommend', 'AI Crop Recommendation'), icon: <RakshakIcon size={16} /> },
            { id: 'disease', label: t('nav.disease', 'Disease Scanner'), icon: <Camera size={16} /> },
            { id: 'weather', label: t('nav.weather', 'Weather Center'), icon: <CloudSun size={16} /> }
          ]
        },
        {
          group: 'commerce_money',
          groupLabel: t('nav.groupCommerce', 'Commerce & Mandi'),
          tabs: [
            { id: 'market', label: t('nav.market', 'Demand Forecasting'), icon: <TrendingUp size={16} /> },
            { id: 'listings', label: t('nav.listings', 'Produce Listings'), icon: <ShoppingBag size={16} /> },
            { id: 'orders', label: t('nav.orders', 'Orders Received'), icon: <Package size={16} /> }
          ]
        }
      ];
    } else if (role === 'Buyer') {
      return [
        {
          group: 'commerce_money',
          groupLabel: t('nav.groupCommerce', 'Commerce & Orders'),
          tabs: [
            { id: 'marketplace', label: t('nav.marketplace', 'Discover Produce'), icon: <ShoppingBag size={16} /> },
            { id: 'buyer-orders', label: t('nav.buyerOrders', 'My Orders & Tracking'), icon: <Package size={16} /> },
            { id: 'market', label: t('nav.market', 'Mandi Demand & Trends'), icon: <TrendingUp size={16} /> }
          ]
        }
      ];
    } else if (role === 'Delivery') {
      return [
        {
          group: 'logistics',
          groupLabel: 'Fleet & Logistics',
          tabs: [
            { id: 'delivery-ops', label: t('nav.deliveryOps', 'Assigned Deliveries & Dispatch'), icon: <Truck size={16} /> },
            { id: 'delivery-gps', label: t('nav.deliveryGps', 'Live GPS & Route Optimization'), icon: <Navigation size={16} /> },
            { id: 'delivery-history', label: t('nav.deliveryHistory', 'Logistics History & Earnings'), icon: <CheckCircle2 size={16} /> }
          ]
        }
      ];
    } else if (role === 'FPO') {
      return [
        {
          group: 'fpo_ops',
          groupLabel: 'FPO Operations',
          tabs: [
            { id: 'fpo', label: t('nav.fpo', 'FPO Overview & Supply'), icon: <Users size={16} /> },
            { id: 'marketplace', label: t('nav.marketplace', 'Marketplace Directory'), icon: <ShoppingBag size={16} /> },
            { id: 'market', label: t('nav.market', 'Mandi Demand Trends'), icon: <TrendingUp size={16} /> }
          ]
        }
      ];
    } else if (role === 'Admin') {
      return [
        {
          group: 'admin_audit',
          groupLabel: 'Platform Governance',
          tabs: [
            { id: 'admin', label: t('nav.admin', 'Platform Telemetry & Audit'), icon: <ShieldAlert size={16} /> },
            { id: 'farms', label: t('nav.farms', 'Farms Directory'), icon: <Layers size={16} /> },
            { id: 'marketplace', label: t('nav.marketplace', 'Listing Moderation'), icon: <ShoppingBag size={16} /> }
          ]
        }
      ];
    }
    return [];
  };

  const tabGroups = getRoleTabs();
  const tabs = tabGroups.flatMap(g => g.tabs);

  const handleSelectTab = (tabId) => {
    if (!currentUser) {
      const demoUser = DEMO_ACCOUNTS[currentRole || 'Farmer'];
      setCurrentUser(demoUser);
    }
    setActiveTab(tabId);
  };

  const isLanding = !currentUser || activeTab === 'landing';
  const activeTabObj = tabs.find(t => t.id === activeTab);

  if (isLanding) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fbfaf6' }}>
        {/* Landing Top Navbar (No navigation strip) */}
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
            else if (user.role === 'FPO') setActiveTab('fpo');
            else if (user.role === 'Admin') setActiveTab('admin');
            setShowAuthModal(false);
          }}
        />

        {/* Platform Footer */}
        <footer style={{
          borderTop: '1px solid rgba(27, 56, 43, 0.08)',
          padding: '24px',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#6e8276',
          background: '#f4f2eb'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <strong style={{ color: '#163326' }}>agriwise FIELD DESK</strong> • Smart Agriculture, Farm Management & Market Intelligence
            </div>
            <div>
              Enterprise Agriculture Intelligence Platform
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Logged-in App Layout: Dedicated Sidebar Navigation on the Left
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fbfaf6' }}>
      {/* Sidebar Navigation */}
      <Sidebar 
        currentUser={currentUser}
        currentRole={currentRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabGroups={tabGroups}
        tabs={tabs}
        onLogout={handleLogout}
        onRequestLogout={() => setShowLogoutModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Main Workspace Area (Header + Active Module Content) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        <Navbar 
          isLanding={false}
          currentUser={currentUser}
          currentRole={currentRole}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onRoleSwitch={handleRoleSwitch}
          onLogout={handleLogout}
          onRequestLogout={() => setShowLogoutModal(true)}
          onOpenLogin={() => setShowAuthModal(true)}
          activeTabLabel={activeTabObj?.label}
          showProfileModal={showProfileModal}
          setShowProfileModal={setShowProfileModal}
        />

        <main style={{ flex: 1, padding: '24px 32px 60px', width: '100%', maxWidth: '1440px', margin: '0 auto' }}>
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
          borderTop: '1px solid rgba(27, 56, 43, 0.08)',
          padding: '18px 32px',
          fontSize: '0.78rem',
          color: '#6e8276',
          background: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong style={{ color: '#163326' }}>agriwise FIELD DESK</strong> • Real-time Agronomy & Telemetry Network
          </div>
          <div style={{ color: '#889e90' }}>
            Role: <strong>{currentRole}</strong> • Session Active
          </div>
        </footer>
      </div>

      {/* Persistent Rakshak AI Floating Copilot (Available across every page) */}
      <RakshakFabWidget onNavigateFull={setActiveTab} />

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirmLogout={async () => {
          setShowLogoutModal(false);
          await handleLogout();
        }}
        currentUser={currentUser}
      />

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
    </div>
  );
}
