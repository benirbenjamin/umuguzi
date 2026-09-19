import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Store } from "lucide-react";
import { ProductItem } from "@/types";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const categorySlug = searchParams.category;
  const q = searchParams.q;

  const whereClause: any = {};
  if (categorySlug) {
    whereClause.category = { slug: categorySlug };
  }
  if (q) {
    whereClause.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      include: {
        seller: { select: { id: true, displayName: true, username: true, avatar: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { salesCount: "desc" },
    }),
    prisma.category.findMany({
      where: { type: "PRODUCT" },
      orderBy: { name: "asc" },
    }),
  ]);

  const formattedProducts = products.map((p) => ({
    ...p,
    images: (p.images as string[]) || [],
  })) as unknown as ProductItem[];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-brand" />
            <div>
              <h1 className="text-2xl font-black text-slate-900">Digital Marketplace</h1>
              <p className="text-xs text-slate-500">
                Purchase digital assets, video presets, ebooks, software, and audio stems directly from creators
              </p>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Link
            href="/products"
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              !categorySlug
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            All Products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                categorySlug === cat.slug
                  ? "bg-brand text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Products Grid */}
        {formattedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {formattedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No products available in this category.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
