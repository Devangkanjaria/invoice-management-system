// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../api/api";
// import "../style/products.css";

// export default function ProductHome() {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const navigate = useNavigate();

//   //   Fetch the data

//   useEffect(() => {
//     async function loadPoducts() {
//       try {
//         const res = await api.get("/products");

//         console.log("STATUS CODE:", res.status);
//         console.log("RESPONSE HEADERS:", res.headers);
//         console.log("RESPONSE DATA:", res.data);

//         setProducts(Array.isArray(res.data) ? res.data : []);
//       } catch (err) {
//         alert("Failed to Get the Data!");
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadPoducts();
//   }, []);

//   // Delete the Data

//   async function handleDelet(id) {
//     try {
//       await api.delete(`/products/${id}`);
//       setProducts((prev) => prev.filter((p) => p.id !== id));
//     } catch (err) {
//       alert("Failed to Delete the Data!");
//     }
//   }

//   return (
//     <div className="app-container">
//       <header className="top">
//         <div className="company">GAREAGEWALA</div>
//         <h1 className="title">Products</h1>
//       </header>

//       <section className="add-area">
//         <div>
//           <div className="add-text">Manage store products</div>
//           <div className="subtitle">Create, view & edit products</div>
//         </div>
//         <button className="plus-btn" onClick={() => navigate("/products/new")}>
//           +
//         </button>
//       </section>

//       <section className="list">
//         {loading ? (
//           <p>Loading...</p>
//         ) : (
//           products.map((p) => (
//             <div key={p.id} className="task-card">
//               <div style={{ flex: 1 }}>
//                 <strong>{p.title}</strong>
//                 <div className="muted">₹ {p.price}</div>
//               </div>

//               <div style={{ display: "flex", gap: 8 }}>
//                 <button
//                   className="small"
//                   onClick={() => navigate(`/products/${p.id}`)}
//                 >
//                   View
//                 </button>
//                 <button
//                   className="small danger"
//                   onClick={() => handleDelet(p.id)}
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))
//         )}
//       </section>
//     </div>
//   );
// }

// /*You are using FakeStoreAPI.

// 👉 GET /products usually returns an array, BUT
// 👉 sometimes (network error / wrong axios instance / interceptor issue)
// res.data can become an object, not an array.

// So when React renders:

// products.map(...)


// ➡️ it crashes because products is not an array. */
