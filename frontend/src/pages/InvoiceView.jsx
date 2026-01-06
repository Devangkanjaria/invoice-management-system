import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import products from "../data/products.json";
import * as api from "../../services/api"; // Your Axios service
import "./invoice.css";

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. Change from Redux to local state
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbProducts, setDbProducts] = useState([]);

  // 2. Fetch data from MySQL on component mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);

        // Parallel fetch: Get both the invoice and the latest product list from SQL
        const [invoiceRes, productsRes] = await Promise.all([
          api.getInvoiceById(id),
          api.fetchAllProducts(), // Ensure this API points to your SQL products table
        ]);

        if (invoiceRes.data) setInvoice(invoiceRes.data);
        if (productsRes.data) setDbProducts(productsRes.data);
      } catch (err) {
        console.error("Fetch Error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, [id]);
  if (loading)
    return (
      <div className="form-page">
        <div className="form-card">Loading...</div>
      </div>
    );

  if (!invoice) {
    return (
      <div className="form-page">
        <div className="form-card">
          <h2>Invoice not found</h2>
          <p>The ID {id} does not exist in the database.</p>
          <button className="btn ghost" onClick={() => navigate("/invoice")}>
            Back to List
          </button>
        </div>
      </div>
    );
  }

  /* Helper to format currency */ 
  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(val || 0);

  const getProductName = (pId) => {
    // 1. If the API hasn't returned the products yet, show "Loading..."
    if (!dbProducts || dbProducts.length === 0) {
      return "Loading...";
    }

    // 2. Convert the ID from the invoice item to a Number
    const targetId = Number(pId);

    // 3. Find the product where the numeric IDs match
    const found = dbProducts.find((p) => p.id === targetId);

    // Debugging: Open your browser console (F12) to see these logs
    // console.log("Searching for ID:", targetId, "Found:", found?.name);

    return found ? found.name : "Unknown Product";
  };
  return (
    <div className="view-page-wrapper">
      <div className="invoice-display-card">
        {/* Header Section */}
        <header className="invoice-header">
          <div>
            <div className="company">GAREAGEWALA</div>
            <h2>Invoice {invoice.invoiceNumber}</h2>
            <div className="muted">
              {new Date(invoice.date).toLocaleDateString()}
            </div>
          </div>
          <div className="actions">
            <button
              className="btn-primary"
              onClick={() => navigate(`/invoice/${id}/edit`)}
            >
              Edit Invoice
            </button>
            <button className="btn-ghost" onClick={() => navigate("/invoice")}>
              Back
            </button>
          </div>
        </header>

        {/* Customer Information */}
        <section className="customer-info">
          <div className="subtitle">BILL TO</div>
          <strong>{invoice.customerName}</strong>
          <div>{invoice.customerMobile}</div>
          <div className="muted">{invoice.address}</div>
        </section>

        {/* Items Table */}
        <table className="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items &&
              invoice.items.map((item, index) => (
                <tr key={index}>
                  {/* Using productName from backend JOIN */}
                  <td>{item.productName || "Product Not Found"}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.price)}</td>
                  <td>{formatCurrency(item.total)}</td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Totals Summary */}
        <section className="totals-section">
          <div className="summary-line">
            <span>Subtotal:</span>
            <span>{formatCurrency(invoice.subTotal)}</span>
          </div>
          <div className="summary-line">
            <span>Discount:</span>
            <span>-{formatCurrency(invoice.discountAmount)}</span>
          </div>
          <div className="final-amount">
            <span>Total:</span>
            <span>{formatCurrency(invoice.finalAmount)}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
