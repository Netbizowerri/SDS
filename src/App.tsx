import React, { useEffect, useLayoutEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthService } from './services/firebase';

// Public Layout & Pages
import { PublicLayout } from './components/layout/PublicLayout';
import { Home } from './pages/Home';
import { RequestDelivery } from './pages/RequestDelivery';
import { RequestSubmitted } from './pages/RequestSubmitted';
import { Track } from './pages/Track';
import { QuotePayment } from './pages/QuotePayment';
import { PaymentResult } from './pages/PaymentResult';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { FAQ } from './pages/FAQ';
import { Terms } from './pages/Terms';
import { DemoHub } from './pages/DemoHub';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';

// Rider Portal
import { RiderLayout } from './pages/rider/RiderLayout';
import { RiderLogin } from './pages/rider/RiderLogin';
import { RiderJobs } from './pages/rider/RiderJobs';
import { RiderJobDetail } from './pages/rider/RiderJobDetail';
import { RiderSignature } from './pages/rider/RiderSignature';
import { RiderEarnings } from './pages/rider/RiderEarnings';
import { RiderProfile } from './pages/rider/RiderProfile';

// Admin Console
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminOrderDetail } from './pages/admin/AdminOrderDetail';
import { AdminRiders } from './pages/admin/AdminRiders';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminSettings } from './pages/admin/AdminSettings';

function RequireRole({ roles }: { roles: Array<'owner' | 'manager' | 'rider'> }) {
  const user = AuthService.getCurrentUser();
  if (!user) return <Navigate to={roles.includes('rider') ? '/rider/login' : '/stafflogin'} replace />;
  if (roles.includes(user.role)) return <Outlet />;
  return <Navigate to={user.role === 'rider' ? '/rider' : '/admin'} replace />;
}

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.querySelectorAll<HTMLElement>('[data-route-scroll]').forEach((element) => {
      element.scrollTop = 0;
      element.scrollLeft = 0;
    });
  }, [pathname, search]);

  return null;
}

export default function App() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    AuthService.initialize().finally(() => setAuthReady(true));
  }, []);

  if (!authReady) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Connecting to SDS…</div>;
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Website Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/request" element={<RequestDelivery />} />
          <Route path="/request/submitted" element={<RequestSubmitted />} />
          <Route path="/track" element={<Track />} />
          <Route path="/track/result" element={<Track />} />
          <Route path="/quote/:token" element={<QuotePayment />} />
          <Route path="/payment/result" element={<PaymentResult />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/demo" element={<DemoHub />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Rider Portal Routes (Mobile App Shell) */}
        <Route path="/rider/login" element={<RiderLogin />} />
        <Route element={<RequireRole roles={['rider']} />}>
          <Route path="/rider" element={<RiderLayout />}>
            <Route index element={<RiderJobs />} />
            <Route path="jobs/:id" element={<RiderJobDetail />} />
            <Route path="jobs/:id/signature" element={<RiderSignature />} />
            <Route path="earnings" element={<RiderEarnings />} />
            <Route path="profile" element={<RiderProfile />} />
          </Route>
        </Route>

        {/* Admin Console Routes */}
        <Route path="/stafflogin" element={<AdminLogin />} />
        <Route element={<RequireRole roles={['owner', 'manager']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="riders" element={<AdminRiders />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route element={<RequireRole roles={['owner']} />}>
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
