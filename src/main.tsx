import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n"; // Initialize i18n before app renders

try {
  const root = document.getElementById("root");
  if (root) {
    createRoot(root).render(<App />);
  } else {
    console.error("Root element not found");
  }
} catch (e) {
  console.error("Failed to render app:", e);
  document.body.innerHTML = `<pre style="color:red;padding:20px">${e}</pre>`;
}
