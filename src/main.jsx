import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.jsx";

import "./styles/global.css";
import "./styles/dashboard.css";
import "./styles/calendario.css";
import "./styles/trabajadores.css";
import "./styles/administracion.css";
import "./styles/modal.css";
import "./styles/turno-card.css";
import "./styles/resumen.css";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);