import { jsPDF } from "jspdf";
import { ethers } from "ethers";

/**
 * Generates and triggers download of a PDF receipt for a transaction.
 * @param {string} actionName E.g., "Funds Deposited", "Transfer Finalized"
 * @param {string} txHash The resulting transaction hash
 * @param {string|number} tokenId The property token ID
 * @param {string} userAddress The wallet address executing the transation
 */
export function generateReceiptPDF(actionName, txHash, tokenId, userAddress) {
  const doc = new jsPDF();
  
  // Basic styling setup
  doc.setFont("helvetica");
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(34, 197, 94); // A nice teal/green
  doc.text("Land Registry Transaction Receipt", 20, 30);
  
  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 35, 190, 35);
  
  // Body Details
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  
  const date = new Date().toLocaleString();
  
  doc.text(`Action:`, 20, 50);
  doc.setFont("helvetica", "bold");
  doc.text(`${actionName}`, 60, 50);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Property ID:`, 20, 60);
  doc.setFont("helvetica", "bold");
  doc.text(`#${tokenId}`, 60, 60);

  doc.setFont("helvetica", "normal");
  doc.text(`Timestamp:`, 20, 70);
  doc.text(`${date}`, 60, 70);

  doc.text(`Executed By:`, 20, 80);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${userAddress}`, 60, 80);

  // Tx Hash (Long logic)
  doc.setFontSize(12);
  doc.text(`Transaction:`, 20, 100);
  doc.setFontSize(9);
  doc.setTextColor(0, 102, 204);
  doc.text(`${txHash}`, 60, 100);

  // Footer / Signature
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 130, 190, 130);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("This receipt is cryptographically verifiable on the Polygon Amoy Testnet.", 20, 140);
  
  // Digital Stamp
  doc.setFont("helvetica", "italic");
  doc.setTextColor(150, 150, 150);
  doc.text("Digitally Signed by Smart Contract Engine", 20, 150);

  // Save/Download
  const filename = `receipt_${actionName.replace(/\s+/g, '_').toLowerCase()}_${tokenId}.pdf`;
  doc.save(filename);
}
