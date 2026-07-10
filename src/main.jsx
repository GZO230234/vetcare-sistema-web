import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import './index.css'
import App from './App.jsx'

const initialOptions = {
  "client-id": "BAAevGZ7FMmz5rYlTOX1fSujGPT1F7bJe8MvcYxBV-2eGbvYtR2HIAbzcWqIXM5716kfBXT2oNw_h63CvM",
  currency: "MXN",
  intent: "capture",
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PayPalScriptProvider options={initialOptions}>
      <App />
    </PayPalScriptProvider>
  </StrictMode>,
)
