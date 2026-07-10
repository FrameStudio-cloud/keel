import { useState, useRef, useEffect } from "react";
import { FiImage, FiTrash2, FiCamera, FiUploadCloud } from "react-icons/fi";

const MAX_WIDTH = 1200;
const QUALITY = 0.8;

async function compressImage(file) {
  if (!file.type.startsWith("image/")) return file;

  const img = await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = URL.createObjectURL(file);
  });

  let { width, height } = img;
  if (width <= MAX_WIDTH && file.size < 500 * 1024) {
    URL.revokeObjectURL(img.src);
    return file;
  }

  if (width > MAX_WIDTH) {
    height = Math.round((height / width) * MAX_WIDTH);
    width = MAX_WIDTH;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  URL.revokeObjectURL(img.src);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob ? new File([blob], file.name, { type: blob.type }) : file),
      file.type,
      QUALITY
    );
  });
}

export default function ImageUploader({ currentImage, onImageChange }) {
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const browseRef = useRef(null);
  const cameraRef = useRef(null);
  const blobUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  async function handleFile(file) {
    if (!file) return;
    setCompressing(true);
    const compressed = await compressImage(file);
    setCompressing(false);
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const url = URL.createObjectURL(compressed);
    blobUrlRef.current = url;
    setPreview(url);
    onImageChange(compressed);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setDragging(false);
  }

  function handleRemove() {
    setPreview(null);
    onImageChange(null);
    if (browseRef.current) browseRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  }

  const showPreview = preview || currentImage;

  return (
    <div>
      <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">
        Photo
      </label>

      {showPreview ? (
        <div className="relative group">
          <img
            src={preview || currentImage}
            alt="preview"
            className={`w-full h-40 object-cover rounded-xl border border-gray-200 dark:border-white/10 ${
              preview ? "opacity-90" : ""
            }`}
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Remove image"
          >
            <FiTrash2 size={14} />
          </button>
          {preview && (
            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
              New
            </span>
          )}
        </div>
      ) : (
        <>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => { if (!compressing) browseRef.current?.click() }}
            className={`hidden sm:flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              compressing
                ? "border-blue-300 bg-blue-50 dark:bg-blue-500/10 cursor-wait"
                : dragging
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-500/10"
                  : "border-gray-300 dark:border-white/20 hover:border-blue-300 dark:hover:border-blue-400 bg-gray-50 dark:bg-[#1a1a2e]"
            }`}
          >
            {compressing ? (
              <>
                <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-sm text-blue-500 font-medium">Compressing image...</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Just a moment</p>
              </>
            ) : (
              <>
                <FiUploadCloud
                  size={32}
                  className={`mb-2 ${dragging ? "text-blue-500" : "text-gray-400 dark:text-slate-500"}`}
                />
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {dragging ? "Drop image here" : "Drag & drop image here"}
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                  or click to browse
                </p>
              </>
            )}
          </div>

          <div className="flex sm:hidden gap-2">
            <button
              onClick={() => { if (!compressing) cameraRef.current?.click() }}
              disabled={compressing}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-300 dark:border-white/20 rounded-xl py-3 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all disabled:opacity-50"
            >
              <FiCamera size={16} />
              {compressing ? "Optimizing..." : "Take Photo"}
            </button>
            <button
              onClick={() => { if (!compressing) browseRef.current?.click() }}
              disabled={compressing}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-300 dark:border-white/20 rounded-xl py-3 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all disabled:opacity-50"
            >
              <FiImage size={16} />
              {compressing ? "Optimizing..." : "Browse"}
            </button>
          </div>
        </>
      )}

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFile(e.target.files[0])}
        className="hidden"
      />
      <input
        ref={browseRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
}
