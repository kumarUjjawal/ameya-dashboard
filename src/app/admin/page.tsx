"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<null | boolean>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedGender, setSelectedGender] = useState('');

  const uniqueStates = [...new Set(registrations.map((reg) => reg.state))];
  const filteredCities = registrations
    .filter((reg) => selectedState ? reg.state === selectedState : true)
    .map((reg) => reg.city);

  const uniqueCities = [...new Set(filteredCities)];
  const handleImagePreview = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesState = selectedState ? reg.state === selectedState : true;
    const matchesCity = selectedCity ? reg.city === selectedCity : true;
    const matchesGender = selectedGender ? reg.gender === selectedGender : true;

    return matchesState && matchesCity && matchesGender;
  });

  const handleVideoPreview = (videoUrl: string) => {
    setSelectedVideo(videoUrl);
  };

  const handleClosePreview = () => {
    setSelectedImage(null);
    setSelectedVideo(null);
  };
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
      if (data.success) {
        setRegistrations(data.data);
      } else {
        console.error("Failed to fetch registrations:", data.error);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [search, stateFilter, cityFilter, genderFilter]);

  useEffect(() => {
    const authValue = localStorage.getItem("auth") === "true";
    setIsAuthenticated(authValue);
  }, []);


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (username === "admin" && password === "123456") {
      localStorage.setItem("auth", "true");
      setIsAuthenticated(true);
    } else {
      setError("Invalid credentials");
    }
  };

  if (isAuthenticated === null) {
    // still loading, avoid mismatch
    return null; // or a loading spinner if you like
  }

  if (!isAuthenticated) {
    return (
      <main className="w-full min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <h1 className="text-3xl font-extrabold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Admin Login
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:opacity-90 transition"
            >
              Login
            </button>
          </form>
        </div>
      </main>
    );
  }

  // const fetchData = async () => {
  //   setLoading(true);
  //   try {
  //     const params = new URLSearchParams();
  //     if (search) params.append("search", search);
  //     if (stateFilter) params.append("state", stateFilter);
  //     if (cityFilter) params.append("city", cityFilter);
  //     if (genderFilter) params.append("gender", genderFilter);
  //
  //     const res = await fetch(`/api/dashboard?${params.toString()}`);
  //     const data = await res.json();
  //     if (data.success) {
  //       setRegistrations(data.data);
  //     } else {
  //       console.error("Failed to fetch registrations:", data.error);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  //
  // // ✅ Use fetchData in both effects
  // useEffect(() => {
  //   fetchData();
  // }, []);
  //
  // useEffect(() => {
  //   fetchData();
  // }, [search, stateFilter, cityFilter, genderFilter]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    const res = await fetch(`/api/dashboard?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      alert('Deleted!');
      fetchData(); // ✅ Now this works!
    } else {
      alert('Delete failed: ' + data.error);
    }
  };

  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex">
      <section className="flex-1 p-8 overflow-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
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
              {uniqueStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring focus:border-indigo-500"
            >
              <option value="">All Cities</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
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
            <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
              <Link href="/form">Add New</Link>
            </button>
          </div>
        </header>

        {/* Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-x-auto">
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
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={14} className="p-4 text-center">Loading...</td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={14} className="p-4 text-center">No registrations found.</td>
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
                    <td className="p-4">{reg.pincode}</td>
                    <td className="p-4">
                      <button
                        className="text-indigo-600 hover:underline"
                        onClick={() => handleImagePreview(reg.imageUrl)}
                      >
                        View
                      </button>
                    </td>
                    <td className="p-4">
                      <button
                        className="text-indigo-600 hover:underline"
                        onClick={() => handleVideoPreview(reg.videoUrl)}
                      >
                        View
                      </button>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <Link
                        href={`/form?id=${reg.id}`}
                        className="text-blue-600 hover:underline mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => handleDelete(reg.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Image Preview Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full">
              <button
                onClick={handleClosePreview}
                className="absolute top-2 right-2 text-3xl text-red-500"
              >
                &times;
              </button>
              <img src={selectedImage} alt="Preview" className="w-full" />
            </div>
          </div>
        )}

        {/* Video Preview Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full">
              <button
                onClick={handleClosePreview}
                className="absolute top-2 right-2 text-xl text-red-500"
              >
                &times;
              </button>
              <video controls className="w-full">
                <source src={selectedVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}
        {/* Pagination (can be wired later using API pagination fields) */}
        <div className="flex justify-end mt-6 gap-2">
          <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Previous</button>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Next</button>
        </div>
      </section>
    </main>
  );
}
