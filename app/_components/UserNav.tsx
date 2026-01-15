"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function UserNav() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  };

  if (isPending) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </Link>
        <Link href="/register">
          <Button size="sm">Sign Up</Button>
        </Link>
      </div>
    );
  }

  const initials =
    session.user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() ||
    session.user?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex flex-col items-end">
        <p className="text-sm font-medium text-white drop-shadow-md">
          {session.user?.name || session.user?.email}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 rounded-full">
            <Avatar className="h-9 w-9 border-2 border-white shadow-lg cursor-pointer">
              <AvatarImage
                src={session.user?.image || undefined}
                alt={session.user?.name || "User"}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="p-2">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {session.user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {session.user?.email}
            </p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
