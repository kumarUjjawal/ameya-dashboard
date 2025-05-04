'use client';
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
        <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          Registration Successful 🎉
        </h1>
        <p className="text-center text-lg text-gray-700">
          Your registration has been submitted successfully. You can close this page or return to the home page.
        </p>
      </div>
    </div>
  );
}
