import { createFileRoute, redirect } from "@tanstack/react-router";
import { parseLang } from "@/lib/sungroup-content";

// Old design-sample URL; version C is now the home page.
export const Route = createFileRoute("/sun")({
  validateSearch: parseLang,
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/", search, statusCode: 301 });
  },
});
