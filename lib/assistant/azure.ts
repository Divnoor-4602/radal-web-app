import { createAzure } from "@ai-sdk/azure";

// Create Azure provider
export function createAzureProvider() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
  const resourceName = endpoint
    .replace("https://", "")
    .replace(".openai.azure.com/", "");

  return createAzure({
    resourceName: resourceName,
    apiKey: process.env.AZURE_OPENAI_API_KEY!,
  });
}
