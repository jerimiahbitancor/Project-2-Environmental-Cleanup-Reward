"use client";

import { useState, useEffect } from "react";

interface ClaimFormProps {
  onSubmit: (data: { weight: number; gps: string; photo: string }) => void;
  isLoading: boolean;
}

export default function ClaimForm({ onSubmit, isLoading }: ClaimFormProps) {
  const [weight, setWeight] = useState<string>("");
  const [gps, setGps] = useState<string>("");
  const [photo, setPhoto] = useState<string>("");
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGps(`${position.coords.latitude}, ${position.coords.longitude}`);
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhoto(base64String);
        setPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !gps || !photo) {
      alert("Please fill all fields");
      return;
    }
    onSubmit({ weight: parseFloat(weight), gps, photo });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Submit Cleanup Claim</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
        <input
          type="number"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
          placeholder="e.g. 2.5"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">GPS Coordinates</label>
        <input
          type="text"
          value={gps}
          onChange={(e) => setGps(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
          placeholder="Latitude, Longitude"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Automatically fetched or manual override</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Photo Proof</label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          required
        />
        {preview && (
          <div className="mt-2">
            <img src={preview} alt="Preview" className="h-32 w-32 object-cover rounded-md border" />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
      >
        {isLoading ? "Processing..." : "Submit & Earn"}
      </button>
    </form>
  );
}
