import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  const { playlistUrl } = await request.json();

  const playlistId = playlistUrl.split("/playlist/")[1].split("?")[0];

  const authHeader = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const tokenRes = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({ grant_type: "client_credentials" }),
    { headers: { Authorization: `Basic ${authHeader}` } }
  );

  const token = tokenRes.data.access_token;

  let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;
  const allTracks: any[] = [];

  while (url) {
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

const items = res.data.items
  .filter((item: any) => item.track) // skip nulls
  .map((item: any) => {
    const track = item.track;
    return {
      name: track.name,
      artist: track.artists.map((a: any) => a.name).join(", "),
      album: track.album.name,
      cover: track.album.images?.[0]?.url,
      duration_ms: track.duration_ms,
    };
  });


    allTracks.push(...items);
    url = res.data.next; // pagination
  }

  return NextResponse.json({ tracks: allTracks });
}
