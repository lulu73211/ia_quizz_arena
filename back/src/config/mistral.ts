const apiKey = process.env.MISTRAL_API_KEY;

if (!apiKey) {
  throw new Error("Missing MISTRAL_API_KEY in back/.env");
}

export const mistralConfig = {
  apiKey,
  baseUrl: process.env.MISTRAL_API_BASE_URL ?? "https://api.mistral.ai",
};
