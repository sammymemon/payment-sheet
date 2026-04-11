import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Remove the base64 prefix if present
    const base64Data = image.split(",")[1] || image;

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

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/png", // Assuming PNG as most common for screenshot/paste
        },
      },
    ]);

    const text = result.response.text();
    // Use regex to find the JSON part if the model added markdown blocks
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const jsonData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

    return NextResponse.json(jsonData);
  } catch (error: any) {
    console.error("Extraction error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
