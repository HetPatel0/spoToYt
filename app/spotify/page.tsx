'use client'
import { useState } from "react";

export default function Spotify() {
  const [link, setLink] = useState("");
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchingIndex, setSearchingIndex] = useState<number | null>(null);
  

  async function fetchPlaylist() {
    setLoading(true);

    try {
      const res = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistUrl: link }),
      });
      
      
      if (!res.ok) {
        alert(`Failed to fetch playlist: ${res.status}`);
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      setTracks(data.tracks || []);
    } catch (error) {
      alert(`Error: ${error}`);
    }
    
    setLoading(false);
  }

  async function findVideo(track: any) {
    const query = `${track.name} ${track.artist}`;
    
    try {
      const res = await fetch("/api/youtube/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: query }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        return null;
      }

      const data = await res.json();;
      
      return data.videoId;
    } catch (error) {
      return null;
    }
  }

  const handleOpen = async (track: any, index: number) => {
    setSearchingIndex(index);

    const vidId = await findVideo(track);

    setSearchingIndex(null);

    if (vidId) {
      window.open(`https://www.youtube.com/watch?v=${vidId}`,'_blank')
    } else {
      alert("No YouTube video found 😢\nCheck debug log below for details");
    }
  };

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Spotify → YouTube Playlist  
      </h1>

      <div className="flex gap-2 mb-6">
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Paste Spotify playlist link..."
          className="flex-1 border p-2 rounded"
        />
        <button
          onClick={fetchPlaylist}
          disabled={!link || loading}
          className="text-white bg-green-500 hover:bg-green-600 px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Loading..." : "Fetch"}
        </button>
      </div>


      {tracks.length > 0 && (
        <div className="grid gap-4">
          {tracks.map((t, i) => (
            <div
              key={i}
              className="flex gap-4 items-center p-3 rounded-lg shadow-sm border hover:border-gray-500"
            >
              {t.cover && (
                <img
                  src={t.cover}
                  alt={t.name}
                  className="w-16 h-16 rounded object-cover"
                />
              )}
              <div className="flex-1">
                <p className="font-medium">{t.name}</p>
                <p className="text-sm text-gray-600">{t.artist}</p>
                <p className="text-xs text-gray-500">{t.album}</p>

                <button
                  onClick={() => handleOpen(t, i)}
                  disabled={searchingIndex === i}
                  className="text-red-600 hover:text-red-700  text-sm mt-1 disabled:opacity-50"
                >
                  {searchingIndex === i ? "Searching..." : "Open on YouTube"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tracks.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-8">
          Paste a Spotify playlist link to get started
        </div>
      )}
    </main>
  );
}