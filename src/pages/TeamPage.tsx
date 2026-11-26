import React from 'react';
import { Users } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { PagePager } from '../components/PagePager';

export const TeamPage: React.FC = () => {
  const { teamMembers } = siteConfig;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cyan-300">
          <Users className="h-4 w-4" />
          <span>08 // Team</span>
        </div>
        <h1 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl">
          Project Team
        </h1>
      </header>

      <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {teamMembers.map((member, index) => (
          <article
            key={member.usn}
            className="group overflow-hidden rounded-2xl border border-[#1e2d4a] bg-[#0b1324] transition hover:border-cyan-400/50"
          >
            <div className="relative aspect-square w-full overflow-hidden border-b border-[#1e2d4a] bg-[#070d19]">
              <img
                src={member.image}
                alt={member.name}
                className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-[1.02]"
              />
              <span className="font-mono absolute top-3 left-3 rounded-lg border border-cyan-400/40 bg-[#0b1324] px-2 py-0.5 text-[11px] font-semibold text-cyan-200 shadow-sm">
                0{index + 1}
              </span>
            </div>

            <div className="p-5">
              <h2 className="font-display text-lg font-bold text-white">{member.name}</h2>

              <dl className="mt-3 space-y-1.5 border-t border-[#1e2d4a] pt-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <dt className="font-mono uppercase tracking-wider text-slate-400">USN</dt>
                  <dd className="font-mono font-semibold text-cyan-300">{member.usn}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="font-mono uppercase tracking-wider text-slate-400">Roll.no</dt>
                  <dd className="font-mono font-semibold text-slate-200">{member.rollNumber}</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </section>

      <PagePager currentPath="/team" />
    </div>
  );
};
