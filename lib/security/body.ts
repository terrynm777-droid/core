import type { NextRequest } from "next/server";

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function readJsonWithLimit<T>(
  req: NextRequest,
  opts: { maxBytes: number }
): Promise<T> {
  const len = req.headers.get("content-length");
  if (len && Number(len) > opts.maxBytes) {
    throw new HttpError(413, "Payload too large");
  }

  const text = await req.text();

  // Edge-safe byte length
  const bytes = new TextEncoder().encode(text).length;
  if (bytes > opts.maxBytes) {
    throw new HttpError(413, "Payload too large");
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HttpError(400, "Invalid JSON");
  }
}