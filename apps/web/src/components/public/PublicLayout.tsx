import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { SiteProvider } from './SiteProvider';

/** Layout público do site (header + conteúdo + footer). */
export function PublicLayout() {
  return (
    <SiteProvider>
      <div className="pub-site flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </SiteProvider>
  );
}