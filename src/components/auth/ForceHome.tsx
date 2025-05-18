import { useEffect } from "react";
import Loader from "../loader";
import { redirect } from "next/navigation";

export default function ForceHome({ href }: { href?: string }) {
  useEffect(() => {
    redirect(href ? href : "/");
  }, []);

  return <Loader />;
}
