import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { classifyReviews } from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const SENTIMENTS = ["positive", "neutral", "negative"];

export default function Dashboard() {
  const [text, setText] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  async function handleClassify() {
    setError("");
    setLoading(true);
    try {
      const data = await classifyReviews(text);
      setResults(data.results);
    } catch {
      setError("Something went wrong. Try logging in again.");
    } finally {
      setLoading(false);
    }
  }

  const grouped = SENTIMENTS.reduce((acc, s) => {
    acc[s] = results.filter((r) => r.sentiment === s);
    return acc;
  }, {});

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 px-6 py-10">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Review Classifier</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:underline"
          >
            Log out
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Paste raw guest reviews here, any format..."
          className="w-full border rounded p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleClassify}
          disabled={loading || !text.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Classifying..." : "Classify"}
        </button>

        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {SENTIMENTS.map((sentiment) => (
            <div key={sentiment} className="bg-white rounded-lg shadow-md p-4">
              <h2 className="font-semibold capitalize mb-3">
                {sentiment} ({grouped[sentiment].length})
              </h2>
              {grouped[sentiment].map((r, i) => (
                <div key={i} className="border rounded p-3 mb-2 text-sm">
                  <span className="inline-block bg-gray-100 text-xs px-2 py-0.5 rounded mb-1">
                    {r.theme}
                  </span>
                  <p className="mb-1">{r.review}</p>
                  <p className="text-gray-500 italic">{r.response}</p>
                </div>
              ))}
              {grouped[sentiment].length === 0 && (
                <p className="text-gray-400 text-sm">No reviews yet.</p>
              )}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
