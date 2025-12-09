import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './components/AuthProvider.tsx'
import { TabsProvider } from './components/tabs.tsx'
import { ToastProvider } from './components/toast.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <TabsProvider>
          <App />
        </TabsProvider>
      </ToastProvider>
    </AuthProvider>
  // </StrictMode>,
)
