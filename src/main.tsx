import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { TransactionsProvider } from "./context/TransactionsContext";
import { BudgetsProvider } from "./context/BudgetsContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <TransactionsProvider>
        <BudgetsProvider>
          <App />
        </BudgetsProvider>
      </TransactionsProvider>
    </BrowserRouter>
  </StrictMode>
);
