"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";

export default function CatalogPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page where filters are now available
    router.replace("/");
  }, [router]);

  return <LoadingScreen />;
} 