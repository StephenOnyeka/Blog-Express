import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Note: StrictMode removed for ReactQuill v2 compatibility with React 19.
// ReactQuill v2 uses findDOMNode internally which is unavailable in StrictMode.
createRoot(document.getElementById('root')!).render(
  <App />
)
