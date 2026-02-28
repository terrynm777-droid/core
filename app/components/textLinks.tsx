import React from "react";

const URL_RE = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;

export function normalizeUrl(u: string) {
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `https://${u}`;
}

export function firstUrl(text: string) {
  const m = (text || "").match(URL_RE);
  return m?.[0] ? normalizeUrl(m[0]) : "";
}

export function renderWithLinks(text: string) {
  const s = text || "";
  const parts: React.ReactNode[] = [];
  let last = 0;

  s.replace(URL_RE, (match, _a, _b, offset) => {
    parts.push(s.slice(last, offset));
    const href = normalizeUrl(match);
    parts.push(
      <a
        key={`${offset}-${href}`}
        href={href}
        target="_blank"
        rel="noreferrer"
        className="underline"
      >
        {match}
      </a>
    );
    last = offset + match.length;
    return match;
  });

  parts.push(s.slice(last));
  return parts;
}