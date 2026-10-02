"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";

interface FileUploadProps {
  name: string;
  defaultValue?: string;
  label?: string;
  placeholder?: string;
  accept?: string;
  required?: boolean;
  onUploaded?: (url: string) => void;
  className?: string;
}

export function FileUpload({
  name,
  defaultValue = "",
  label,
  placeholder = "Click or drag to upload photo",
  accept = "image/*",
  required = false,
  onUploaded,
  className = "",
}: FileUploadProps) {
  const [url, setUrl] = useState<string>(defaultValue);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload file");
      }

      setUrl(data.url);
      if (onUploaded) onUploaded(data.url);
    } catch (err: any) {
      setError(err.message || "Failed to upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    setUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onUploaded) onUploaded("");
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-2xs font-bold uppercase tracking-wider text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Hidden input to pass value with standard form submissions */}
      <input type="hidden" name={name} value={url} required={required} />

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {url ? (
        <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center p-2 space-x-3">
          <div className="relative w-12 h-12 rounded bg-slate-200 overflow-hidden flex-shrink-0">
            <Image
              src={url}
              alt="Uploaded file"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-2xs font-bold text-emerald-600 block">✓ Uploaded Successfully</span>
            <span className="text-2xs font-mono text-slate-400 truncate block">{url}</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 text-2xs font-bold bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-700 cursor-pointer shadow-2xs"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-2 py-1 text-2xs font-bold bg-red-50 border border-red-200 hover:bg-red-100 rounded text-red-600 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1 ${
            isUploading
              ? "border-purple-300 bg-purple-50/50"
              : "border-slate-300 hover:border-purple-400 hover:bg-slate-50"
          }`}
        >
          {isUploading ? (
            <div className="flex items-center space-x-2 py-1 text-purple-700 text-xs font-semibold">
              <span className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <span>Uploading photo...</span>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-1.5 text-slate-500">
                <span className="text-lg">📷</span>
                <span className="text-xs font-semibold text-slate-700">{placeholder}</span>
              </div>
              <span className="text-2xs text-slate-400">JPG, PNG, WebP up to 10MB</span>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="text-2xs text-red-600 font-semibold flex items-center space-x-1">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
