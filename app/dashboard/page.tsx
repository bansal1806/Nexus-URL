import prisma from '@/lib/prisma';
import { Link2, Clock, MousePointer2, ExternalLink, Globe2, Monitor, Compass } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getStats() {
  const links = await prisma.shortLink.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const totalLinks = await prisma.shortLink.count();
  const totalClicks = await prisma.clickAnalytics.count();

  // Group by country
  const countryStatsRaw = await prisma.clickAnalytics.groupBy({
    by: ['country'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  });
  const countryStats = countryStatsRaw.map(s => ({ name: s.country || 'Unknown', count: s._count.id }));

  // Group by Browser
  const browserStatsRaw = await prisma.clickAnalytics.groupBy({
    by: ['browser'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  });
  const browserStats = browserStatsRaw.map(s => ({ name: s.browser || 'Unknown', count: s._count.id }));

  // Group by OS
  const osStatsRaw = await prisma.clickAnalytics.groupBy({
    by: ['os'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  });
  const osStats = osStatsRaw.map(s => ({ name: s.os || 'Unknown', count: s._count.id }));

  return { links, totalLinks, totalClicks, countryStats, browserStats, osStats };
}

export default async function Dashboard() {
  const stats = await getStats();
  const { links, totalLinks, totalClicks, countryStats, browserStats, osStats } = stats;

  return (
    <div className="min-h-screen bg-[#030303] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tight">The <span className="text-purple-500">Pulse</span></h1>
            <p className="text-zinc-500">Real-time performance analytics for your links.</p>
          </div>
          <a href="/" className="px-6 py-3 rounded-xl glass hover:bg-white/5 transition-colors inline-block text-sm font-bold border border-white/5">
            + Create New Link
          </a>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Links', value: totalLinks, icon: Link2 },
            { label: 'Total Clicks', value: totalClicks, icon: MousePointer2 },
            { label: 'Avg. Latency', value: '< 42ms', icon: Clock },
            { label: 'Uptime', value: '100%', icon: ExternalLink },
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl glass-card">
              <div className="flex items-center gap-3 mb-4 text-zinc-500">
                <stat.icon className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">{stat.label}</span>
              </div>
              <div className="text-3xl font-black">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Analytics Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Top Countries */}
          <div className="p-8 rounded-3xl glass border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <Globe2 className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold">Top Regions</h3>
            </div>
            <div className="space-y-4">
              {countryStats.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-300 font-medium">{item.name}</span>
                    <span className="text-zinc-500 font-mono">{item.count}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{ width: `${Math.max((item.count / (totalClicks || 1)) * 100, 2)}%` }}></div>
                  </div>
                </div>
              ))}
              {countryStats.length === 0 && <p className="text-zinc-500 text-sm">No data yet.</p>}
            </div>
          </div>

          {/* Top Browsers */}
          <div className="p-8 rounded-3xl glass border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <Compass className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold">Top Browsers</h3>
            </div>
            <div className="space-y-4">
              {browserStats.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-300 font-medium">{item.name}</span>
                    <span className="text-zinc-500 font-mono">{item.count}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.max((item.count / (totalClicks || 1)) * 100, 2)}%` }}></div>
                  </div>
                </div>
              ))}
              {browserStats.length === 0 && <p className="text-zinc-500 text-sm">No data yet.</p>}
            </div>
          </div>

          {/* Top Operating Systems */}
          <div className="p-8 rounded-3xl glass border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <Monitor className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold">Operating Systems</h3>
            </div>
            <div className="space-y-4">
              {osStats.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-300 font-medium">{item.name}</span>
                    <span className="text-zinc-500 font-mono">{item.count}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.max((item.count / (totalClicks || 1)) * 100, 2)}%` }}></div>
                  </div>
                </div>
              ))}
              {osStats.length === 0 && <p className="text-zinc-500 text-sm">No data yet.</p>}
            </div>
          </div>
        </div>

        {/* Links Table */}
        <div className="rounded-3xl glass border border-white/5 overflow-hidden">
          <div className="p-8 border-b border-white/5">
            <h2 className="text-xl font-bold">Recent Links</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-5 text-xs font-bold uppercase text-zinc-500 tracking-wider">Short Link</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase text-zinc-500 tracking-wider">Original URL</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase text-zinc-500 tracking-wider">Created</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase text-zinc-500 tracking-wider text-right">Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {links.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-zinc-500">
                      No links found. Start by shortening your first URL.
                    </td>
                  </tr>
                ) : (
                  links.map((link: { id: string; shortCode: string; originalUrl: string; createdAt: Date; clicks: number }) => (
                    <tr key={link.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6 font-mono font-bold text-purple-400">
                        {link.shortCode}
                      </td>
                      <td className="px-8 py-6 max-w-md">
                        <div className="truncate text-sm text-zinc-300 group-hover:text-white transition-colors">
                          {link.originalUrl}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-zinc-500">
                        {new Date(link.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6 text-right font-black text-xl">
                        {link.clicks}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
