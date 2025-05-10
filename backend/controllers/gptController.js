import fs from "fs";
import {OpenAI} from "openai"

const openai = new OpenAI({ apiKey: process.env.GPT_API_KEY});

export const extractDressDetails = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0)
      return res.status(400).json({ success: false, message: "At least one image is required" });

    // Prompt for GPT
    const contentArray = [
      {
        type: "text",
        text: `
You are a professional AI fashion assistant.

Analyze all the following images of a single dress (including front, back, and close-up views) and extract the dress metadata in strict JSON format.

Output format:
{
  "productName": "",
  "description": "",
  "category": "",
  "subCategory": "",
  "brand": "",
  "material": "",
  "fit_type": "",
  "pattern": "",
  "occasion": "",
  "washCare": "",
  "sleeve": "",
  "neckType": "",
  "color": "",
  "secondaryColor": ""
}

Rules:
- All keys must be present.
- Use lowercase for category/subCategory values.
- Do not include explanations or extra text — only return valid JSON.
        `.trim()
      }
    ];

    // Convert images to data URIs and add to content array
    for (const file of files) {
      const base64Image = fs.readFileSync(file.path, { encoding: "base64" });
      const imageDataURI = `data:${file.mimetype};base64,${base64Image}`;
      contentArray.push({
        type: "image_url",
        image_url: { url: imageDataURI }
      });
    }

    // Send to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: "You are a helpful fashion assistant that always replies in valid JSON."
        },
        {
          role: "user",
          content: contentArray
        }
      ],
      max_tokens: 700,
      temperature: 0.2
    });

    // Clean up uploaded files
    files.forEach(file => fs.unlinkSync(file.path));

    // Extract and parse model output
    const gptText = response.choices[0]?.message?.content;

    try {
      // Attempt to parse JSON directly
      const json = JSON.parse(gptText);
      res.json({ success: true, data: json });
    } catch (err) {
      // If parsing fails, send raw text for debugging
      res.status(500).json({
        success: false,
        message: "Failed to extract the data from the image",
        raw: gptText
      });
    }

  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};