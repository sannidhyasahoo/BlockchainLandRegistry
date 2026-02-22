import dotenv from 'dotenv';
dotenv.config();

const PINATA_JWT = process.env.VITE_PINATA_JWT;

async function testAuth() {
  if (!PINATA_JWT) {
    console.error("No VITE_PINATA_JWT found in .env!");
    return;
  }

  console.log("Testing Pinata JWT length:", PINATA_JWT.length);

  try {
    const res = await fetch("https://api.pinata.cloud/data/testAuthentication", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
    });

    const data = await res.json();
    console.log("Pinata Status:", res.status);
    console.log("Response:", data);
  } catch (err) {
    console.error("Fetch failed entirely:", err.message);
  }
}

testAuth();
