import React from "react";
import { Link } from 'react-router-dom';

const ProductGrid = ({ products, loading, error }) => {
  if (loading) return <p className="text-center py-10">Loading products...</p>;
  if (error)
    return (
      <p className="text-center text-red-500 py-10">Error loading products.</p>
    );

  return (
    <div className=" px-1 md:px-4 lg:px-4 pb-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
        {products.map((product, index) => (
          <Link key={index} to={`/product/${product._id}`} className="bg-[#efefef] ">
            <div
              className="aspect-[4/5] overflow-hidden w-full"
              style={{ height: "auto", maxHeight: "480px" }}
            >
              <img
                src={product.images[0].url}
                alt={product.images[0].altext || product.name}
                className="w-full h-full max-h-[250px] md:max-h-[300px] lg:max-h-[350px] object-cover transition-transform duration-500 ease-in-out hover:scale-110"
              />
            </div>
            <div className="p-2 text-left">
              <p className="text-xs ">{product.name.toUpperCase()}</p>
              <p className="text-xs text-gray-600">Rs. {product.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;

// import React from 'react';
// import { Link } from 'react-router-dom';

// const ProductGrid = ({ products, loading, error }) => {
//   if (loading) return <p className="text-center py-6">Loading...</p>;
//   if (error) return <p className="text-center text-red-500 py-6">Error: {error}</p>;

//   return (
//     <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-1 py-6 px-3">
//       {products.map((product, index) => (
//         <Link
//           key={index}
//           to={`/product/${product._id}`}
//           className="group block overflow-hidden transition-all duration-300 "
//         >
//           {/* Image */}
//           <div className="w-full aspect-[4/3] sm:aspect-[4/3] md:aspect-[4/3] lg:aspect-[calc(4/5)] overflow-hidden">
//             <img
//               src={product.images[0].url}
//               alt={product.images[0].altext || product.name}
//               className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
//             />
//           </div>

//           {/* Product Info */}
//           <div className=" py-2">
//             <h3 className="text-sm font-semibold text-black truncate">{product.name}</h3>
//             <p className="text-sm text-gray-600 font-medium">Rs. {product.price}</p>
//           </div>
//         </Link>
//       ))}
//     </div>
//   );
// };

// export default ProductGrid;
