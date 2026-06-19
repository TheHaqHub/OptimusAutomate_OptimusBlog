import { useState, useRef } from "react";
import { uploadImage } from "../api/upload.api";

export default function ImageDropzone({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      const res = await uploadImage(file);
      onChange(res.data.data.url);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  if (value) {
    return (
      <div className="relative rounded-md overflow-hidden border border-gray-300">
        <img src={value} alt="Cover preview" className="w-full h-48 object-cover" />
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-2 right-2 bg-white/90 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-md hover:bg-white"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full h-48 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 disabled:opacity-50"
      >
        <span className="text-sm font-medium">
          {uploading ? "Uploading..." : "Click to add a cover image"}
        </span>
        <span className="text-xs text-gray-400 mt-1">JPEG, PNG, WEBP, or GIF — max 5MB</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}