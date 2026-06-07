import { redirect } from "react-router";

export async function loader() {
  return redirect("/documents/privacy-policy.pdf", {
    status: 301,
  });
}
