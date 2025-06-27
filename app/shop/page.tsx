"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";

export default function ShopRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to home page section
        router.replace("/#collection");
    }, [router]);

    return <LoadingScreen />;
}
