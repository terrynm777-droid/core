import Link from "next/link";

type Post = {
  id: string;
  createdAt: string;
  authorName: string;
  content: string;
  imageUrl?: string;
  likeCount: number;
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <div className="rounded-2xl border border-[#D7E4DD] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold">{post.authorName}</div>
          <div className="text-xs text-[#6B7A74]">{formatTime(post.createdAt)}</div>
        </div>
        <div className="text-xs text-[#6B7A74]">♥ {post.likeCount}</div>
      </div>

      <div className="mt-3 whitespace-pre-wrap text-sm text-[#0B0F0E]">
        {post.content}
      </div>

      {post.imageUrl ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#E5EFEA]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.imageUrl}
            alt="post image"
            className="h-auto w-full object-cover"
          />
        </div>
      ) : null}

      <div className="mt-4">
        <Link
          href={`/p/${post.id}`}
          className="text-sm font-medium text-[#16A34A] hover:underline"
        >
          Open →
        </Link>
      </div>
    </div>
  );
}