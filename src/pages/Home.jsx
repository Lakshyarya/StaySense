import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Card from "../components/Card";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Hero />
      <main className="flex-1 px-6 py-10">
        <h2 className="text-2xl font-bold mb-6">Our Rooms</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Card title="Garden Cottage" description="Cozy room with a private garden view, ideal for couples." />
          <Card title="Mountain View Room" description="Spacious room with large windows facing the hills." />
          <Card title="Family Suite" description="Two-bed suite perfect for families, with extra seating area." />
        </div>
      </main>
      <Footer />
    </div>
  );
}
