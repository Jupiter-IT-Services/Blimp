import { useEffect } from "react";
import Loader from "../loader";
import { redirect } from "next/navigation";

export default function ForceHome() {

    useEffect(() => {
        redirect("/")
    }, [])

    return (
        <Loader />
    )
}