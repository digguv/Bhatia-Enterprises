import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyOrders from './pages/MyOrders';
import Schemes from './pages/Schemes';
import Complaints from './pages/Complaints';
import NewProducts from './pages/NewProducts';
import AdminPending from './pages/AdminPending';
import AllProducts from './pages/AllProducts';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Feedback from './pages/Feedback';
import AdminFeedback from './pages/AdminFeedback';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

const HomeRoute = () => {
  const { user } = useAuth();
  return user?.role === 'admin' ? <Dashboard /> : <AllProducts />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><HomeRoute /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
            <Route path="/schemes" element={<ProtectedRoute><Schemes /></ProtectedRoute>} />
            <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
            <Route path="/new-products" element={<ProtectedRoute><NewProducts /></ProtectedRoute>} />
            <Route path="/all-products" element={<ProtectedRoute><AllProducts /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
            <Route path="/admin/pending" element={<ProtectedRoute><AdminPending /></ProtectedRoute>} />
            <Route path="/admin/feedback" element={<ProtectedRoute><AdminFeedback /></ProtectedRoute>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
