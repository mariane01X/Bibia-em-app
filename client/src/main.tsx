import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/i18n"; // Importa a configuração do i18n
import i18n from "./lib/i18n";

// Força o idioma português
i18n.changeLanguage('pt');

createRoot(document.getElementById("root")!).render(<App />);