"use client";
import { useState } from "react";

export default function EvidenceUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUploadedUrl("");
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      setUploadedUrl(data.url);
    } else {
      setError("Upload failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 bg-white p-6 rounded shadow max-w-lg">
      <h2 className="text-xl font-semibold mb-4">Upload Evidence</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="mb-4">
        <label htmlFor="evidence" className="block mb-1 font-medium">Evidence file</label>
        <input id="evidence" name="evidence" type="file" onChange={handleChange} className="w-full" />
      </div>
      <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Upload</button>
      {uploadedUrl && (
        <div className="mt-4 bg-green-100 p-3 rounded">
          <p>File uploaded: <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">{uploadedUrl}</a></p>
        </div>
      )}
    </form>
  );
}
