import React, { useCallback, useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpRight, CheckCircle2, CircleAlert, Laptop, Monitor, RefreshCw, ShieldCheck } from 'lucide-react';

const RELEASES_API = 'https://api.github.com/repos/ibarakumo2000-stack/Mark-56/releases/latest';
const RELEASES_PAGE = 'https://github.com/ibarakumo2000-stack/Mark-56/releases';

type ReleaseAsset = {
  name: string;
  browser_download_url: string;
  size: number;
  content_type?: string;
};

type Release = {
  tag_name: string;
  name: string;
  html_url: string;
  body: string;
  published_at: string;
  assets: ReleaseAsset[];
};

type Platform = 'windows' | 'linux' | 'macos';

const platformInfo: Record<Platform, { title: string; description: string; icon: React.ReactNode }> = {
  windows: {
    title: 'Windows',
    description: 'Windows 10/11 · 64-bit installer',
    icon: <Monitor className="h-6 w-6" />,
  },
  linux: {
    title: 'Ubuntu / Linux',
    description: 'Ubuntu / Linux x64 · portable archive',
    icon: <Laptop className="h-6 w-6" />,
  },
  macos: {
    title: 'macOS',
    description: 'macOS · Apple Silicon or Intel disk image',
    icon: <Laptop className="h-6 w-6" />,
  },
};

function assetPlatform(name: string): Platform | null {
  const lower = name.toLowerCase();
  if (lower.endsWith('.exe') && /mark|lv|setup|installer/.test(lower)) return 'windows';
  if ((lower.endsWith('.deb') || lower.endsWith('.appimage') || lower.endsWith('.rpm') || lower.endsWith('.tar.gz')) && /mark|lv|setup|installer/.test(lower)) return 'linux';
  if (lower.endsWith('.dmg') && /mark|lv|setup|installer/.test(lower)) return 'macos';
  return null;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const DownloadPage: React.FC = () => {
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadRelease = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await fetch(RELEASES_API, {
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (response.status === 404) {
        setRelease(null);
        return;
      }
      if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status}`);
      const data = (await response.json()) as Release;
      setRelease(data);
    } catch {
      setLoadError('We could not check GitHub Releases right now. You can still open the official releases page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRelease();
  }, [loadRelease]);

  const assetsByPlatform = new Map<Platform, ReleaseAsset>();
  release?.assets.forEach((asset) => {
    const platform = assetPlatform(asset.name);
    if (platform && !assetsByPlatform.has(platform)) assetsByPlatform.set(platform, asset);
  });

  return (
    <div className="py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-2xl border border-[#2C302A] bg-[#151714] p-6 sm:p-10 lg:p-14">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#C8FF45]/[0.07] blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#C8FF45]/30 bg-[#C8FF45]/[0.07] px-3 py-1.5 text-xs font-mono uppercase tracking-widest text-[#C8FF45]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C8FF45]" />
              Mark 56 · Desktop AI
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#F5F5F0] sm:text-5xl lg:text-6xl">
              Your assistant.<br /><span className="text-[#C8FF45]">Your machine.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#C5C8C1] sm:text-base">
              Get Mark 56 for your desktop. Choose your operating system below. Installers only become downloadable here after a release has actually been published.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#platform-downloads" className="inline-flex items-center gap-2 rounded-lg bg-[#C8FF45] px-5 py-3 text-sm font-bold text-[#101110] transition hover:bg-[#d8ff78]">
                <ArrowDownToLine className="h-4 w-4" /> Choose your download
              </a>
              <a href={RELEASES_PAGE} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-[#3A3E36] px-5 py-3 text-sm font-semibold text-[#F5F5F0] transition hover:border-[#C8FF45]">
                Release notes <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        <section id="platform-downloads" className="scroll-mt-28 pt-12 md:pt-16">
          <div className="flex flex-col gap-3 border-b border-[#2C302A] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[#C8FF45]">Get Mark 56</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-[#F5F5F0] sm:text-3xl">Choose your platform</h2>
            </div>
            <button type="button" onClick={() => void loadRelease()} disabled={loading} className="inline-flex items-center gap-2 self-start rounded-lg border border-[#2C302A] px-3 py-2 text-xs font-semibold text-[#C5C8C1] transition hover:border-[#C8FF45] hover:text-[#C8FF45] disabled:opacity-50">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Check for release
            </button>
          </div>

          {loadError && (
            <div role="status" className="mt-5 flex items-start gap-3 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm text-[#E7D7B0]">
              <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" /> <p>{loadError}</p>
            </div>
          )}

          {!loading && !release && !loadError && (
            <div role="status" className="mt-5 flex items-start gap-3 rounded-xl border border-[#2C302A] bg-[#191B18] p-4 text-sm text-[#C5C8C1]">
              <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#C8FF45]" />
              <div>
                <p className="font-semibold text-[#F5F5F0]">No published stable release yet</p>
                <p className="mt-1">The download links will activate automatically when a compatible installer is attached to the latest GitHub release.</p>
              </div>
            </div>
          )}

          {loading && (
            <p className="mt-6 text-sm text-[#8A8E85]" role="status">Checking the official release feed…</p>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {(Object.keys(platformInfo) as Platform[]).map((platform) => {
              const info = platformInfo[platform];
              const asset = assetsByPlatform.get(platform);
              const available = Boolean(asset);
              return (
                <article key={platform} className={`flex min-h-64 flex-col rounded-xl border p-5 sm:p-6 transition-colors ${available ? 'border-[#C8FF45]/40 bg-[#191D16]' : 'border-[#2C302A] bg-[#151714]'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${available ? 'border-[#C8FF45]/30 bg-[#C8FF45]/10 text-[#C8FF45]' : 'border-[#2C302A] bg-[#101110] text-[#8A8E85]'}`}>
                      {info.icon}
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider ${available ? 'bg-[#C8FF45]/10 text-[#C8FF45]' : 'bg-[#242721] text-[#8A8E85]'}`}>
                      {available ? 'Available' : loading ? 'Checking' : 'Coming soon'}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-[#F5F5F0]">{info.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-[#A8ADA3]">{info.description}</p>
                  {asset && (
                    <div className="mt-3 text-[11px] text-[#A8ADA3]">
                      <p className="break-all">{asset.name}</p>
                      <p className="mt-1">{formatSize(asset.size)} · verify with SHA256SUMS.txt from this release</p>
                    </div>
                  )}
                  <div className="mt-auto pt-6">
                    {asset ? (
                      <a href={asset.browser_download_url} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#C8FF45] px-4 py-3 text-xs font-extrabold text-[#101110] transition hover:bg-[#d8ff78]">
                        <ArrowDownToLine className="h-4 w-4" /> Download for {info.title}
                      </a>
                    ) : (
                      <a href={RELEASES_PAGE} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#2C302A] px-4 py-3 text-xs font-bold text-[#C5C8C1] transition hover:border-[#C8FF45] hover:text-[#C8FF45]">
                        View release status <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-10 grid gap-4 rounded-xl border border-[#2C302A] bg-[#151714] p-5 sm:grid-cols-2 sm:p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#C8FF45]" />
            <div>
              <h3 className="text-sm font-bold text-[#F5F5F0]">Verify before installing</h3>
              <p className="mt-1 text-xs leading-6 text-[#A8ADA3]">Use the SHA-256 checksum published with the same release to verify the installer you downloaded. Only install builds from the official Mark 56 repository.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#C8FF45]" />
            <div>
              <h3 className="text-sm font-bold text-[#F5F5F0]">Platform-specific builds</h3>
              <p className="mt-1 text-xs leading-6 text-[#A8ADA3]">Windows, Ubuntu/Linux, and macOS need their own tested packages. A Windows .exe is not compatible with Linux or macOS.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
