import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROK_API_KEY not configured in environment variables" }, { status: 500 });
    }

    // Ensure the image string has the correct Data URL prefix otherwise xAI might reject it.
    // If it's pure base64 (which happens if it was stripped), prepend the png mimetype.
    const imageDataUrl = image.startsWith("data:") ? image : `data:image/png;base64,${image}`;

    const prompt = `
      Extract data from this payment sheet image. 
      Return ONLY a JSON array of objects representing the rows in the table. 
      Each object must have these exact keys:
      - projectName (string)
      - vendorName (string)
      - natureOfWork (string)
      - poNumber (string)
      - paymentType (string - one of "Advance", "Partial", "Final")
      - poAmount (number)
      - alreadyPaidAmount (number)
      - needToPayAmount (number)
      - needToPay (boolean - true if the image indicates it's a high priority or "need to pay" is highlighted)

      Data format guidelines:
      - Remove currency symbols (₹, $) and commas from numbers.
      - If a value is missing, use "" for strings and 0 for numbers.
      - Look closely at column headers like "Project", "Vendor Name", "Work", "PO NO", "PO AMOUNT", "Paid Amount", "Need to Pay".
    `;

    // Fetch from xAI
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-2-vision-1212", 
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageDataUrl,
                  detail: "high"
                },
              },
            ],
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`xAI API error: ${errText}`);
    }

    const result = await response.json();
    const text = result.choices?.[0]?.message?.content || "";
    
    // Use regex to find the JSON part if the model added markdown blocks
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const jsonData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

    return NextResponse.json(jsonData);
  } catch (error: any) {
    console.error("Extraction error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
