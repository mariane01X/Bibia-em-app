import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/i18n";
import i18n from "./lib/i18n";

// Registra o service worker para funcionalidade PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado com sucesso:', registration);
      })
      .catch(error => {
        console.error('Falha ao registrar Service Worker:', error);
      });
  });
}

// Força o idioma português
i18n.changeLanguage('pt');

createRoot(document.getElementById("root")!).render(<App />);