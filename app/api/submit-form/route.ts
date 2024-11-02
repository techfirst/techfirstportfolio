import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.DIRECTORY_DOCK_API_KEY;
  const apiHost = process.env.SUBMIT_FORM_API_HOST;

  if (!apiKey) {
    return NextResponse.json({ error: "API key not found" }, { status: 500 });
  }

  try {
    const formData = await req.json();

    const response = await fetch(`${apiHost}/api/form/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error submitting form:", error);
    return NextResponse.json(
      { error: "Failed to submit the form" },
      { status: 500 }
    );
  }
}
