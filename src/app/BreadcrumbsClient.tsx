"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Link from 'next/link';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

export default function BreadcrumbsClient() {
  const pathname = usePathname();
  const [user, setUser] = React.useState<Record<string, unknown> | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    fetch('/api/user/me')
      .then(async res => {
        if (res.ok) {
          setUser(await res.json());
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, []);

  // Always render placeholder on both server and client until mounted and user are available
  if (!mounted || !user) {
    return (
      <div style={{ minHeight: 40 }} />
    );
  }

  const segments = pathname.split('/').filter(Boolean);
  // Remove 'admin' or 'pdm' from breadcrumbs if it's the only segment (i.e., home for that role)
  let filteredSegments = segments;
  if ((segments[0] === 'admin' || segments[0] === 'pdm') && segments.length === 1) {
    filteredSegments = [];
  }
  const crumbs = [
    { label: 'Home', href: '/', icon: <HomeRoundedIcon fontSize="small" /> },
    ...filteredSegments.map((seg, idx) => {
      const href = '/' + filteredSegments.slice(0, idx + 1).join('/');
      return { label: seg.charAt(0).toUpperCase() + seg.slice(1), href, icon: undefined };
    })
  ];
  return (
    <div className="max-w-3xl mx-auto px-4 mt-2 mb-4">
      <Breadcrumbs separator="/" size="sm">
        {crumbs.map(crumb => (
          <Link key={crumb.href} href={crumb.href} className="breadcrumb-link flex items-center gap-1">
            {crumb.icon && crumb.icon}
            {crumb.label}
          </Link>
        ))}
      </Breadcrumbs>
    </div>
  );
}
