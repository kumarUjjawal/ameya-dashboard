"use client";
import Link from "next/link";
import Image from "next/image";

export default function AdminDashboard() {
  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-sm p-6 rounded-r-2xl shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>
        <nav className="flex flex-col gap-4">
          <Link href="/admin" className="text-gray-700 hover:text-indigo-600 font-medium">
            Dashboard
          </Link>
          <Link href="/admin/registrations" className="text-gray-700 hover:text-indigo-600 font-medium">
            Registrations
          </Link>
          <Link href="/admin/settings" className="text-gray-700 hover:text-indigo-600 font-medium">
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <section className="flex-1 p-8 overflow-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Registrations
          </h1>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by name, mobile, Aadhaar"
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring focus:border-indigo-500"
            />
            <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring focus:border-indigo-500">
              <option>All States</option>
              <option>State A</option>
              <option>State B</option>
            </select>
            <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring focus:border-indigo-500">
              <option>All Cities</option>
              <option>City X</option>
              <option>City Y</option>
            </select>
            <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring focus:border-indigo-500">
              <option>All Genders</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </header>

        {/* Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                <th className="p-4">Name</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Aadhaar</th>
                <th className="p-4">State</th>
                <th className="p-4">City</th>
                <th className="p-4">Gender</th>
                <th className="p-4">Image</th>
                <th className="p-4">Video</th>
              </tr>
            </thead>
            <tbody>
              {/* Example row */}
              <tr className="hover:bg-gray-50">
                <td className="p-4">John Doe</td>
                <td className="p-4">9876543210</td>
                <td className="p-4">1234-5678-9012</td>
                <td className="p-4">State A</td>
                <td className="p-4">City X</td>
                <td className="p-4">Male</td>
                <td className="p-4">
                  <button className="text-indigo-600 hover:underline" onClick={() => alert("Show image preview modal")}>
                    Preview
                  </button>
                </td>
                <td className="p-4">
                  <button className="text-indigo-600 hover:underline" onClick={() => alert("Show video preview modal")}>
                    Preview
                  </button>
                </td>
              </tr>
              {/* Add more rows dynamically */}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end mt-6 gap-2">
          <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Previous</button>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Next</button>
        </div>
      </section>
    </main>
  );
}
