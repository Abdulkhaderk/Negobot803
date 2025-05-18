
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add a loader element for initial animation
const rootElement = document.getElementById("root")!;
rootElement.className = "initial-load";

// Create a loader element
const loaderElement = document.createElement("div");
loaderElement.className = "fixed inset-0 bg-background flex flex-col items-center justify-center z-50";
loaderElement.innerHTML = `
  <div class="animate-scale-in flex flex-col items-center">
    <div class="nego-logo-large animate-pulse inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 p-1 w-24 h-24">
      <div class="bg-white dark:bg-gray-900 rounded-full w-full h-full flex items-center justify-center">
        <span class="font-bold text-4xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          N
        </span>
      </div>
    </div>
    <h1 class="text-3xl font-bold mt-4 animate-fade-in">NEGO</h1>
    <p class="text-muted-foreground animate-fade-in">AI-Powered Price Negotiation</p>
  </div>
`;

document.body.appendChild(loaderElement);

// Render app with a small delay for the loading animation
setTimeout(() => {
  createRoot(rootElement).render(<App />);
  
  // Remove loader after app is loaded
  setTimeout(() => {
    loaderElement.classList.add("animate-fade-out");
    setTimeout(() => {
      document.body.removeChild(loaderElement);
    }, 500);
  }, 1000);
}, 1500);
