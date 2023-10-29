import { V2 } from "paseto";
import { generateKeyPairSync } from "crypto";

export const generateToken = async (payload: object) => {
  const payloadBuffer = Buffer.from(JSON.stringify(payload));

  const { privateKey, publicKey } = generateKeyPairSync("ed25519");

  const signedContent = await V2.sign(payloadBuffer, privateKey);
  const publicKeyPEM = publicKey
    .export({ type: "spki", format: "pem" })
    .toString();

  return { signedContent, publicKeyPEM };
};

export const decryptToken = async (
  token: string,
  publicKey: string
): Promise<boolean> => {
  try {
    await V2.verify(token, publicKey);
    return true; // The token is valid
  } catch (err) {
    console.error("Token verification error:", err);
    return false; // The token is invalid
  }
};
