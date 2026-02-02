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

export function listPosts(): Post[] {
  return store().slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function addPost(content: string): Post {
  const post: Post = {
    id: crypto.randomUUID(),
    content,
    createdAt: new Date().toISOString(),
  };
  store().push(post);
  return post;
}
