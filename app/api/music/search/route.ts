import { NextRequest, NextResponse } from "next/server";

// A single search result, trimmed down to what the note form needs.
export type MusicResult = {
  id: number;
  title: string;
  artist: string;
  url: string;
  artwork: string;
};

// Shape of the fields we read from an iTunes Search API track.
type ITunesTrack = {
  trackId?: number;
  collectionId?: number;
  trackName?: string;
  artistName?: string;
  trackViewUrl?: string;
  collectionViewUrl?: string;
  artworkUrl100?: string;
};

// We proxy the iTunes Search API from the server: calling it directly from
// the browser can hit CORS, and this lets us return only the fields we want.
export async function GET(request: NextRequest) {
  const term = request.nextUrl.searchParams.get("term")?.trim() ?? "";

  if (!term) {
    return NextResponse.json({ results: [] satisfies MusicResult[] });
  }

  const itunes = new URL("https://itunes.apple.com/search");
  itunes.searchParams.set("term", term);
  itunes.searchParams.set("entity", "song");
  itunes.searchParams.set("limit", "8");
  itunes.searchParams.set("country", "KR");

  try {
    const response = await fetch(itunes, {
      headers: { Accept: "application/json" },
      // iTunes results change rarely; cache identical searches briefly.
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      return NextResponse.json({ error: "upstream" }, { status: 502 });
    }

    const data = (await response.json()) as { results?: ITunesTrack[] };

    const results: MusicResult[] = (data.results ?? [])
      .filter((track) => track.trackName && track.artistName)
      .map((track) => ({
        id: track.trackId ?? track.collectionId ?? 0,
        title: track.trackName as string,
        artist: track.artistName as string,
        url: track.trackViewUrl ?? track.collectionViewUrl ?? "",
        // Ask for a crisper 200px cover instead of the default 100px.
        artwork: (track.artworkUrl100 ?? "").replace("100x100", "200x200")
      }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "network" }, { status: 502 });
  }
}
