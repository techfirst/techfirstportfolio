import { DirectoryDockClient } from "directorydockclient";
import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.DIRECTORY_DOCK_API_KEY;
  if (!key) {
    console.error("API key not found");
    return NextResponse.json({ error: "API key not found" }, { status: 500 });
  }

  const client = new DirectoryDockClient(key);

  try {
    const [servicesResponse, categoriesResponse] = await Promise.all([
      client.getEntries(1, 1000),
      client.getCategories(),
    ]);

    const services = servicesResponse.entries;
    const categories = categoriesResponse;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://techfirst.se"; // Replace with your actual domain

    const currentDate = new Date().toISOString(); // Full ISO 8601 format

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      ${services
        .map(
          (service) => `
        <url>
          <loc>${baseUrl}/${service.Slug.value}</loc>
          <lastmod>${currentDate}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
        </url>
      `
        )
        .join("")}
      ${categories
        .map(
          (category) => `
        <url>
          <loc>${baseUrl}/categories/${category.slug}</loc>
          <lastmod>${currentDate}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.6</priority>
        </url>
      `
        )
        .join("")}
    </urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error("Failed to generate sitemap:", error);
    return NextResponse.json(
      { error: "Failed to generate sitemap" },
      { status: 500 }
    );
  }
}
