import { openai } from "@ai-sdk/openai";
import { experimental_generateImage } from "ai";

export async function POST(request: Request) {
  const { prompt } = await request.json();

  try {
    const result = await experimental_generateImage({
      model: openai.image("dall-e-3"), // Specify the model for image generation
      prompt,
      n: 1, // Number of images to generate
      size: "1024x1024", // Image size
    });

    // Fetch
    // return new Response(
    //   JSON.stringify({ image: result.image.base64 }),
    //   { headers: { "Content-Type": "application/json" } }
    // );

    // Vercel SDK
    return new Response(`data:image/png;base64,${result.image.base64}`,
      { headers: { "Content-Type": "image/png" } }
    );

    // File
    // result.image.uint8Array contains the binary image data
    // return new Response(result.image.uint8Array, {
    //   headers: {
    //     "Content-Type": result.image.mimeType || "image/png", // Default to PNG if mimeType is not provided
    //     "Content-Disposition": 'inline', // or 'attachment; filename="image.png"' for download
    //   },
    // });
  } catch (error) {
    console.error("Image generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
