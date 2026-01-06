// import React, { useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { useNavigate, useParams } from "react-router-dom";
// import api from "../api/api";
// import axios from "axios";
// import "../style/products.css";

// export default function ProductForm() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const { register, handleSubmit, reset } = useForm({
//     defaultValues: {
//       title: "",
//       price: "",
//       description: "",
//       image: "",
//       category: "",
//     },
//   });

//   //   EDIT the data of state

//   useEffect(() => {
//     if (!id) return;

//     async function loadProduct() {
//       const res = await api.get(`/products/${id}`);
//       reset(res.data);
//     }
//     loadProduct();
//   }, [id, reset]);

//   //   submit the form

//   async function onSubmit(data) {
//     try {
//       if (id) {
//         await api.put(`/products/${id}`, data);
//       } else {
//         await api.post  (`/products`, data);
//       }
//       navigate("/products");
//     } catch {
//       alert("Save Failed !");
//     }
//   }

//   //   form making
//   return (
//     <div className="form-page">
//       <div className="form-card">
//         <h2>{id ? "Edit Product" : "Add Product"}</h2>

//         <form onSubmit={handleSubmit(onSubmit)}>
//           <input
//             {...register("title", { required: true })}
//             placeholder="Title"
//           />
//           <input type="number" {...register("price")} placeholder="Price" />
//           <textarea {...register("description")} placeholder="Description" />
//           <input {...register("image")} placeholder="Image URL" />
//           <input {...register("category")} placeholder="Category" />

//           <button className="btn primary" type="submit">
//             Save
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
