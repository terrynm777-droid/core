// app/auth/page.tsx
import AuthClient from "./AuthClient";

export default function AuthPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const next = searchParams?.next || "/feed";
  return <AuthClient next={next} />;
}