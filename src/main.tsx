
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add a small delay for the initial animation to be noticeable
const rootElement = document.getElementById("root")!;
rootElement.className = "initial-load";

createRoot(rootElement).render(<App />);
