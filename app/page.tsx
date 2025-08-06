import { redirect } from "next/navigation";

export default async function Home() {
  // Redirect to the dahsboard page
  redirect("/dashboard");
}
