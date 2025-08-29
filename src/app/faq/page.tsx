"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FAQPage() {
  const router = useRouter();

  useEffect(() => {
    // 重定向到主页的FAQ部分
    router.replace("/#faq");
  }, [router]);

  return null;
}