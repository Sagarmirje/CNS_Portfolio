import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { routeMetaList } from '../config/siteConfig';

interface PagePagerProps {
  currentPath: string;
}

export const PagePager: React.FC<PagePagerProps> = ({ currentPath }) => {
  const idx = routeMetaList.findIndex((r) => r.path === currentPath);
  if (idx === -1) return null;

  const prev = idx > 0 ? routeMetaList[idx - 1] : null;
  const next = idx < routeMetaList.length - 1 ? routeMetaList[idx + 1] : null;

  return (
    <nav
      aria-label="Page sequence navigation"
      className="mt-14 flex flex-col gap-3 border-t border-[#1e2d4a] pt-8 sm:flex-row sm:items-center sm:justify-between"
    >
      {prev ? (
        <Link
          to={prev.path}
          className="group flex items-center gap-3 rounded-xl border border-[#1e2d4a] bg-[#0b1324] px-4 py-3 transition hover:border-cyan-400/40 hover:bg-[#111c33]"
        >
          <ArrowLeft className="h-4 w-4 text-slate-400 transition group-hover:-translate-x-0.5 group-hover:text-cyan-300" />
          <div>
            <span className="font-mono block text-[11px] uppercase tracking-wider text-slate-500">
              Previous Section
            </span>
            <span className="font-display text-sm font-semibold text-white">{prev.label}</span>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          to={next.path}
          className="group flex items-center justify-between gap-3 rounded-xl border border-[#1e2d4a] bg-[#0b1324] px-4 py-3 text-right transition hover:border-cyan-400/40 hover:bg-[#111c33] sm:justify-end"
        >
          <div>
            <span className="font-mono block text-[11px] uppercase tracking-wider text-slate-500">
              Next Section
            </span>
            <span className="font-display text-sm font-semibold text-white">{next.label}</span>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
};
