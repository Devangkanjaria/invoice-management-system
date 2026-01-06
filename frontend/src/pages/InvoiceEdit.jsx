import React, { useEffect, useState, useMemo } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as api from "../../services/api";
// Assuming products are still coming from your local JSON for now
import "./invoice.css";

const toNumber = (v) => Number(v || 0);

export default function InvoiceEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [products, setProducts] = useState([]);

  /* ================= 1. FORM SETUP ================= */
  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      invoiceNumber: "",
      date: "",
      customerName: "",
      customerMobile: "",
      address: "",
      discountPercent: 0,
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  /* ================= 2. FETCH & FILL DATA ================= */

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [productRes, invoiceRes] = await Promise.all([
          api.fetchAllProducts(),
          api.getInvoiceById(id),
        ]);

        setProducts(productRes.data);

        const formattedData = {
          ...invoiceRes.data,
          date: invoiceRes.data.date ? invoiceRes.data.date.split("T")[0] : "",
          // FIX: Ensure productId is a STRING so the <select> can match the value
          items: invoiceRes.data.items.map((item) => ({
            ...item,
            productId: String(item.product_id || item.productid || ""),
            quantity: Number(item.quantity || 1),
            price: Number(item.price || 0),
            description: item.description || "",
          })),
        };

        reset(formattedData);
      } catch (err) {
        console.error("Fetch error:", err);
        setServerError("Could not load data from the database.");
      }
    };
    loadAllData();
  }, [id, reset]);
  /* ================= 3. CALCULATIONS ================= */
  const watchedItems = useWatch({ control, name: "items" }) || [];
  const discountPercent = useWatch({ control, name: "discountPercent" }) || 0;

  const subTotal = useMemo(() => {
    return watchedItems.reduce(
      (sum, item) => sum + toNumber(item.quantity) * toNumber(item.price),
      0
    );
  }, [watchedItems]);

  const discountAmount = subTotal * (toNumber(discountPercent) / 100);
  const finalAmount = subTotal - discountAmount;

  /* ================= 4. PRODUCT SELECTION LOGIC ================= */
  const handleProductChange = (index, productId) => {
    // Convert both to string to ensure a perfect match
    const selectedProd = products.find(
      (p) => String(p.id) === String(productId)
    );

    if (selectedProd) {
      setValue(`items.${index}.price`, selectedProd.price);
      // Optional: Also set description if your SQL product has one
      if (selectedProd.description) {
        setValue(`items.${index}.description`, selectedProd.description);
      }
    }
  };

  /* ================= 5. SUBMIT TO API (FIXED) ================= */
  async function onSubmit(data) {
    // Safety check: Filter out items that have no Product ID selected
    const validItems = data.items.filter(
      (i) => i.productId && Number(i.productId) > 0
    );

    if (validItems.length === 0) {
      setTopError("Please select at least one product.");
      return;
    }

    // 1. Calculate totals properly before sending
    const calculatedSubTotal = validItems.reduce(
      (sum, i) => sum + toNumber(i.quantity) * toNumber(i.price),
      0
    );
    const calculatedDiscountAmount =
      calculatedSubTotal * (toNumber(data.discountPercent) / 100);
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

      items: validItems.map((i) => ({
        // FIX: Ensure we are sending a valid integer
        id: i.id,
        productId: parseInt(i.productId),
        description: i.description || "",
        quantity: toNumber(i.quantity),
        price: toNumber(i.price),
        total: toNumber(i.quantity) * toNumber(i.price),
      })),
    };

    console.log("Sending Payload:", payload); // Debugging: Check console to see what is being sent

    try {
      if (id) {
        await api.updateInvoice(id, payload);
        alert("Invoice updated successfully!");
      } else {
        const res = await api.createInvoice(payload);
        payload.id = res.data.id;
      }
      // Redirect to view
      navigate(`/invoice`); // Redirecting to main list often causes fewer 404s
    } catch (err) {
      console.error(err);
      // Detailed error logging
      const backendMessage =
        err.response?.data?.message || err.response?.data?.error;
      setTopError(
        backendMessage || "Failed to save. Check Console/Network tab."
      );
    }
  }

  return (
    <div className="app-container">
      <div className="form-card">
        <h2>Edit Invoice #{id}</h2>
        {serverError && <div className="error-box">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <div className="form-group">
              <label>Invoice Number</label>
              <input {...register("invoiceNumber")} readOnly />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" {...register("date")} />
            </div>
          </div>

          <div className="form-group">
            <input {...register("customerName")} placeholder="Customer Name" />
            <input
              {...register("customerMobile")}
              placeholder="Mobile Number"
            />
            <textarea {...register("address")} placeholder="Customer Address" />
          </div>

          <hr />
          <h3>Items</h3>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="item-row"
              style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
            >
              <select
                {...register(`items.${index}.productid`)} // Changed from productId to productid
                onChange={(e) => handleProductChange(index, e.target.value)}
                className="input-field"
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                {...register(`items.${index}.quantity`)}
                placeholder="Qty"
                style={{ width: "80px" }}
              />
              <input
                type="number"
                {...register(`items.${index}.price`)}
                placeholder="Price"
                style={{ width: "100px" }}
              />

              <button
                type="button"
                className="small danger"
                onClick={() => remove(index)}
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            className="btn ghost"
            onClick={() => append({ productId: "", quantity: 1, price: 0 })}
          >
            + Add Item
          </button>

          <div
            className="summary-section"
            style={{ textAlign: "right", marginTop: "20px" }}
          >
            <div>Subtotal: ₹{subTotal.toFixed(2)}</div>
            <div style={{ margin: "10px 0" }}>
              Discount %:
              <input
                type="number"
                {...register("discountPercent")}
                style={{ width: "60px", marginLeft: "10px" }}
              />
            </div>
            <hr />
            <div className="final-amount">
              <strong>Total: ₹{finalAmount.toFixed(2)}</strong>
            </div>
          </div>

          <div className="actions" style={{ marginTop: "30px" }}>
            <button
              type="submit"
              className="btn primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
