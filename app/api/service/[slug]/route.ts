import { DirectoryDockClient } from "directorydockclient";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const key = process.env.DIRECTORY_DOCK_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "API key not found" }, { status: 500 });
  }

  const client = new DirectoryDockClient(key);

  try {
    const service = await client.getEntry(params.slug);
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    return NextResponse.json({ service });
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Failed to fetch service" },
      { status: 500 }
    );
  }
}
