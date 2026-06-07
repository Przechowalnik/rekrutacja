import { redirect } from "react-router";

export async function loader() {
  return redirect("/documents/terms-and-conditions.pdf", {
    status: 301,
  });
}
