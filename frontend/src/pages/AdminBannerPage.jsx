import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminBannerPage = () => {
  const [desktopBannerImage, setDesktopBannerImage] = useState("");
  const [mobileBannerImage, setMobileBannerImage] = useState("");
  const [desktopAltText, setDesktopAltText] = useState("");
  const [mobileAltText, setMobileAltText] = useState("");
  const [desktopUploading, setDesktopUploading] = useState(false);
  const [mobileUploading, setMobileUploading] = useState(false);

  const handleImageUpload = async (e, setImage, setUploading) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("Please select an image file.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file); // Ensure "image" matches your backend's multer field name

    setUploading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/upload`, // Your existing upload endpoint
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setImage(data.imageUrl); // Assuming data.imageUrl is returned from your upload API
      toast.success("Image uploaded!");
    } catch (error) {
      toast.error("Upload failed");
      console.error(
        "Image upload error:",
        error.response?.data || error.message
      );
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("userToken"); // Get token from local storage

    // Client-side validation
    if (!desktopBannerImage || !mobileBannerImage || !desktopAltText || !mobileAltText) {
      toast.error("Please fill in all required banner fields, including images and alt texts.");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/banners`, // Your banner API endpoint
        {
          desktop: { url: desktopBannerImage, altText: desktopAltText },
          mobile: { url: mobileBannerImage, altText: mobileAltText },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Banner added successfully!");
      // Reset form fields after successful submission
      setDesktopBannerImage("");
      setMobileBannerImage("");
      setDesktopAltText("");
      setMobileAltText("");
    } catch (error) {
      toast.error("Failed to add banner");
      console.error(
        "Error adding banner:",
        error.response?.data || error.message
      );
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(`Error: ${error.response.data.message}`);
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.errors
      ) {
        // If backend sends specific validation errors
        Object.values(error.response.data.errors).forEach((err) => {
          toast.error(err.message);
        });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 shadow-md rounded-md bg-[#efefef]">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Add New Banner</h2>
      <form onSubmit={handleSubmit}>
        {/* Desktop Banner Image Upload */}
        <div className="mb-6 border p-4 rounded-md bg-white">
          <label className="block text-gray-700 font-semibold mb-2">
            Desktop Banner Image <span className="text-red-500">*</span>
            <span className="text-gray-500 text-sm ml-2">(Recommended: Wide aspect ratio, e.g., 1920x500px)</span>
          </label>
          <input
            type="file"
            onChange={(e) => handleImageUpload(e, setDesktopBannerImage, setDesktopUploading)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {desktopUploading && (
            <p className="mt-2 text-blue-600">Uploading desktop image...</p>
          )}
          {desktopBannerImage && (
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-gray-700">Image uploaded:</p>
              <a
                href={desktopBannerImage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                {desktopBannerImage.substring(0, 40)}...
              </a>
              <img
                src={desktopBannerImage}
                alt="Uploaded Desktop Banner"
                className="w-48 h-auto object-contain rounded-md border"
              />
              <div className="mt-2">
                <label htmlFor="desktopAltText" className="block text-gray-700 font-semibold mb-1 text-sm">
                  Desktop Alt Text <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="desktopAltText"
                  value={desktopAltText}
                  onChange={(e) => setDesktopAltText(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring focus:ring-blue-200 focus:border-blue-500"
                  placeholder="e.g., Summer Sale banner for desktop"
                  required
                />
              </div>
            </div>
          )}
          {!desktopBannerImage && (
            <p className="mt-2 text-red-500">Please upload a desktop banner image.</p>
          )}
        </div>

        {/* Mobile Banner Image Upload */}
        <div className="mb-6 border p-4 rounded-md bg-white">
          <label className="block text-gray-700 font-semibold mb-2">
            Mobile Banner Image <span className="text-red-500">*</span>
            <span className="text-gray-500 text-sm ml-2">(Recommended: Portrait aspect ratio, e.g., 768x1000px)</span>
          </label>
          <input
            type="file"
            onChange={(e) => handleImageUpload(e, setMobileBannerImage, setMobileUploading)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {mobileUploading && (
            <p className="mt-2 text-blue-600">Uploading mobile image...</p>
          )}
          {mobileBannerImage && (
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-gray-700">Image uploaded:</p>
              <a
                href={mobileBannerImage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                {mobileBannerImage.substring(0, 40)}...
              </a>
              <img
                src={mobileBannerImage}
                alt="Uploaded Mobile Banner"
                className="w-24 h-32 object-contain rounded-md border"
              />
              <div className="mt-2">
                <label htmlFor="mobileAltText" className="block text-gray-700 font-semibold mb-1 text-sm">
                  Mobile Alt Text <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="mobileAltText"
                  value={mobileAltText}
                  onChange={(e) => setMobileAltText(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring focus:ring-blue-200 focus:border-blue-500"
                  placeholder="e.g., Summer Sale banner for mobile"
                  required
                />
              </div>
            </div>
          )}
          {!mobileBannerImage && (
            <p className="mt-2 text-red-500">Please upload a mobile banner image.</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={desktopUploading || mobileUploading || !desktopBannerImage || !mobileBannerImage || !desktopAltText || !mobileAltText}
        >
          {desktopUploading || mobileUploading ? "Uploading Images..." : "Add Banner"}
        </button>
      </form>
    </div>
  );
};

export default AdminBannerPage;