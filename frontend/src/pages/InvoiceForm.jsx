import React, { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as api from "../../services/api";
import "./invoice.css";

const toNumber = (v) => Number(v || 0);

export default function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const todayISO = new Date().toISOString().slice(0, 10);

  const [topError, setTopError] = useState("");
  const [products, setProducts] = useState([]); // State for SQL products

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      invoiceNumber: `INV-${Date.now()}`,
      date: todayISO,
      customerName: "",
      customerMobile: "",
      address: "",
      discountPercent: 2,
      items: [{ productId: "", description: "", quantity: 1, price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = useWatch({ control, name: "items" }) || [];
  const discountPercent = useWatch({ control, name: "discountPercent" }) || 0;

  // --- NEW: Load Products from SQL ---
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.fetchAllProducts();
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setTopError("Failed to load product list from database.");
      }
    };
    loadProducts();
  }, []);

  // Load Invoice for Editing
  useEffect(() => {
    if (!id) return;
    const loadInvoice = async () => {
      try {
        const response = await api.getInvoiceById(id);
        reset(response.data);
      } catch (err) {
        setTopError("Could not load invoice from database.");
        navigate("/invoice");
      }
    };
    loadInvoice();
  }, [id, reset, navigate]);

  const subTotal = useMemo(
    () =>
      items.reduce(
        (sum, i) => sum + toNumber(i.quantity) * toNumber(i.price),
        0
      ),
    [items]
  );

  const discountAmount = subTotal * (toNumber(discountPercent) / 100);
  const finalAmount = subTotal - discountAmount;

  /*Product selection logic for numeric IDs */
  function handleProductSelect(index, productId) {
   // Convert productId to Number to match the SQL INT type
  const selectedId = Number(productId);
  const product = products.find((p) => Number(p.id) === selectedId);

  if (product) {
    setValue(`items.${index}.price`, product.price);
    setValue(`items.${index}.description`, product.description || "");
  } else {
    // Reset if "Select Product" is chosen
    setValue(`items.${index}.price`, 0);
    setValue(`items.${index}.description`, "");
  }
  }
 /* ================= 5. SUBMIT TO API (FIXED) ================= */
async function onSubmit(data) {
  // 1. Calculate totals properly before sending
  const calculatedSubTotal = data.items.reduce(
    (sum, i) => sum + toNumber(i.quantity) * toNumber(i.price),
    0
  );
  const calculatedDiscountAmount = calculatedSubTotal * (toNumber(data.discountPercent) / 100);
  const calculatedFinalAmount = calculatedSubTotal - calculatedDiscountAmount;

  const payload = {
    // Top level invoice data
    invoiceNumber: data.invoiceNumber,
    date: data.date,
    customerName: data.customerName,
    customerMobile: data.customerMobile,
    address: data.address,
    discountPercent: toNumber(data.discountPercent),
    subTotal: Number(calculatedSubTotal.toFixed(2)),
    discountAmount: Number(calculatedDiscountAmount.toFixed(2)),
    finalAmount: Number(calculatedFinalAmount.toFixed(2)),

    // CRITICAL FIX HERE:
    items: data.items.map((i) => ({
      // Convert productId back to Number for the Database INT column
      productId: Number(i.productId), 
      
      // Ensure description is a string (handle nulls)
      description: i.description || "", 
      
      // Ensure numbers are numbers
      quantity: toNumber(i.quantity),
      price: toNumber(i.price),
      total: toNumber(i.quantity) * toNumber(i.price),
    })),
  };

  try {
    if (id) {
      await api.updateInvoice(id, payload);
      alert("Invoice updated successfully!"); // Feedback for user
    } else {
      const res = await api.createInvoice(payload);
      payload.id = res.data.id;
    }
    // Redirect to view
    navigate(`/invoice/${id || payload.id}/view`);
  } catch (err) {
    console.error(err);
    setTopError(err.response?.data?.error || "Failed to save. Check Backend Console.");
  }
}

  return (
    <div className="app-container">
      <header className="top" style={{ marginBottom: "20px" }}>
        <div className="company">GARAGEWALA</div>
        <h1 className="title">{id ? "Edit Invoice" : "New Invoice"}</h1>
      </header>

      <div className="form-card card-shadow">
        {topError && <div className="error-box">{topError}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Form Header: Inv No & Date */}
          <div
            className="form-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div className="form-group">
              <label className="muted">Invoice Number</label>
              <input
                {...register("invoiceNumber")}
                className="input-field"
                readOnly={!!id}
              />
            </div>
            <div className="form-group">
              <label className="muted">Date</label>
              <input
                type="date"
                {...register("date")}
                className="input-field"
                max={todayISO}
              />
            </div>
          </div>

          {/* Customer Section */}
          <div className="customer-section" style={{ marginBottom: "30px" }}>
            <input
              {...register("customerName", { required: "Name required" })}
              placeholder="Customer Name"
              className={`input-field main-input ${
                errors.customerName ? "is-invalid" : ""
              }`}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              <input
                {...register("customerMobile", {
                  required: "Mobile required",
                  pattern: /^[0-9]{10}$/,
                })}
                placeholder="Mobile Number"
                className={`input-field ${
                  errors.customerMobile ? "is-invalid" : ""
                }`}
              />
              <textarea
                {...register("address")}
                placeholder="Customer Address"
                className="input-field"
                rows="1"
              />
            </div>
          </div>

          <h3 className="section-title">Line Items</h3>

          <div className="item-grid-header">
            <div>Product</div>
            <div>Description</div>
            <div>Qty</div>
            <div>Price</div>
            <div style={{ textAlign: "right" }}>Amount</div>
            <div></div>
          </div>

          {fields.map((field, idx) => {
            const rowTotal =
              toNumber(items[idx]?.quantity) * toNumber(items[idx]?.price);
            return (
              <div key={field.id} className="item-grid-row">
                <select
                  {...register(`items.${idx}.productId`, { required: true })}
                  className={`input-field ${
                    errors.items?.[idx]?.productId ? "is-invalid" : ""
                  }`}
                  onChange={(e) => handleProductSelect(idx, e.target.value)}
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  {...register(`items.${idx}.description`)}
                  placeholder="Details"
                  className="input-field"
                />

                <input
                  type="number"
                  {...register(`items.${idx}.quantity`, {
                    required: true,
                    min: 1,
                  })}
                  className={`input-field ${
                    errors.items?.[idx]?.quantity ? "is-invalid" : ""
                  }`}
                />

                <input
                  type="number"
                  step="0.01"
                  {...register(`items.${idx}.price`, {
                    required: true,
                    min: 1,
                  })}
                  className={`input-field ${
                    errors.items?.[idx]?.price ? "is-invalid" : ""
                  }`}
                />

                <div
                  className="amount-display"
                  style={{ textAlign: "right", fontWeight: "bold" }}
                >
                  ₹{rowTotal.toFixed(2)}
                </div>

                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => remove(idx)}
                >
                  ✕
                </button>
              </div>
            );
          })}

          <button
            type="button"
            className="plus-btn-small"
            onClick={() =>
              append({ productId: "", description: "", quantity: 1, price: 0 })
            }
            style={{ marginTop: "15px" }}
          >
            + Add Product
          </button>

          {/* Summary Section */}
          <div
            className="summary-card"
            style={{    
              marginTop: "30px",
              background: "#fcfcfc",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <div className="summary-line">
              <span>Subtotal</span> <span>₹{subTotal.toFixed(2)}</span>
            </div>
            <div className="summary-line">
              <span
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                Discount (%)
                <input
                  type="number"
                  {...register("discountPercent")}
                  style={{ width: "50px", padding: "2px" }}
                />
              </span>
              <span className="danger">DiscountAmount -₹{discountAmount.toFixed(2)}</span>
            </div>
            <div
              className="summary-line total-line"
              style={{
                fontSize: "1.4rem",
                borderTop: "2px solid #eee",
                paddingTop: "10px",
                marginTop: "10px",
                
              }}
            >
              <strong style={{color:"black"}}>Grand Total</strong>
              <strong style={{color:"black"}}>₹{finalAmount.toFixed(2)}</strong>
            </div>  
          </div>

          <button
            className="btn-submit-main"
            type="submit"
            disabled={isSubmitting}
            style={{ width: "100%", marginTop: "20px", padding: "15px" }}
          >
            {isSubmitting
              ? "Processing..."
              : id
              ? "💾 Update Invoice"
              : "✅ Generate Invoice"}
          </button>
        </form>
      </div>
    </div>
  );
}
