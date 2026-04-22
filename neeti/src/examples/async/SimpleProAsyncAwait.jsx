import { useState, useEffect } from "react";

export default function SimpleProAsyncAwait() {
  const [name, setName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch("https://pokeapi.co/api/v2/pokemon/1")

        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setName(data.name);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

//     useEffect(() => {
//     fetch("https://pokeapi.co/api/v2/pokemon/1")
//       .then((res) => {
//         if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
//         return res.json();
//       })
//       .then((data) => setName(data.name))
//       .catch((err) => setError(err.message))
//       .finally(() => setLoading(false));
//   }, []);

  return (
    <div className="flex flex-col items-center gap-2 p-6 bg-gray-800 text-white rounded-xl">
      <h2 className="text-xl font-bold text-yellow-300">Simple async/await</h2>
      {loading && <p className="text-blue-300 animate-pulse">Loading...</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {name && <p className="capitalize text-2xl">{name}</p>}
    </div>
  );
}
