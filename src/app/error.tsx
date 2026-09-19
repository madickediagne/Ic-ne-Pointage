"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Oups, une erreur s'est produite !</h2>
      <p className="text-gray-600 mb-6">{error.message || "Erreur inattendue"}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"
      >
        Réessayer
      </button>
    </div>
  );
}
