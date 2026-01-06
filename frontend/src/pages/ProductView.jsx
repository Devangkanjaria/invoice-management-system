// import React, { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import api from "../api/api";
// import "../style/products.css";

// export default function ProductView() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [product, setProduct] = useState(null);

//   useEffect(() => {
//     async function loadProduct() {
//       try {
//         const res = await api.get(`/products/${id}`);
//         setProduct(res.data);
//       } catch {
//         alert("Product not Found");
//         navigate("/products");
//       }
//     }
//     loadProduct();
//   }, [id, navigate]);

//   if (!product) return <p>Loading....</p>;

//   return (
//     <div className="form-page">
//       <div className="form-card">
//         <h2>{product.title}</h2>
//         <img src={product.image} alt="" width={150} />
//         <p>{product.description}</p>
//         <h3>₹ {product.price}</h3>

//         <div style={{ display: "flex", gap: 8 }}>
//           <button
//             className="btn"
//             onClick={() => navigate(`/products/${id}/edit`)}
//           >
//             Edit
//           </button>

//           <button className="btn ghost" onClick={() => navigate("/products")}>
//             Back
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
