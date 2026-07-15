import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import HealthCoachApp from "../components/HealthCoachApp";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HealthCoachApp />
  </StrictMode>,
);
