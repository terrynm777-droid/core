export type Post = {
  id: string;
  createdAt: string;
  authorName: string;
  content: string;
  imageUrl?: string;
  likeCount: number;
};

declare global {
  // Prevent re-init during dev hot reload
  // eslint-disable-next-line no-var
  var __CORE_POSTS__: Post[] | undefined;
}

function seed(): Post[] {
  const now = Date.now();
  return [
    {
      id: "p1",
      createdAt: new Date(now - 1000 * 60 * 10).toISOString(),
      authorName: "CORE",
      content: "Welcome to CORE. Signal over noise.",
      likeCount: 3,
    },
    {
      id: "p2",
      createdAt: new Date(now - 1000 * 60 * 3).toISOString(),
      authorName: "Terry",
      content: "MVP SNS feed is live. Next: images + auth + realtime.",
      likeCount: 1,
    },
  ];
}

function store(): Post[] {
  if (!globalThis.__CORE_POSTS__) globalThis.__CORE_POSTS__ = seed();
  return globalThis.__CORE_POSTS__;
}

export function listPosts(): Post[] {
  return store().slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getPost(id: string): Post | undefined {
  return store().find((p) => p.id === id);
}

export function createPost(input: {
  authorName?: string;
  content: string;
  imageUrl?: string;
}): Post {
  const id = `p_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
  const post: Post = {
    id,
    createdAt: new Date().toISOString(),
    authorName: (input.authorName || "Anonymous").slice(0, 40),
    content: input.content.trim().slice(0, 2000),
    imageUrl: input.imageUrl?.trim() ? input.imageUrl.trim() : undefined,
    likeCount: 0,
  };
  store().unshift(post);
  return post;
}