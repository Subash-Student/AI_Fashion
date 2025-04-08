import fs from "fs";
import path from "path";
import {OpenAI} from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const extractDressDetails = async (req, res) => {
    try {
      const files = req.files;
      if (!files || files.length === 0) return res.status(400).json({ success: false, message: "At least one image is required" });
  
      const contentArray = [
        {
          type: "text",
          text: `
  You're an AI fashion assistant. Analyze all images of the dress (front, back, close-up if any) and extract the following details in JSON format:
  
  - productName
  - description
  - Category
  - subCategory
  - brand
  - material
  - fit_type
  - pattern
  - occasion
  - washCare
  - Sleeve
  - NeckType
  - color
  - SecondryColor
  
  
  Only return JSON. No explanations.
          `
        }
      ];
  
      for (const file of files) {
        const base64Image = fs.readFileSync(file.path, { encoding: "base64" });
        const imageDataURI = `data:${file.mimetype};base64,${base64Image}`;
        contentArray.push({ type: "image_url", image_url: { url: imageDataURI } });
      }
  
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: contentArray
          }
        ],
        max_tokens: 600
      });
  
      files.forEach(file => fs.unlinkSync(file.path)); // cleanup
  
      const gptText = response.choices[0]?.message?.content;
  
      try {
        const json = JSON.parse(gptText);
        res.json({ success: true, data: json });
      } catch (err) {
        res.status(500).json({ success: false, message: "Failed to extract the data from the image", raw: gptText });
      }
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error", error });
    }
  };
  