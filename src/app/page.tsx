import Link from "next/link";

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 transition-all duration-300 hover:shadow-2xl text-center">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          Welcome to Ameya Dashboard
        </h1>
        <Link
          href="/form"
          className="inline-block px-6 py-3 rounded-full bg-indigo-600 text-white font-medium shadow-md hover:bg-indigo-700 transition-all duration-300"
        >
          Go to Registration
        </Link>
      </div>
    </main>
  );
}
