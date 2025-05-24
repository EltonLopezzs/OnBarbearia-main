// app/admin/_components/AdminSignOutButton.tsx
"use client";

import { Button } from "@/app/_components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function AdminSignOutButton() {
  return (
    <Button
      variant="outline"
      className="w-full justify-start text-md p-3 hover:bg-destructive hover:text-destructive-foreground border-destructive/50 text-destructive"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut className="mr-3 h-5 w-5" />
      Sair do Painel
    </Button>
  );
}