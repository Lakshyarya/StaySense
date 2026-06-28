import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex flex-wrap items-center justify-between">
      <span className="text-xl font-bold">Trishul Eco-Homestays</span>
      <div className="flex gap-4 flex-wrap text-sm">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <Link to="/about" className="hover:text-blue-600">About</Link>
        <Link to="/booking" className="hover:text-blue-600">Booking</Link>
        <Link to="/login" className="hover:text-blue-600">Staff Login</Link>
      </div>
    </nav>
  );
}
