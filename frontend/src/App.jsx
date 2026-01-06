import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import InvoicesHome from "./pages/InvoicesHome";
import InvoiceForm from "./pages/InvoiceForm";
import InvoiceView from "./pages/InvoiceView";
import InvoiceEdit from "./pages/InvoiceEdit";

export default function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Invoice Routes */}
      <Route path="/invoice" element={<InvoicesHome />} />
      <Route path="/invoice/new" element={<InvoiceForm />} />
      <Route path="/invoice/:id/edit" element={<InvoiceEdit />} />
      <Route path="/invoice/:id/view" element={<InvoiceView />} />

      {/* FALLBACK / TOP PROJECT POSTER UI */}
      <Route
        path="*"
        element={
          <div className="poster-container">
            <div className="poster-card">
              <div className="status-badge">API STATUS: OK</div>
              <h1>GARAGE MANAGEMENT SYSTEM</h1>
              <p className="subtitle">
                Your Inventory. Your Invoices. Optimized.
              </p>

              <div className="tech-stack">
                <span>Node.js</span> • <span>Express</span> • <span>Knex</span>{" "}
                • <span>React</span> • <span>MySQL</span>
              </div>

              <div className="poster-actions">
                <button
                  className="btn-primary-large"
                  onClick={() => navigate("/invoice")}
                >
                  Enter Dashboard
                </button>
              </div>
            </div>
          </div>
        }
      />
    </Routes>
  );
}
