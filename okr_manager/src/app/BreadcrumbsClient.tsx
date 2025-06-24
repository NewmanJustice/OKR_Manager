"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Link from 'next/link';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

export default function BreadcrumbsClient() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = [
    { label: 'Home', href: '/', icon: <HomeRoundedIcon fontSize="small" /> },
    ...segments.map((seg, idx) => {
      const href = '/' + segments.slice(0, idx + 1).join('/');
      return { label: seg.charAt(0).toUpperCase() + seg.slice(1), href, icon: undefined };
    })
  ];
  return (
    <div className="max-w-3xl mx-auto px-4 mt-2 mb-4">
      <Breadcrumbs separator="/" size="sm">
        {crumbs.map((crumb, i) => (
          <Link key={crumb.href} href={crumb.href} className="text-blue-700 hover:underline flex items-center gap-1">
            {crumb.icon && crumb.icon}
            {crumb.label}
          </Link>
        ))}
      </Breadcrumbs>
    </div>
  );
}
