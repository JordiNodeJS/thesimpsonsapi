import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-yellow-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 rounded px-1"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-zinc-900 dark:text-zinc-100 font-medium">
                {item.label}
              </span>
            )}
            {index < items.length - 1 && (
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
