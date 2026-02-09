import AuthClient from "./AuthClient";

export const runtime = "nodejs";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const next = sp?.next || "/feed";
  return <AuthClient next={next} />;
}