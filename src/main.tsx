import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './services/store/store.ts'



import 'react-toastify/dist/ReactToastify.css'
import CustomToast from './components/ui/CustomToast.tsx'
import { AuthBootstrap } from './config/AuthBootstrap.tsx'

createRoot(document.getElementById('root')!).render(
 <StrictMode>
    <Provider store={store}>
      <AuthBootstrap>
        <App />
      </AuthBootstrap>
      <CustomToast />
    </Provider>
  </StrictMode>
)
