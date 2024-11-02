import { DirectoryDockClient } from "directorydockclient";
import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.DIRECTORY_DOCK_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "API key not found" }, { status: 500 });
  }

  const client = new DirectoryDockClient(key);

  try {
    const submitFieldsResponse = await client.getSubmitFields();
    return NextResponse.json({ submitFields: submitFieldsResponse });
  } catch (error) {
    console.error("Error fetching submit fields:", error);
    return NextResponse.json(
      { error: "Failed to fetch submit fields" },
      { status: 500 }
    );
  }
}
