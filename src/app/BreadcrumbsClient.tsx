"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Link from 'next/link';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { useSession } from 'next-auth/react';

export default function BreadcrumbsClient() {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  useSession(); // Just to trigger rerender on session change, not used directly

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const segments = pathname.split('/').filter(Boolean);
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
