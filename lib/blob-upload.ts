import { put } from "@vercel/blob";

export async function uploadToBlob(buffer: Buffer, pathname: string): Promise<string> {
  const body = new Blob([new Uint8Array(buffer)]);
  const result = await put(pathname, body, { access: "public" });
  return result.url;
}

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
