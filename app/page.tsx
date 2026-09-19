import React from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import VideoCard from "@/components/video/VideoCard";
import ServiceCard from "@/components/services/ServiceCard";
import ProductCard from "@/components/products/ProductCard";
import YouTubeSidebar from "@/components/layout/YouTubeSidebar";
import prisma from "@/lib/prisma";
import { VideoItem, ServiceItem, ProductItem } from "@/types";
import { Briefcase, Store, ArrowRight, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

// Server-side data fetching with fallback sample data for fresh DB
async function getHomepageData() {
  try {
    const [videos, categories, services, products, channels] = await Promise.all([
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
        take: 32,
      }),
      prisma.category.findMany({
        take: 12,
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
        take: 10,
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
    };
  } catch {
    return {
      videos: [],
      categories: [],
      services: [],
      products: [],
      channels: [],
    };
  }
}

// Default sample videos when database is fresh
const SAMPLE_VIDEOS: VideoItem[] = [
  {
    id: "sample-1",
    title: "BUZIMA BY ENIHAKORE CHOIR CEP-UR HUYE (Official Video 4K)",
    description: "Official gospel video by Enihakore Choir in Huye, Rwanda.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
    duration: 620,
    views: 13200,
    likes: 850,
    accessType: "PUBLIC",
    price: 0,
    status: "APPROVED",
    isFeatured: true,
    channelId: "c-1",
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    channel: {
      id: "c-1",
      name: "Enihakore Choir CEP-UR",
      handle: "enihakorechoir",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      subscriberCount: 24500,
      isVerified: true,
    },
  },
  {
    id: "sample-2",
    title: "RWANDAN CINEMA: THE PUNISHER WOMAN (Full HD Action Movie)",
    description: "New Rwandan action drama produced in Kigali.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80",
    duration: 3937,
    views: 369000,
    likes: 14200,
    accessType: "PUBLIC",
    price: 0,
    status: "APPROVED",
    isFeatured: true,
    channelId: "c-2",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000 * 30).toISOString(),
    channel: {
      id: "c-2",
      name: "BigMind Empire Kigali",
      handle: "bigmindempire",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      subscriberCount: 112000,
      isVerified: true,
    },
  },
  {
    id: "sample-3",
    title: "UBUMENYI 10 BWA AI BUZAGUKIZA - AI Tools For African Creators",
    description: "How to use AI film and editing tools to earn in Rwanda.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    duration: 890,
    views: 45000,
    likes: 3100,
    accessType: "PUBLIC",
    price: 0,
    status: "APPROVED",
    isFeatured: true,
    channelId: "c-3",
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    channel: {
      id: "c-3",
      name: "Tech Rwanda Guide",
      handle: "techrwanda",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      subscriberCount: 58000,
      isVerified: true,
    },
  },
  {
    id: "sample-4",
    title: "AMABOKO - Live Praise & Worship Night Kigali Arena",
    description: "Energetic live performance with traditional Rwandan drums.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80",
    duration: 495,
    views: 89000,
    likes: 6700,
    accessType: "PUBLIC",
    price: 0,
    status: "APPROVED",
    isFeatured: true,
    channelId: "c-4",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    channel: {
      id: "c-4",
      name: "Ben & Chance Ministry",
      handle: "benchanceministry",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      subscriberCount: 94000,
      isVerified: true,
    },
  },
  {
    id: "sample-5",
    title: "Kigali 4K Drone Tour: The Greenest & Safest Capital in Africa",
    description: "Cinematic drone tour across KN 4 Ave, Convention Centre and Nyarutarama.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
    duration: 1240,
    views: 154000,
    likes: 9800,
    accessType: "PUBLIC",
    price: 0,
    status: "APPROVED",
    isFeatured: false,
    channelId: "c-5",
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    channel: {
      id: "c-5",
      name: "Visit Rwanda Media",
      handle: "visitrwanda",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
      subscriberCount: 180000,
      isVerified: true,
    },
  },
  {
    id: "sample-6",
    title: "Music Production Masterclass: Afrobeat & Amapiano in FL Studio",
    description: "Kigali sound engineer breaks down a hit beat from start to finish.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80",
    duration: 1580,
    views: 28400,
    likes: 2100,
    accessType: "PUBLIC",
    price: 0,
    status: "APPROVED",
    isFeatured: false,
    channelId: "c-6",
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    channel: {
      id: "c-6",
      name: "Kigali Sound Lab",
      handle: "kigalisoundlab",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80",
      subscriberCount: 32000,
      isVerified: true,
    },
  },
  {
    id: "sample-7",
    title: "Intore Cultural Dance & Traditional Rwandan Drums Live",
    description: "National ballet performance celebrating traditional Rwandan heritage.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80",
    duration: 820,
    views: 73000,
    likes: 5400,
    accessType: "PUBLIC",
    price: 0,
    status: "APPROVED",
    isFeatured: false,
    channelId: "c-7",
    createdAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    channel: {
      id: "c-7",
      name: "Rwanda Cultural Heritage",
      handle: "rwandaculture",
      avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=120&auto=format&fit=crop&q=80",
      subscriberCount: 67000,
      isVerified: true,
    },
  },
  {
    id: "sample-8",
    title: "How I Built a 6-Figure Photography Business in Kigali",
    description: "Commercial photographer shares client acquisition, equipment and pricing in RWF.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&auto=format&fit=crop&q=80",
    duration: 1110,
    views: 41200,
    likes: 3800,
    accessType: "PUBLIC",
    price: 0,
    status: "APPROVED",
    isFeatured: false,
    channelId: "c-8",
    createdAt: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
    channel: {
      id: "c-8",
      name: "Eric Photography Rwanda",
      handle: "ericphoto",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
      subscriberCount: 42000,
      isVerified: true,
    },
  },
];

const DEFAULT_CATEGORY_PILLS = [
  { name: "All", slug: "" },
  { name: "Music", slug: "music" },
  { name: "Choirs", slug: "choirs" },
  { name: "African Music", slug: "african-music" },
  { name: "Cinema & Movies", slug: "cinema" },
  { name: "Gospel", slug: "gospel" },
  { name: "Services", slug: "services" },
  { name: "Marketplace", slug: "marketplace" },
  { name: "Tech & AI", slug: "tech" },
  { name: "Comedy", slug: "comedy" },
  { name: "Podcasts", slug: "podcasts" },
  { name: "Live", slug: "live" },
];

export default async function HomePage() {
  const { videos, categories, services, products, channels } = await getHomepageData();

  // Combine DB videos with sample videos if DB has few or no records
  const displayVideos = videos && videos.length > 0 ? videos : SAMPLE_VIDEOS;
  const pills = categories && categories.length > 0 ? categories : DEFAULT_CATEGORY_PILLS;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <div className="flex-1 flex w-full">
        {/* Left YouTube Sidebar */}
        <YouTubeSidebar channels={channels} />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-3 space-y-6">
          {/* 1. Category Filter Chips (YouTube Style) */}
          <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-sm py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap bg-slate-900 text-white shadow-xs"
            >
              All
            </Link>
            {pills.map((cat: any) => (
              <Link
                key={cat.slug || cat.name}
                href={cat.slug === "services" ? "/services" : cat.slug === "marketplace" ? "/products" : `/explore?category=${cat.slug}`}
                className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* 2. YouTube Video Feed: 4 Videos Per Row on Desktop */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
              {displayVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>

          {/* 3. In-Feed Shelf: Services in Kigali & Rwanda */}
          {services && services.length > 0 && (
            <section className="pt-6 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-brand" />
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    Services Spotlight &bull; Kigali &amp; Rwanda
                  </h2>
                </div>
                <Link
                  href="/services"
                  className="text-xs sm:text-sm font-semibold text-brand hover:underline flex items-center gap-1"
                >
                  See all services <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* 4 Items per row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </section>
          )}

          {/* 4. In-Feed Shelf: Digital Marketplace Products */}
          {products && products.length > 0 && (
            <section className="pt-6 border-t border-slate-100 space-y-3 pb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    Digital Store &bull; LUTs, Beats, Software &amp; Presets
                  </h2>
                </div>
                <Link
                  href="/products"
                  className="text-xs sm:text-sm font-semibold text-brand hover:underline flex items-center gap-1"
                >
                  Browse marketplace <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* 4 Items per row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
