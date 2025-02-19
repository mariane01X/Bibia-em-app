import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/i18n"; // Importa a configuração do i18n

createRoot(document.getElementById("root")!).render(<App />);