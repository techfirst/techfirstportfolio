import { DirectoryDockClient } from "directorydockclient";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const key = process.env.DIRECTORY_DOCK_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "API key not found" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const client = new DirectoryDockClient(key);

  try {
    const servicesResponse = await client.getEntries(page, limit);
    return NextResponse.json({
      services: servicesResponse.entries,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
