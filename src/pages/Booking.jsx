import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Booking() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">Book Your Stay</h1>
        <p className="text-gray-600">
          Availability calendar and booking inquiry form will go here.
        </p>
      </main>
      <Footer />
    </div>
  );
}
