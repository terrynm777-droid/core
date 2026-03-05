import type { NextRequest } from "next/server";

export function getRequestId(req: NextRequest) {
  return req.headers.get("x-request-id") ?? crypto.randomUUID();
}

export async function sha256Hex(input: string) {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export function logApi(obj: Record<string, any>) {
  console.log(JSON.stringify(obj));
}