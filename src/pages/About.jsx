import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function About() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">About Trishul Eco-Homestays</h1>
        <p className="text-gray-600">
          Trishul Eco-Homestays is a small, family-run property focused on
          sustainable hospitality. More details about our story, values, and
          location will go here.
        </p>
      </main>
      <Footer />
    </div>
  );
}
