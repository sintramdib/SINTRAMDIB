import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { AdminLayout } from './components/dashboard/AdminLayout';
import { DashboardPage } from './pages/admin/DashboardPage';
import { SubscriptionsPage } from './pages/admin/SubscriptionsPage';
import { LinksPage } from './pages/admin/LinksPage';
import { PaymentsPage } from './pages/admin/PaymentsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { NewsPage } from './pages/admin/NewsPage';
import { BannersPage } from './pages/admin/BannersPage';

// Público (site do sindicato)
import { PublicLayout } from './components/public/PublicLayout';
import { HomePage } from './pages/public/HomePage';
import { SindicatoPage } from './pages/public/SindicatoPage';
import { Calculadora13Page } from './pages/public/Calculadora13Page';
import { CalculadoraIRPFPage } from './pages/public/CalculadoraIRPFPage';
import { CalculadoraRescisaoPage } from './pages/public/CalculadoraRescisaoPage';
import { BeneficiosPage } from './pages/public/BeneficiosPage';
import { JuridicoPage } from './pages/public/JuridicoPage';
import { NoticiasPage } from './pages/public/NoticiasPage';
import { ContatoPage } from './pages/public/ContatoPage';
import { SejaSocioPage } from './pages/public/SejaSocioPage';
import { ServicoPage } from './pages/public/ServicoPage';
import { SubscriptionPage } from './pages/public/SubscriptionPage';

export default function App() {
  return (
    <Routes>
      {/* Site público */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/sindicato" element={<SindicatoPage />} />
        <Route path="/convencoes" element={<Calculadora13Page />} />
        <Route path="/calculadora-rescisao" element={<CalculadoraRescisaoPage />} />
        <Route path="/calculadora-irpf" element={<CalculadoraIRPFPage />} />
        <Route path="/beneficios" element={<BeneficiosPage />} />
        <Route path="/juridico" element={<JuridicoPage />} />
        <Route path="/noticias" element={<NoticiasPage />} />
        <Route path="/contato" element={<ContatoPage />} />
        <Route path="/seja-socio" element={<SejaSocioPage />} />
        <Route path="/servicos/:slug" element={<ServicoPage />} />
      </Route>

      {/* Página pública de assinatura — sem acesso à dashboard */}
      <Route path="/assinar/:token" element={<SubscriptionPage />} />

      {/* Autenticação administrativa */}
      <Route path="/login" element={<LoginPage />} />

      {/* Dashboard administrativa */}
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/links" element={<LinksPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/cms/news" element={<NewsPage />} />
        <Route path="/cms/banners" element={<BannersPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}