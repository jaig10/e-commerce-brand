import React, { useEffect, useState } from "react";
import Hero from "../components/Layout/Hero.jsx";
import GenderCollectionSection from "../components/Products/GenderCollectionSection.jsx";
import NewArrivals from "../components/Products/NewArrivals.jsx";
import ProductDetails from "../components/Products/ProductDetails.jsx";
import ProductGrid from "../components/Products/ProductGrid.jsx";
import FeaturedCollection from "../components/Products/FeaturedCollection.jsx";
import FeaturesSection from "../components/Products/FeaturesSection.jsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsByFilters } from "../redux/slice/productsSlice.js";
import bannerImg from "../../src/assets/Banner.webp"; // adjust path as needed
import axios from "axios";

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const demoProducts = [...products.slice(0, 4)]
  const [bestSellerProduct, setBestSellerProduct] = useState(null);

  useEffect(() => {
    //fetch the product of specific collection
    dispatch(
      fetchProductsByFilters({
        gender: "Unisex",
        category: "Top Wear",
        limit: 8,
      })
    );
    //fetch best seller product
    const fetchBestSeller = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/best-seller`
        );
        setBestSellerProduct(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBestSeller();
  }, [dispatch]);

  return (
    <div>
      <Hero />
      {/* <GenderCollectionSection /> */}
      {/* <NewArrivals /> */}
      <div className="bg-white">
        <div className="mx-auto pt-20 ">
          <h2 className="mx-4 mb-6">Top Wears for Women</h2>
          <ProductGrid products={demoProducts} loading={loading} error={error} />
        </div>

        <div className="my-8 px-4">
          <img
            src={bannerImg}
            alt="Promotional Banner"
            className="w-full h-auto rounded-xl shadow-md"
          />
        </div>

        {/* best sellers */}
        {/* <h2 className="text-3xl text-center mb-1 mt-10">Best Seller</h2>
        {bestSellerProduct?._id ? (
          <ProductDetails productId={bestSellerProduct._id} />
        ) : (
          <p className="text-center">Loading best seller products ...</p>
        )} */}

        <div className="mx-auto">
          <h2 className="text-3xl text-center font-bold mb-4">
            Top Wears for Women
          </h2>
          <ProductGrid products={products} loading={loading} error={error} />
        </div>
        <FeaturedCollection />
        <FeaturesSection />
      </div>
     </div>
  );
};

export default Home;
