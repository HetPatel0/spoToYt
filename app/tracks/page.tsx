"use client";

import { useState } from "react";

type Track = {
  name: string;
  artist: string;
  album?: string;
  cover?: string;
  videoId?: string | null;
};

export default function TrackList({ initialTracks }: { initialTracks: Track[] }) {
  const [tracks, setTracks] = useState(initialTracks);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  // 👇 Search YouTube for a given track
  async function findVideo(track: Track, index: number) {
    setLoadingIndex(index);
    const res = await fetch("/api/youtube/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: `${track.name} ${track.artist}` }),
    });

    const data = await res.json();
    const updated = [...tracks];
    updated[index].videoId = data.videoId || null;
    setTracks(updated);
    setLoadingIndex(null);
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-4">
      {tracks.map((t, i) => (
        <div
          key={i}
          className="flex items-center justify-between border p-3 rounded-lg bg-white shadow-sm"
        >
          <div className="flex items-center space-x-3">
            {t.cover && (
              <img src={t.cover} alt={t.name} className="w-12 h-12 rounded-md" />
            )}
            <div>
              <p className="font-medium">{t.name}</p>
              <p className="text-sm text-gray-600">{t.artist}</p>
            </div>
          </div>

          {t.videoId ? (
            <button
              onClick={() =>
                window.open(`https://www.youtube.com/watch?v=${t.videoId}`, "_blank")
              }
              className="text-red-600 font-medium hover:underline"
            >
              Open on YouTube
            </button>
          ) : (
            <button
              disabled={loadingIndex === i}
              onClick={() => findVideo(t, i)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              {loadingIndex === i ? "Searching..." : "Find on YouTube"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
