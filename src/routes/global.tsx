import { createFileRoute, redirect } from "@tanstack/react-router";
import { parseLang } from "@/lib/sungroup-content";

// Old design-sample URL; design samples were retired.
export const Route = createFileRoute("/global")({
  validateSearch: parseLang,
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/", search, statusCode: 301 });
  },
});
