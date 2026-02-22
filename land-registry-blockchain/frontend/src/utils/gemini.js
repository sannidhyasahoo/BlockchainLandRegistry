import { GoogleGenerativeAI } from "@google/generative-ai";
import { ethers } from "ethers";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

/**
 * Runs a preemptive risk evaluation on a property transaction using Gemini.
 * @param {Object} property The property object including meta
 * @returns {Promise<string>} The evaluation markdown string
 */
export async function evaluateTransaction(property) {
  if (!genAI) {
    throw new Error("Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const desc = property.meta?.description || "No description provided.";
  const price = property.priceEth ? `${property.priceEth} POL` : "Unknown";
  const seller = property.seller || "Unknown";
  const buyer = property.potentialBuyer || "Unknown";
  
  const attributes = property.meta?.attributes 
    ? property.meta.attributes.map(a => `${a.trait_type}: ${a.value}`).join(", ")
    : "None";

  const prompt = `
You are an expert real estate compliance and risk assessment AI operating within a blockchain-based Land Registry application.

Please evaluate the following pending property transaction and provide a brief, professional risk assessment (1-2 short paragraphs). Point out any potential red flags or areas the Registrar should pay attention to before finalizing the transfer. If it looks standard, say so. Keep the tone formal and helpful.

Property Context:
- Token ID: #${property.tokenId}
- Name: ${property.meta?.name || "Unknown"}
- Description: ${desc}
- Price / Escrowed Funds: ${price}
- Seller Address: ${seller}
- Buyer Address: ${buyer}
- Metadata Attributes: ${attributes}
- Trust Recorded: ${property.trustRecorded ? "Yes" : "No"}
- Seller Confirmed Funds: ${property.sellerConfirmed ? "Yes" : "No"}
- Contains File Attachments (CID): ${property.meta?.attributes?.some(a => a.trait_type.includes("CID")) ? "Yes" : "No"}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Evaluation Error:", error);
    throw new Error("Failed to evaluate transaction with AI. See console for details.");
  }
}
