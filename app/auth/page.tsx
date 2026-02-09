import AuthClient from "./AuthClient";

export default async function AuthPage(props: {
  searchParams?: Promise<{ next?: string }> | { next?: string };
}) {
  const sp =
    props.searchParams && typeof (props.searchParams as any).then === "function"
      ? await (props.searchParams as Promise<{ next?: string }>)
      : (props.searchParams as { next?: string } | undefined);

  const next = sp?.next || "/feed";

  return <AuthClient next={next} />;
}