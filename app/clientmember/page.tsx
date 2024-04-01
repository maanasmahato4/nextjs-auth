"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function ClientMember() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/api/auth/signin?callbackUrl=/clientmember");
    },
  });

  return (
    <div>
      client member
      <p>{session?.user?.email}</p>
      <p>{session?.user?.role}</p>
    </div>
  );
}
