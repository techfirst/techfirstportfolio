import { DirectoryDockClient } from "directorydockclient";
import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.DIRECTORY_DOCK_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "API key not found" }, { status: 500 });
  }

  const client = new DirectoryDockClient(key);

  try {
    const categoriesResponse = await client.getCategories();

    if (!Array.isArray(categoriesResponse)) {
      console.error("Categories response is not an array:", categoriesResponse);
      return NextResponse.json(
        { error: "Invalid categories response format" },
        { status: 500 }
      );
    }

    return NextResponse.json({ categories: categoriesResponse });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
