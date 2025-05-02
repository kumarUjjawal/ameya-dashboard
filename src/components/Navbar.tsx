import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="flex gap-4 p-4 bg-gray-100">
            <Link href="/">Home</Link>
            <Link href="/form">Registration Form</Link>
            <Link href="/admin">Admin Dashboard</Link>
        </nav>
    );
}
