/**
 * UMUGUZIPRO DATABASE SEED SCRIPT
 * ----------------------------------------------------------------------------
 * Idempotently populates default admin, creators, service providers,
 * categories, sample videos, services, digital products, and site settings.
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Umuguzipro database seed...");

  // 1. Seed Dynamic Site Settings (Branding, Colors, Contacts, Payment credentials)
  console.log("-> Seeding Site Settings & Customizable Branding...");
  const defaultSettings = [
    { key: "app_name", value: "Umuguzipro", category: "BRANDING" },
    { key: "app_tagline", value: "Rwanda & Global Video, Creative Services and Commerce Platform", category: "BRANDING" },
    { key: "logo_url", value: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80", category: "BRANDING" },
    { key: "favicon_url", value: "/favicon.ico", category: "BRANDING" },
    { key: "brand_primary", value: "#2563eb", category: "BRANDING" },
    { key: "brand_primary_hover", value: "#1d4ed8", category: "BRANDING" },
    { key: "brand_accent", value: "#0ea5e9", category: "BRANDING" },
    { key: "contact_email", value: "support@umuguzi.pro", category: "CONTACT" },
    { key: "contact_phone", value: "+250 788 000 111", category: "CONTACT" },
    { key: "contact_address", value: "KN 4 Ave, Kigali City Tower, Kigali, Rwanda", category: "CONTACT" },
    { key: "social_youtube", value: "https://youtube.com/@umuguzi", category: "SOCIAL" },
    { key: "social_twitter", value: "https://x.com/umuguzi", category: "SOCIAL" },
    { key: "social_instagram", value: "https://instagram.com/umuguzi", category: "SOCIAL" },
    { key: "social_whatsapp", value: "https://wa.me/250788000111", category: "SOCIAL" },
    { key: "currency", value: "RWF", category: "PAYMENTS" },
    { key: "commission_rate", value: "10", category: "PAYMENTS" },
    { key: "flutterwave_enabled", value: "true", category: "PAYMENTS" },
    { key: "flutterwave_public_key", value: "FLWPUBK_TEST-SANDBOX-KEY-12345", category: "PAYMENTS" },
    { key: "flutterwave_secret_key", value: "FLWSECK_TEST-SANDBOX-KEY-67890", category: "PAYMENTS" },
    { key: "manual_payment_enabled", value: "true", category: "PAYMENTS" },
    { key: "manual_payment_instructions", value: "Send payment via MTN Mobile Money or Airtel Money to +250 788 000 111 (Umuguzipro Ltd) or Bank Transfer to Bank of Kigali Account 00012345678. Put your Booking/Order ID in note.", category: "PAYMENTS" },
    { key: "manual_payment_account_name", value: "Umuguzipro Ltd", category: "PAYMENTS" },
    { key: "manual_payment_account_number", value: "+250 788 000 111 (MoMo) / 00012345678 (BK)", category: "PAYMENTS" },
    { key: "storage_provider", value: "VERCEL_BLOB", category: "GENERAL" },
  ];

  for (const s of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  // 2. Seed Default Admin
  console.log("-> Seeding Default Super Admin (admin@umuguzipro.com / Admin@123456)...");
  const adminPasswordHash = await bcrypt.hash("Admin@123456", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@umuguzipro.com" },
    update: {},
    create: {
      email: "admin@umuguzipro.com",
      username: "superadmin",
      displayName: "Umuguzi Executive Admin",
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
      isVerified: true,
      twoFactorEnabled: true,
      country: "Rwanda",
      city: "Kigali",
      wallet: {
        create: {
          availableBalance: 1500000,
          pendingBalance: 0,
          totalEarnings: 1500000,
          totalWithdrawn: 0,
          currency: "RWF",
        },
      },
    },
  });

  // 3. Seed Featured Creator
  console.log("-> Seeding Featured Creator (creator@umuguzipro.com / Creator@123456)...");
  const creatorPasswordHash = await bcrypt.hash("Creator@123456", 10);
  const creator = await prisma.user.upsert({
    where: { email: "creator@umuguzipro.com" },
    update: {},
    create: {
      email: "creator@umuguzipro.com",
      username: "kigalivibes",
      displayName: "Kigali Vibes Media",
      passwordHash: creatorPasswordHash,
      role: "CREATOR",
      isVerified: true,
      twoFactorEnabled: true,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      country: "Rwanda",
      city: "Kigali",
      wallet: {
        create: {
          availableBalance: 340000,
          pendingBalance: 25000,
          totalEarnings: 365000,
          totalWithdrawn: 100000,
          currency: "RWF",
        },
      },
    },
  });

  // 4. Seed Creator Channel
  const channel = await prisma.channel.upsert({
    where: { handle: "kigalivibes" },
    update: {},
    create: {
      ownerId: creator.id,
      name: "Kigali Vibes Official",
      handle: "kigalivibes",
      description: "Bringing you the latest Rwandan music videos, youth culture, lifestyle, and events in the heart of Africa.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80",
      country: "Rwanda",
      subscriberCount: 24800,
      totalViews: 412000,
      isVerified: true,
    },
  });

  // 5. Seed Categories
  console.log("-> Seeding Video, Service, and Product Categories...");
  const categoriesData = [
    { name: "Music & Performing Arts", slug: "music", type: "VIDEO" },
    { name: "Technology & Software", slug: "technology", type: "VIDEO" },
    { name: "Entertainment & Comedy", slug: "entertainment", type: "VIDEO" },
    { name: "Culture & Travel Rwanda", slug: "culture-travel", type: "VIDEO" },
    { name: "Education & Tutorials", slug: "education", type: "VIDEO" },
    { name: "Photography & Videography", slug: "photography-services", type: "SERVICE" },
    { name: "Web & Mobile Development", slug: "web-development", type: "SERVICE" },
    { name: "Music Production & Audio", slug: "music-production", type: "SERVICE" },
    { name: "Event Planning & Hosting", slug: "event-services", type: "SERVICE" },
    { name: "Video LUTs & Presets", slug: "presets", type: "PRODUCT" },
    { name: "Audio Stems & Sound Packs", slug: "sound-packs", type: "PRODUCT" },
    { name: "eBooks & Creator Guides", slug: "ebooks", type: "PRODUCT" },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap[cat.slug] = c.id;
  }

  // 6. Seed Sample Videos
  console.log("-> Seeding Sample High-Quality Videos...");
  const sampleVideos = [
    {
      title: "Discover Kigali: The Cleanest & Safest City in Africa (4K Documentary)",
      slug: "discover-kigali-cleanest-safest-city",
      description: "A breathtaking tour across Kigali's vibrant districts—from Kimihurura and Nyarugenge to the Kigali Convention Centre.",
      videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4", // working YouTube sample
      thumbnailUrl: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop&q=80",
      duration: 745,
      views: 18240,
      likes: 1420,
      accessType: "PUBLIC",
      categorySlug: "culture-travel",
    },
    {
      title: "Rwanda Tech Ecosystem: Building Startups at Norrsken House Kigali",
      slug: "rwanda-tech-startups-norrsken",
      description: "Inside Rwanda's booming tech startup scene. Meet founders building fintech, agritech, and AI solutions.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
      duration: 920,
      views: 8900,
      likes: 640,
      accessType: "PUBLIC",
      categorySlug: "technology",
    },
    {
      title: "Modern Inanga & Traditional Rwandan Beats Masterclass [Premium]",
      slug: "modern-inanga-rwandan-beats-masterclass",
      description: "Full masterclass on traditional Rwandan rhythms blended with modern Afrobeats.",
      videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
      thumbnailUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
      duration: 1800,
      views: 3400,
      likes: 410,
      accessType: "PREMIUM",
      price: 2500,
      categorySlug: "music",
    },
    {
      title: "Top 5 Places to Visit in Musanze & Volcanoes National Park",
      slug: "places-to-visit-musanze-volcanoes",
      description: "Gorilla trekking, twin lakes Burera & Ruhondo, and scenic mountain views.",
      videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
      thumbnailUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&auto=format&fit=crop&q=80",
      duration: 610,
      views: 12500,
      likes: 980,
      accessType: "PUBLIC",
      categorySlug: "culture-travel",
    },
  ];

  for (const v of sampleVideos) {
    const existing = await prisma.video.findUnique({ where: { slug: v.slug } });
    if (!existing) {
      await prisma.video.create({
        data: {
          channelId: channel.id,
          userId: creator.id,
          title: v.title,
          slug: v.slug,
          description: v.description,
          videoUrl: v.videoUrl,
          thumbnailUrl: v.thumbnailUrl,
          duration: v.duration,
          views: v.views,
          likes: v.likes,
          accessType: v.accessType,
          price: v.price || 0,
          status: "APPROVED",
          categoryId: categoryMap[v.categorySlug],
        },
      });
    }
  }

  // 7. Seed Service Provider & Sample Services
  console.log("-> Seeding Service Providers & Listings...");
  const provider = await prisma.user.upsert({
    where: { email: "provider@umuguzipro.com" },
    update: {},
    create: {
      email: "provider@umuguzi.pro",
      username: "kigaliphoto",
      displayName: "Kigali Creative Lens Studios",
      passwordHash: creatorPasswordHash,
      role: "PROVIDER",
      isVerified: true,
      twoFactorEnabled: true,
      phone: "+250 788 555 444",
      country: "Rwanda",
      city: "Kigali",
      wallet: {
        create: {
          availableBalance: 280000,
          pendingBalance: 50000,
          totalEarnings: 330000,
          totalWithdrawn: 0,
          currency: "RWF",
        },
      },
    },
  });

  const sampleServices = [
    {
      title: "Wedding & Traditional Ceremony (Gusaba/Gukwa) Photography",
      slug: "wedding-gusaba-photography-kigali",
      description: "Full high-resolution photography coverage for civil weddings, Gusaba ceremonies, and evening receptions in Kigali and provinces.",
      price: 150000,
      priceType: "FIXED",
      location: "Kigali, Rwanda",
      rating: 5.0,
      reviewCount: 22,
      categorySlug: "photography-services",
      images: ["https://images.unsplash.com/photo-1519741497674-611481863552?w=800"],
    },
    {
      title: "Custom Web Application & Mobile API Development (Next.js / Node)",
      slug: "custom-web-app-development-rwanda",
      description: "Senior full-stack development team based in Kigali. We build production-grade web portals, booking engines, and payment integrations.",
      price: 450000,
      priceType: "STARTING_AT",
      location: "Kigali & Remote",
      rating: 4.9,
      reviewCount: 14,
      categorySlug: "web-development",
      images: ["https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800"],
    },
    {
      title: "Professional Vocal Recording & Studio Mixing (Afrobeats / R&B)",
      slug: "vocal-recording-mixing-mastering",
      description: "Acoustically treated studio in Gisozi, Kigali equipped with Neumann mics, Pro Tools, and analog compressors.",
      price: 60000,
      priceType: "FIXED",
      location: "Gisozi, Kigali",
      rating: 5.0,
      reviewCount: 9,
      categorySlug: "music-production",
      images: ["https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800"],
    },
  ];

  for (const s of sampleServices) {
    const existing = await prisma.service.findUnique({ where: { slug: s.slug } });
    if (!existing) {
      await prisma.service.create({
        data: {
          providerId: provider.id,
          title: s.title,
          slug: s.slug,
          description: s.description,
          price: s.price,
          priceType: s.priceType,
          location: s.location,
          rating: s.rating,
          reviewCount: s.reviewCount,
          status: "ACTIVE",
          images: s.images,
          categoryId: categoryMap[s.categorySlug],
        },
      });
    }
  }

  // 8. Seed Digital Marketplace Products
  console.log("-> Seeding Digital Marketplace Products...");
  const sampleProducts = [
    {
      title: "Cinematic Rwanda Video LUTs Color Grading Pack (DaVinci & Premiere)",
      slug: "cinematic-rwanda-luts-pack",
      description: "12 custom LUTs calibrated specifically for African sunlight, lush green hills, and vibrant skin tones.",
      price: 15000,
      fileType: "ZIP",
      fileSize: "45 MB",
      salesCount: 48,
      rating: 5.0,
      images: ["https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800"],
      downloadUrl: "https://example.com/downloads/rwanda-luts-pack.zip",
      categorySlug: "presets",
    },
    {
      title: "East African Modern Afro-Fusion Drum Loops & Stems Pack",
      slug: "east-african-afro-fusion-drum-pack",
      description: "Royalty-free high-definition drum loops, shakers, inanga rhythms, and basslines.",
      price: 20000,
      fileType: "WAV / ZIP",
      fileSize: "280 MB",
      salesCount: 31,
      rating: 4.9,
      images: ["https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800"],
      downloadUrl: "https://example.com/downloads/afro-fusion-pack.zip",
      categorySlug: "sound-packs",
    },
  ];

  for (const p of sampleProducts) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      await prisma.product.create({
        data: {
          sellerId: creator.id,
          title: p.title,
          slug: p.slug,
          description: p.description,
          price: p.price,
          fileType: p.fileType,
          fileSize: p.fileSize,
          salesCount: p.salesCount,
          rating: p.rating,
          images: p.images,
          downloadUrl: p.downloadUrl,
          categoryId: categoryMap[p.categorySlug],
        },
      });
    }
  }

  // 9. Seed Community Posts
  console.log("-> Seeding Community Feed Posts...");
  const existingPost = await prisma.post.findFirst();
  if (!existingPost) {
    await prisma.post.create({
      data: {
        userId: creator.id,
        content: "Excited to welcome everyone to the new Umuguzipro platform! Content creators, videographers, and developers in Rwanda now have a dedicated space to share, collaborate, and earn directly via MoMo and Flutterwave.",
        likes: 38,
      },
    });
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
