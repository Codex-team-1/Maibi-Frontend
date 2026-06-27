import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import { ConfigProvider } from '@/store/useConfig';
import { useAuth } from '@/store/useAuth';
import { LanguageProvider } from '@/i18n';
import '@/styles/index.css';

function App() {
  // Validate any persisted admin token once on startup.
  useEffect(() => {
    void useAuth.getState().bootstrap();
  }, []);

  return (
    <LanguageProvider>
      <ConfigProvider>
        <RouterProvider router={router} />
      </ConfigProvider>
    </LanguageProvider>
  );
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
