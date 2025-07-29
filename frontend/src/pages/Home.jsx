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
import ScrollingBanner from "../components/Common/ScrollingBanner";
import { Link } from "react-router-dom";

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const demoProducts = [...products.slice(0, 4)];
  const [bestSellerProduct, setBestSellerProduct] = useState(null);
    const [promoBanner, setPromoBanner] = useState(null);
  const [bannerLoading, setBannerLoading] = useState(true);

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

    const fetchPromotionalBanner = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/admin/banners`
        );
        setPromoBanner(data);
        setBannerLoading(false);
      } catch (error) {
        console.error("Error fetching promotional banner:", error.response?.data || error.message);
        setBannerLoading(false);
      }
    };
    fetchPromotionalBanner();
  }, [dispatch]);

  return (
    <div>
      <Hero />
      {/* <GenderCollectionSection /> */}
      {/* <NewArrivals /> */}
      <div className="">
        <div className="mx-auto pt-10 md:pt-6 ">
          <h2 className="mx-4 mb-4 md:mb-6 rubik text-sm ">NEW ARRIVAL</h2>
          <ProductGrid
            products={demoProducts}
            loading={loading}
            error={error}
          />
          <div className="flex justify-center mb-10 text-[10px]">
            <Link to={`/collections/all`}>
              <button className="px-5 py-2 test-xs text-black  border-1 hover:bg-black hover:text-white hover:font-medium transition">
                DISCOVER MORE
              </button>
            </Link>
          </div>
        </div>

        {/* Dynamic Promotional Banner Section with Tailwind CSS for responsiveness */}
        <div className="my-8  w-full relative"> {/* Added relative for potential absolute positioning of children */}
          {bannerLoading ? (
            <div className="w-full h-48 sm:h-64 md:h-80 lg:h-88 bg-gray-200 animate-pulse flex items-center justify-center text-gray-500 text-lg">
              Loading banner...
            </div>
          ) : promoBanner ? (
            <>
              {/* Mobile Banner: Display on small screens, hide on medium and larger */}
              <img
                src={promoBanner.mobile?.url}
                alt={promoBanner.mobile?.altText || "Mobile Banner"}
                className="w-full h-auto object-cover shadow-md
                           max-h-68 aspect-square // You might adjust aspect-ratio for mobile
                           md:hidden" // Hide this image on medium screens and up
              />

              {/* Desktop Banner: Hide on small screens, display on medium and larger */}
              <img
                src={promoBanner.desktop?.url}
                alt={promoBanner.desktop?.altText || "Desktop Banner"}
                className="w-full h-auto object-cover shadow-md
                           max-h-80 md:max-h-96 lg:max-h-[450px] aspect-video
                           hidden md:block" // Hide this image on small screens, display on medium and up
              />
            </>
          ) : (
            <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-lg">
              No banner available.
            </div>
          )}
        </div>

        {/* best sellers */}

        <div className="mx-auto">
          <h2 className="text-sm mx-4 mb-4">MORE FORM KIXOR</h2>
          <ProductGrid products={products} loading={loading} error={error} />
          <div className="flex justify-center mb-10 text-[10px]">
            <Link to={`/collections/all`}>
              <button className="px-5 py-2 test-xs text-black  border-1 hover:bg-black hover:text-white hover:font-medium transition">
                DISCOVER MORE
              </button>
            </Link>
          </div>
        </div>
        {/* <FeaturedCollection /> */}
        <FeaturesSection />
        {/* <h2 className="text-medium px-4 mb-1 mt-10">MOST LOVED</h2>
        {bestSellerProduct?._id ? (
          <ProductDetails productId={bestSellerProduct._id} />
        ) : (
          <p className="text-center">Loading best seller products ...</p>
        )} */}
        <ScrollingBanner />
      </div>
    </div>
  );
};

export default Home;
