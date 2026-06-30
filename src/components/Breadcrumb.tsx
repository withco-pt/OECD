"use client";

import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-[8px] text-[14px] mb-[16px]">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-[8px]">
          {i > 0 && <span className="text-primary-400">›</span>}
          {item.href ? (
            <Link
              href={item.href}
              className="text-neutral-800 underline hover:text-neutral-800"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-neutral-800">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
