import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, ShieldCheck, X, Lock, GitBranch, Sun, Moon, Contrast } from 'lucide-react';
import { routeMetaList, siteConfig } from '../config/siteConfig';
import { SiteTheme, useTheme } from '../context/ThemeContext';

const themeMeta: Record<SiteTheme, { label: string; nextHint: string }> = {
  midnight: { label: 'Midnight', nextHint: 'Switch to Light background' },
  light: { label: 'Light', nextHint: 'Switch to Slate background' },
  slate: { label: 'Slate', nextHint: 'Switch to Midnight background' },
};

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme, cycleTheme } = useTheme();

  const renderThemeIcon = (t: SiteTheme) => {
    if (t === 'light') return <Sun className="h-3.5 w-3.5 text-amber-400" />;
    if (t === 'slate') return <Contrast className="h-3.5 w-3.5 text-cyan-300" />;
    return <Moon className="h-3.5 w-3.5 text-violet-300" />;
  };

  useEffect(() => {
    const meta = routeMetaList.find((r) => r.path === location.pathname);
    document.title = meta ? meta.title : siteConfig.project.fullTitle;
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#060b16] text-[#f1f5f9]">
      {/* Skip link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-cyan-400 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-950"
      >
        Skip to main content
      </a>

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-[#1e2d4a]/80 bg-[#060b16]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-lg py-1 pr-2 text-left transition hover:opacity-90"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <span className="font-display block text-base font-bold leading-none tracking-tight text-white">
                {siteConfig.project.title}
              </span>
              <span className="font-mono mt-0.5 block text-[11px] text-cyan-300/80">
                CNS // HYBRID CRYPTO
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {routeMetaList.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors xl:px-3 xl:text-[13px] ${
                    isActive
                      ? 'border border-cyan-400/40 bg-cyan-400/12 text-cyan-200'
                      : 'border border-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`
                }
              >
                {item.shortLabel}
              </NavLink>
            ))}
          </nav>

          {/* Theme Switcher + Mobile Menu Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cycleTheme}
              title={themeMeta[theme].nextHint}
              aria-label={`Background theme: ${themeMeta[theme].label}. ${themeMeta[theme].nextHint}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#1e2d4a] bg-[#0b1324] px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white"
            >
              {renderThemeIcon(theme)}
              <span className="font-mono">{themeMeta[theme].label}</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="inline-flex items-center justify-center rounded-lg border border-[#1e2d4a] bg-[#0b1324] p-2 text-slate-200 hover:border-cyan-400/50 hover:text-cyan-200 lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile Navigation"
            className="border-t border-[#1e2d4a] bg-[#0b1324] px-4 py-3 lg:hidden"
          >
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {routeMetaList.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive
                        ? 'border border-cyan-400/40 bg-cyan-400/12 text-cyan-200'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`
                  }
                >
                  <span>{item.label}</span>
                  <span className="font-mono text-[11px] text-slate-500">{item.path}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main id="main-content" className="min-w-0 flex-1 overflow-x-clip">
        {children}
      </main>

      {/* Consistent Editorial Footer */}
      <footer className="border-t border-[#1e2d4a] bg-[#070d1b] py-10 text-sm text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 text-white">
                <Lock className="h-4 w-4 text-cyan-400" />
                <span className="font-display font-semibold">{siteConfig.project.fullTitle}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Educational Cryptography &amp; Network Security proof of concept demonstrating mutual X.509 PKI,
                authenticated Diffie–Hellman, AES-128-CBC, RSA signatures, replay/freshness checks, and offline
                transcript verification.
              </p>
            </div>

            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-slate-300">Color Semantics</p>
              <ul className="mt-2 space-y-1.5 text-xs">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-violet-400" />
                  <span>Violet — Key agreement &amp; ephemeral DH</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>Mint — Accepted &amp; verified delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>Amber — Transcript &amp; SessionReceipt evidence</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  <span>Rose — Rejected attacks (REPLAY / STALE / SIG_FAIL)</span>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-slate-300">Course &amp; Verification</p>
              <p className="mt-2 text-xs text-slate-400">{siteConfig.project.course}</p>
              <p className="mt-1 text-xs text-slate-500">{siteConfig.project.semester}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to="/evidence"
                  className="font-mono rounded border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs text-amber-200 hover:bg-amber-400/20"
                >
                  Audit Evidence
                </Link>
                <Link
                  to="/team"
                  className="font-mono rounded border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-xs text-cyan-200 hover:bg-cyan-400/20"
                >
                  Team
                </Link>
                {siteConfig.project.teamRepositoryUrl && (
                  <a
                    href={siteConfig.project.teamRepositoryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono inline-flex items-center gap-1 rounded border border-slate-700 px-2.5 py-1 text-xs text-slate-200 hover:border-cyan-400/50"
                  >
                    <GitBranch className="h-3.5 w-3.5" /> Repo
                  </a>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[11px] text-slate-400 mr-1">Background:</span>
                {(['midnight', 'slate', 'light'] as SiteTheme[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    aria-pressed={theme === t}
                    className={`font-mono rounded border px-2 py-0.5 text-[11px] transition ${
                      theme === t
                        ? 'border-cyan-400 bg-cyan-400/15 text-cyan-200 font-semibold'
                        : 'border-[#1e2d4a] bg-[#0b1324] text-slate-300 hover:border-cyan-400/40'
                    }`}
                  >
                    {themeMeta[t].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
