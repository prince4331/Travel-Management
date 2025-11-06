import {
  BookCopy,
  Home,
  Map,
  Settings2,
  UsersRound,
} from "lucide-react";

export const navigationItems = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/groups", label: "Groups", icon: UsersRound },
  { href: "/maps", label: "Maps & Offline", icon: Map },
  { href: "/guides", label: "Guides", icon: BookCopy },
  { href: "/settings", label: "Settings", icon: Settings2 },
];
