export { proxy as middleware } from "./proxy";

export const config = {
  // run on all routes except Next static/assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};