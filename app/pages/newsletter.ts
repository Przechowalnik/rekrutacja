import { redirect } from "react-router";

export async function loader() {
  return redirect("/documents/newsletter.pdf", {
    status: 301,
  });
}
