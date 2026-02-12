// app/auth/page.tsx
import AuthClient from "./AuthClient";

export default async function AuthPage({
  searchParams,
}: {
  searchParams?: { next?: string; mode?: string };
}) {
  const next = searchParams?.next ?? "/feed";
  const mode = searchParams?.mode === "signup" ? "signup" : "login";

  return <AuthClient next={next} mode={mode} />;
}