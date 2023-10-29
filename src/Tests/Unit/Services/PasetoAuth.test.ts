import {
  generateToken,
  decryptToken,
} from "./../../../Classes/Services/Authentication/PasetoAuth.js";

it("Generate and Decrypt paseto token", async () => {
  const clientToken = await generateToken({});

  const isValidToken = await decryptToken(
    clientToken.signedContent,
    clientToken.publicKeyPEM
  );

  expect(isValidToken).toBe(true);
});
