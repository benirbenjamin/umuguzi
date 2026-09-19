import React from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import VideoCard from "@/components/video/VideoCard";
import ServiceCard from "@/components/services/ServiceCard";
import ProductCard from "@/components/products/ProductCard";
import prisma from "@/lib/prisma";
import { VideoItem, ServiceItem, ProductItem } from "@/types";
import {
  Flame,
  Sparkles,
  Briefcase,
  Store,
  Users,
  MessageSquare,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

// Server-side data fetching with fallback sample data for when DB is fresh
async function getHomepageData() {
  try {
    const [videos, categories, services, products, channels, posts] = await Promise.all([
      prisma.video.findMany({
        where: { status: "APPROVED" },
        include: {
          channel: {
            select: {
              id: true,
              name: true,
              handle: true,
              avatar: true,
              subscriberCount: true,
              isVerified: true,
            },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
      prisma.category.findMany({
        take: 10,
        orderBy: { name: "asc" },
      }),
      prisma.service.findMany({
        where: { status: "ACTIVE" },
        include: {
          provider: {
            select: {
              id: true,
              displayName: true,
              username: true,
              avatar: true,
              phone: true,
            },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { rating: "desc" },
        take: 4,
      }),
      prisma.product.findMany({
        include: {
          seller: {
            select: {
              id: true,
              displayName: true,
              username: true,
              avatar: true,
            },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { salesCount: "desc" },
        take: 4,
      }),
      prisma.channel.findMany({
        orderBy: { subscriberCount: "desc" },
        take: 6,
      }),
      prisma.post.findMany({
        include: {
          user: {
            select: { id: true, displayName: true, username: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

    return {
      videos: videos as unknown as VideoItem[],
      categories,
      services: services.map((s) => ({
        ...s,
        images: (s.images as string[]) || [],
      })) as unknown as ServiceItem[],
      products: products.map((p) => ({
        ...p,
        images: (p.images as string[]) || [],
      })) as unknown as ProductItem[],
      channels,
      posts,
    };
  } catch (error) {
    console.warn("Database not connected yet or empty, serving default landing data:", error);
    return {
      videos: [],
      categories: [],
      services: [],
      products: [],
      channels: [],
      posts: [],
    };
  }
}

export default async function HomePage() {
  const { videos, categories, services, products, channels, posts } = await getHomepageData();

  const trendingVideos = videos.slice(0, 4);
  const recommendedVideos = videos.slice(4, 12);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Link
            href="/"
            className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap bg-slate-900 text-white shadow-sm"
          >
            All Content
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/explore?category=${cat.slug}`}
              className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href="/services"
            className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            Explore Services 🚀
          </Link>
        </div>

        {/* Hero Spotlight / Creator Callout */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-blue-900/40">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold backdrop-blur">
              <Sparkles className="w-3.5 h-3.5" />
              Rwanda&apos;s Creative &amp; Services Economy
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Watch. Create. Book Services. Monetize Your Talents.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Explore videos from top Rwandan creators, discover verified local service providers (photography, music, web dev), and sell digital products with direct mobile money &amp; Flutterwave payouts.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/explore"
                className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                Watch Trending Videos
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/services"
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur border border-white/20 transition-all flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Find Kigali Services
              </Link>
            </div>
          </div>
          {/* Subtle decorative glow */}
          <div className="absolute right-0 top-0 -mr-16 -mt-16 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Section 1: Trending Videos */}
        {trendingVideos.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Trending Now</h2>
              </div>
              <Link
                href="/explore?tab=trending"
                className="text-xs sm:text-sm font-semibold text-brand hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {trendingVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>
        )}

        {/* Section 2: Services Marketplace Spotlight */}
        {services.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brand" />
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Top Professional &amp; Local Services
                  </h2>
                  <p className="text-xs text-slate-500">
                    Book verified Rwandan videographers, developers, event planners &amp; sound engineers
                  </p>
                </div>
              </div>
              <Link
                href="/services"
                className="text-xs sm:text-sm font-semibold text-brand hover:underline flex items-center gap-1"
              >
                All Services <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Recommended Videos */}
        <section className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Recommended For You</h2>
            </div>
            <Link
              href="/explore"
              className="text-xs sm:text-sm font-semibold text-brand hover:underline flex items-center gap-1"
            >
              Explore all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recommendedVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recommendedVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-sm text-slate-500">Explore our initial video catalog.</p>
              <Link href="/studio/upload" className="mt-3 inline-block px-4 py-2 bg-brand text-white rounded-xl text-xs font-semibold">
                Upload First Video
              </Link>
            </div>
          )}
        </section>

        {/* Section 4: Digital Marketplace Products */}
        {products.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-purple-600" />
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Digital Marketplace
                  </h2>
                  <p className="text-xs text-slate-500">
                    Courses, video presets, sound packs, ebooks &amp; software downloads
                  </p>
                </div>
              </div>
              <Link
                href="/products"
                className="text-xs sm:text-sm font-semibold text-brand hover:underline flex items-center gap-1"
              >
                Browse Store <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Section 5: Featured Creators & Channels */}
        {channels.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Featured Creators &amp; Channels
                </h2>
              </div>
              <Link
                href="/channels"
                className="text-xs sm:text-sm font-semibold text-brand hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {channels.map((chan) => (
                <Link
                  key={chan.id}
                  href={`/channel/${chan.handle}`}
                  className="flex flex-col items-center p-4 bg-white rounded-2xl border border-slate-200 hover:border-brand hover:shadow-md transition-all text-center group"
                >
                  {chan.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={chan.avatar}
                      alt={chan.name}
                      className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-slate-100 group-hover:border-brand transition-colors"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-brand text-white flex items-center justify-center font-bold text-lg mb-3">
                      {chan.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-900 group-hover:text-brand line-clamp-1">
                    {chan.name}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    {chan.subscriberCount} subs
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Section 6: Community Posts Feed Snippet */}
        {posts.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-slate-200 pb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-500" />
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Community Discussions</h2>
              </div>
              <Link
                href="/posts"
                className="text-xs sm:text-sm font-semibold text-brand hover:underline flex items-center gap-1"
              >
                Join conversation <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {posts.map((post) => (
                <div key={post.id} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-xs">
                      {post.user.displayName.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-800">{post.user.displayName}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{post.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
