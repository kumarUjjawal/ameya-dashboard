import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="flex gap-6 justify-center items-center p-4 mx-auto max-w-4xl bg-white/80 backdrop-blur-sm rounded-xl shadow-md transition-all duration-300 hover:shadow-lg bg-gradient-to-r from-indigo-100 via-purple-50 to-pink-100">
            <Link
                href="/"
                className="text-black font-medium hover:text-indigo-600 transition-colors"
            >
                Home
            </Link>
            <Link
                href="/form"
                className="text-black font-medium hover:text-indigo-600 transition-colors"
            >
                Register
            </Link>
            <Link
                href="/admin"
                className="text-black font-medium hover:text-indigo-600 transition-colors"
            >
                Admin
            </Link>
        </nav>
    );
}
