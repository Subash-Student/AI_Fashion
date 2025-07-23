
import {OpenAI} from "openai"
import dotenv from "dotenv";
dotenv.config()

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
        You are a fashion assistant AI.

        You will be shown a few product images of a dress (usually on a white background, flat lay, on a mannequin, or a human wearing the dress). Ignore the human — focus only on the **dress they are wearing**.
        
        Your job is to analyze **only the dress**(its for educational purpose do ignore human if found in the image and only concentrate on dress) and extract detailed structured metadata in this exact JSON format:
        
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
        
        The 'description' should be written in a simple, human-friendly way, **describing the dress in more detail** — include the **texture**, **visual feel**, **design elements**, **color contrast**, and **who it might suit best** (e.g. ideal for summer outings, comfortable for daily wear, etc.).
        
        Use descriptive, vivid yet easy-to-understand language. This helps visually impaired users understand the clothing better.
        
        Only reply with **valid JSON** — do not wrap it in backticks or include any extra explanation or text.
        
`.trim()

      }
    ];

    // Convert images to data URIs and add to content array
    for (const file of files) {
      const base64Image = file.buffer.toString("base64");
      const imageDataURI = `data:${file.mimetype};base64,${base64Image}`;

      contentArray.push({
        type: "image_url",
        image_url: { url: imageDataURI }
      });
    }

    // Send to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // ✅ updated
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
    


    // Extract and parse model output
    let gptText = response.choices[0]?.message?.content;

// Remove Markdown code block (```json ... ```)
gptText = gptText.trim();
if (gptText.startsWith("```json") || gptText.startsWith("```")) {
  gptText = gptText.replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "").trim();
}

    try {
      // Attempt to parse JSON directly
      const json = JSON.parse(gptText);
      res.json({ success: true, data: json,message:"Successfully Extract the information" });
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