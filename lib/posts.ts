// lib/posts.ts
export type Post = {
  id: string;
  content: string;
  createdAt: string; // ISO
};

declare global {
  // eslint-disable-next-line no-var
  var __corePosts: Post[] | undefined;
}

const seed: Post[] = [
  {
    id: "seed-1",
    content: "Welcome to CORE. Signal over noise.",
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: "seed-2",
    content: "MVP SNS feed is live. Next: images + auth + realtime.",
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
];

function store(): Post[] {
  if (!globalThis.__corePosts) globalThis.__corePosts = [...seed];
  return globalThis.__corePosts;
}

function makeId(): string {
  // Works in Node 18+ (Vercel) and locally. Safe fallback if crypto fails.
  try {
    return crypto.randomUUID();
  } catch {
    return `p_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

export function listPosts(): Post[] {
  return store()
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function addPost(content: string): Post {
  const text = content.trim();

  const post: Post = {
    id: makeId(),
    content: text,
    createdAt: new Date().toISOString(),
  };

  store().push(post);
  return post;
}

export function getPostById(id: string): Post | null {
  return store().find((p) => p.id === id) ?? null;
}

export function deletePostById(id: string): boolean {
  const s = store();
  const idx = s.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  s.splice(idx, 1);
  return true;
}