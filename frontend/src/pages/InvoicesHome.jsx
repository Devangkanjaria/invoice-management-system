import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Corrected Named Import from your services folder
import { getInvoices, deleteInvoice } from "../../services/api";
import "./invoice.css"; // Ensure path is correct

export default function InvoicesHome() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ================= FETCH DATA FROM MYSQL ================= */
  useEffect(() => {
    async function loadInvoices() {
      try {
        setLoading(true);
        const res = await getInvoices();

        // Safety check to ensure data is an array before setting state
        setInvoices(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("API Error:", err);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, []);

  /* ================= DELETE FROM MYSQL ================= */
  async function handleDelete(id) {
    if (!window.confirm("Delete invoice? This cannot be undone.")) return;

    try {
      await deleteInvoice(id);
      // Update local state so the UI removes the item immediately
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    } catch (err) {
      alert("Failed to delete invoice from server.");
    }
  }

  /* ================= UI RENDERING ================= */
  return (
    <div className="app-container">
      <header className="top">
        <div className="company">GAREAGEWALA</div>
        <h1 className="title">Invoices</h1>
      </header>

      <section className="add-area">
        <div>
          <div className="add-text">Create and manage invoices</div>
          <div className="subtitle">Click + to add a new invoice</div>
        </div>
        <button className="plus-btn" onClick={() => navigate("/invoice/new")}>
          +
        </button>
      </section>

      <section className="list">
        {loading ? (
          <div className="empty">Loading from database...</div>
        ) : invoices.length === 0 ? (
          <div className="empty">No invoices yet.</div>
        ) : (
          invoices.map((inv) => (
            <div key={inv.id} className="task-card">
              <div className="invoice-info">
                <div className="invoice-title">
                  {inv.invoiceNumber} • {inv.customerName}
                </div>
                <div className="muted">
                  {new Date(inv.date).toLocaleDateString()}
                </div>
              </div>

              <div className="invoice-amount">
                {formatCurrency(inv.finalAmount)}
              </div>

              {/* view  */}
              <div className="actions">
                <button
                  className="small"
                  onClick={() => navigate(`/invoice/${inv.id}/view`)}
                >
                  View
                </button>

                {/* edit */}
                <button
                  className="small warning"
                  onClick={() => navigate(`/invoice/${inv.id}/edit`)}
                >
                  Edit
                </button>

                {/* delete */}
                <button
                  className="small danger"
                  onClick={() => handleDelete(inv.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

/* ===== Helper ===== */
function formatCurrency(value) {
  if (value == null) return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);
}
