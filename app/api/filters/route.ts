import { DirectoryDockClient } from "directorydockclient";
import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.DIRECTORY_DOCK_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "API key not found" }, { status: 500 });
  }

  const client = new DirectoryDockClient(key);

  try {
    const filtersResponse = await client.getFilters();
    return NextResponse.json({ filters: filtersResponse });
  } catch (error) {
    console.error("Error fetching filters:", error);
    return NextResponse.json(
      { error: "Failed to fetch filters" },
      { status: 500 }
    );
  }
}
