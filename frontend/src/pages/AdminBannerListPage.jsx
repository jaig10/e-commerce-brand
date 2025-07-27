import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminBannerListPage = () => {
  const [banner, setBanner] = useState(null); // Change 'banners' to 'banner' and initialize as null
  const [loading, setLoading] = useState(true);

  const fetchBanner = async () => { // Renamed function to reflect single banner fetch
    try {
      const token = localStorage.getItem("userToken");

      // Assuming this endpoint returns a single banner object or null
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/banners`, // Use /api/banner as per your route
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setBanner(data); // Set the single banner object
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch banner");
      console.error("Fetch error:", error.response?.data || error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanner(); // Call the fetch single banner function
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Current Banner</h2> {/* Updated title */}

      {loading ? (
        <p>Loading banner details...</p>
      ) : !banner ? ( // Check if banner is null or undefined
        <p>No active banner found. Please add one from the "Add Banner" page.</p>
      ) : (
        // Display the single banner directly
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Current Active Banner
          </h3>

          <div className="mb-6">
            <p className="text-lg font-medium text-gray-700 mb-2">
              Desktop View:
            </p>
            <img
              src={banner.desktop?.url} // Use banner.desktop?.url
              alt={banner.desktop?.altText || "Desktop Banner"} // Use altText
              className="w-full max-h-64 object-contain rounded-md border shadow-sm"
            />
            <p className="text-sm text-gray-500 mt-1">
              Alt Text: {banner.desktop?.altText || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              Mobile View:
            </p>
            <img
              src={banner.mobile?.url} // Use banner.mobile?.url
              alt={banner.mobile?.altText || "Mobile Banner"} // Use altText
              className="w-full max-w-xs object-contain rounded-md border shadow-sm" // Adjusted max-w to make it appear more mobile-like
            />
             <p className="text-sm text-gray-500 mt-1">
              Alt Text: {banner.mobile?.altText || "N/A"}
            </p>
          </div>

          {/* You might want to add edit/delete buttons here for the single banner */}
          {/* Example: */}
          {/* <div className="mt-6 flex justify-end gap-3">
            <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
              Edit Banner
            </button>
            <button className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors">
              Delete Banner
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default AdminBannerListPage;