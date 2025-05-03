"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");

  useEffect(() => {
    // Fetch registrations from your API
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        if (data.success) {
          setRegistrations(data.data);
          console.log("API response:", data);
        } else {
          console.error("Failed to fetch registrations:", data.error);
        }
      } catch (err) {
        console.error("Error fetching registrations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (stateFilter) params.append("state", stateFilter);
        if (cityFilter) params.append("city", cityFilter);
        if (genderFilter) params.append("gender", genderFilter);

        const res = await fetch(`/api/dashboard?${params.toString()}`);
        const data = await res.json();
        setRegistrations(data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [search, stateFilter, cityFilter, genderFilter]);

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
            {/* Search and filters (can be wired later) */}
            <input
              type="text"
              placeholder="Search by name, mobile, Aadhaar"
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring focus:border-indigo-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring focus:border-indigo-500"
            >
              <option value="">All States</option>
              <option value="State A">State A</option>
              <option value="State B">State B</option>
            </select>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring focus:border-indigo-500"
            >
              <option value="">All Cities</option>
              <option value="City X">City X</option>
              <option value="City Y">City Y</option>
            </select>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring focus:border-indigo-500"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
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
                <th className="p-4">Date of Birth</th>
                <th className="p-4">Gender</th>
                <th className="p-4">Email</th>
                <th className="p-4">PAN</th>
                <th className="p-4">Address</th>
                <th className="p-4">State</th>
                <th className="p-4">City</th>
                <th className="p-4">Pincode</th>
                <th className="p-4">Image</th>
                <th className="p-4">Video</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center">Loading...</td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center">No registrations found.</td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50">
                    <td className="p-4">{reg.name}</td>
                    <td className="p-4">{reg.mobile}</td>
                    <td className="p-4">{reg.aadhaar}</td>
                    <td className="p-4">{reg.dateOfBirth}</td>
                    <td className="p-4">{reg.gender}</td>
                    <td className="p-4">{reg.email}</td>
                    <td className="p-4">{reg.pan}</td>
                    <td className="p-4">{reg.address}</td>
                    <td className="p-4">{reg.state}</td>
                    <td className="p-4">{reg.city}</td>
                    <td className="p-4">{reg.picode}</td>
                    <td className="p-4">
                      <button className="text-indigo-600 hover:underline" onClick={() => alert(`Show image for ${reg.name}`)}>
                        Preview
                      </button>
                    </td>
                    <td className="p-4">
                      <button className="text-indigo-600 hover:underline" onClick={() => alert(`Show video for ${reg.name}`)}>
                        Preview
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (can be wired later using API pagination fields) */}
        <div className="flex justify-end mt-6 gap-2">
          <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Previous</button>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Next</button>
        </div>
      </section>
    </main>
  );
}
