  import React, { useState } from "react";
  import axios from "axios";
  import { toast } from "react-toastify";

  const AdminProductPage = () => {
    // State variables as per your original request
    const [name, setName] = useState("");
    const [brand, setBrand] = useState(""); // Optional in your original fields, but kept
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [countInStock, setCountInStock] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(""); // This will store the Cloudinary URL
    const [uploading, setUploading] = useState(false);

    // Additional required fields from your schema that you listed previously
    const [sku, setSku] = useState("");
    const [sizes, setSizes] = useState(""); // Will be comma-separated string
    const [colors, setColors] = useState(""); // Will be comma-separated string
    const [collections, setCollections] = useState("");
    const [rating, setRating] = useState(0); // Default to 0, can be an input
    const [gender, setGender] = useState(""); // For enum type

    const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) {
        toast.error("Please select an image file.");
        return;
      }

      const formData = new FormData();
      formData.append("image", file); // Ensure "image" matches your backend's multer field name

      setUploading(true);
      try {
        // Ensure this endpoint returns { imageUrl: "..." }
        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
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

      // Basic client-side validation for the specified required fields
      if (
        !name ||
        !description ||
        !price ||
        !countInStock ||
        !sku ||
        !category ||
        !sizes ||
        !colors ||
        !collections ||
        !image || // Ensure an image URL exists
        rating === null // rating is required
      ) {
        toast.error(
          "Please fill in all required product fields, including an image."
        );
        return;
      }

      try {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/products`,
          {
            name,
            brand, // 'brand' is optional in schema, will be sent if provided
            price: Number(price), // Convert to Number
            category,
            countInStock: Number(countInStock), // Convert to Number
            description,
            sku,
            sizes: sizes
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean), // Convert comma-separated string to array, filter out empty
            colors: colors
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean), // Convert comma-separated string to array, filter out empty
            collections,
            images: [{ url: image, altText: name + " image" }], // Create the required image object
            rating: Number(rating), // Convert to Number
            gender: gender || undefined, // Only send if selected, otherwise undefined
            // 'user' field should be set on the backend based on the authenticated user's ID
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json", // Explicitly set content type for JSON
            },
          }
        );

        toast.success("Product added successfully!");
        // Reset form fields after successful submission
        setName("");
        setBrand("");
        setPrice("");
        setCategory("");
        setCountInStock("");
        setDescription("");
        setImage(""); // Clear the uploaded image URL
        setSku("");
        setSizes("");
        setColors("");
        setCollections("");
        setRating(0);
        setGender("");
      } catch (error) {
        toast.error("Failed to add product");
        console.error(
          "Error adding product:",
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
      <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md bg-[#efefef]">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Add New Product</h2>
        <form onSubmit={handleSubmit}>
          {/* Product Name */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-gray-700 font-semibold mb-2"
            >
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring focus:ring-blue-200 focus:border-blue-500"
              required
            />
          </div>

          {/* Brand (Optional) */}
          <div className="mb-4">
            <label
              htmlFor="brand"
              className="block text-gray-700 font-semibold mb-2"
            >
              Brand
            </label>
            <input
              type="text"
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="e.g., Nike, Adidas"
            />
          </div>

          {/* Price */}
          <div className="mb-4">
            <label
              htmlFor="price"
              className="block text-gray-700 font-semibold mb-2"
            >
              Product Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring focus:ring-blue-200 focus:border-blue-500"
              required
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label
              htmlFor="category"
              className="block text-gray-700 font-semibold mb-2"
            >
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring focus:ring-blue-200 focus:border-blue-500"
              required
            />
          </div>

          {/* Count In Stock */}
          <div className="mb-4">
            <label
              htmlFor="countInStock"
              className="block text-gray-700 font-semibold mb-2"
            >
              Count In Stock <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="countInStock"
              value={countInStock}
              onChange={(e) => setCountInStock(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring focus:ring-blue-200 focus:border-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-gray-700 font-semibold mb-2"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring focus:ring-blue-200 focus:border-blue-500"
              rows={4}
              required
            ></textarea>
          </div>

          {/* SKU */}
          <div className="mb-4">
            <label
              htmlFor="sku"
              className="block text-gray-700 font-semibold mb-2"
            >
              SKU (Unique Identifier) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring focus:ring-blue-200 focus:border-blue-500"
              required
            />
          </div>

          {/* Sizes */}
          <div className="mb-4">
            <label
              htmlFor="sizes"
              className="block text-gray-700 font-semibold mb-2"
            >
              Sizes (comma-separated, e.g., S, M, L){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="sizes"
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="e.g., S, M, L, XL"
              required
            />
          </div>

          {/* Colors */}
          <div className="mb-4">
            <label
              htmlFor="colors"
              className="block text-gray-700 font-semibold mb-2"
            >
              Colors (comma-separated, e.g., Red, Blue){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="colors"
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="e.g., Red, Blue, Black"
              required
            />
          </div>

          {/* Collections */}
          <div className="mb-4">
            <label
              htmlFor="collections"
              className="block text-gray-700 font-semibold mb-2"
            >
              Collections <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="collections"
              value={collections}
              onChange={(e) => setCollections(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring focus:ring-blue-200 focus:border-blue-500"
              required
            />
          </div>

          {/* Rating */}
          <div className="mb-4">
            <label
              htmlFor="rating"
              className="block text-gray-700 font-semibold mb-2"
            >
              Rating (0-5) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="rating"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              step="0.1"
              min="0"
              max="5"
              className="w-full border border-gray-300 rounded-md p-3 focus:ring focus:ring-blue-200 focus:border-blue-500"
              required
            />
          </div>

          {/* Gender (Enum) */}
          <div className="mb-6">
            <label
              htmlFor="gender"
              className="block text-gray-700 font-semibold mb-2"
            >
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring focus:ring-blue-200 focus:border-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Product Image <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploading && (
              <p className="mt-2 text-blue-600">Uploading image...</p>
            )}
            {image && (
              <div className="mt-4 flex items-center gap-2">
                <p className="text-gray-700">Image uploaded:</p>
                <a
                  href={image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  {image.substring(0, 40)}...
                </a>
                <img
                  src={image}
                  alt="Uploaded Product"
                  className="w-16 h-16 object-cover rounded-md ml-2"
                />
              </div>
            )}
            {!image && (
              <p className="mt-2 text-red-500">Please upload an image.</p>
            )}{" "}
            {/* Visual cue for required image */}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={uploading || !image} // Disable if image is still uploading or no image is selected
          >
            {uploading ? "Uploading Image..." : "Add Product"}
          </button>
        </form>
      </div>
    );
  };

  export default AdminProductPage;
