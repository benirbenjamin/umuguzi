"use client";

import React, { useState } from "react";
import {
  Palette,
  Mail,
  CreditCard,
  HardDrive,
  Save,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Smartphone,
  Shield,
  Send,
  Loader2,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProviders";
import { SiteSettings } from "@/types";

export default function SettingsClient({ initialSettings }: { initialSettings: SiteSettings }) {
  const { updateLocalSettings } = useApp();
  const [formData, setFormData] = useState<SiteSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<"branding" | "contacts" | "payments" | "storage" | "security">("branding");
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState("");
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<any>(null);

  const handleTestEmail = async () => {
    if (!testEmailRecipient) return;
    setTestingEmail(true);
    setTestEmailResult(null);
    try {
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail: testEmailRecipient }),
      });
      const data = await res.json();
      setTestEmailResult(data);
    } catch (err: any) {
      setTestEmailResult({ success: false, error: err.message });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleChange = (field: keyof SiteSettings, value: string) => {
    setFormData((prev: SiteSettings) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) {
        handleChange("logo_url", data.url);
      }
    } catch {
      setError("Failed to upload logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update settings");

      // Update global context so the entire app reflects new colors and name immediately
      updateLocalSettings(formData);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Site Branding &amp; Platform Customizer
        </h1>
        <p className="text-xs text-slate-500">
          Dynamically rebrand the app, change colors, configure Flutterwave/MoMo payments, and manage contacts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("branding")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "branding"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Palette className="w-4 h-4" />
          Branding &amp; Colors
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("contacts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "contacts"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Mail className="w-4 h-4" />
          Contact &amp; Social Links
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("payments")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "payments"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Payment Gateways
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("storage")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "storage"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          <HardDrive className="w-4 h-4" />
          Cloud Storage
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "security"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Shield className="w-4 h-4" />
          Security &amp; Auth
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Settings saved and brand styles updated across the entire site!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Tab 1: Branding & Colors */}
        {activeTab === "branding" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-extrabold text-base text-slate-900">App Identity &amp; Colors</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Application Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.app_name}
                  onChange={(e) => handleChange("app_name", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Application Tagline
                </label>
                <input
                  type="text"
                  value={formData.app_tagline}
                  onChange={(e) => handleChange("app_tagline", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>

            {/* Logo URL & Uploader */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                App Logo URL or Upload
              </label>
              <div className="flex items-center gap-3">
                {formData.logo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formData.logo_url}
                    alt="Logo Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm"
                  />
                )}
                <input
                  type="text"
                  value={formData.logo_url}
                  onChange={(e) => handleChange("logo_url", e.target.value)}
                  placeholder="https://... or upload file"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-xs"
                />
                <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer shrink-0">
                  <ImageIcon className="w-4 h-4 text-brand" />
                  <span>{uploadingLogo ? "Uploading..." : "Upload Logo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploadingLogo}
                  />
                </label>
              </div>
            </div>

            {/* Color Customization */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Brand Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.brand_primary}
                    onChange={(e) => handleChange("brand_primary", e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.brand_primary}
                    onChange={(e) => handleChange("brand_primary", e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Hover Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.brand_primary_hover}
                    onChange={(e) => handleChange("brand_primary_hover", e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.brand_primary_hover}
                    onChange={(e) => handleChange("brand_primary_hover", e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.brand_accent}
                    onChange={(e) => handleChange("brand_accent", e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.brand_accent}
                    onChange={(e) => handleChange("brand_accent", e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Live Brand Preview:
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  style={{ backgroundColor: formData.brand_primary }}
                  className="px-4 py-2 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Primary Button
                </button>
                <span style={{ color: formData.brand_primary }} className="font-bold text-sm">
                  {formData.app_name} Highlight Text
                </span>
                <span
                  style={{ backgroundColor: formData.brand_accent }}
                  className="px-2.5 py-1 text-white text-[10px] font-bold rounded-full"
                >
                  Accent Tag
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Contacts & Socials */}
        {activeTab === "contacts" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-extrabold text-base text-slate-900">Contact Details &amp; Social Links</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Support Email
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleChange("contact_email", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={formData.contact_phone}
                  onChange={(e) => handleChange("contact_phone", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Office / Physical Address
              </label>
              <input
                type="text"
                value={formData.contact_address}
                onChange={(e) => handleChange("contact_address", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  WhatsApp Contact URL / Number
                </label>
                <input
                  type="text"
                  value={formData.social_whatsapp || ""}
                  onChange={(e) => handleChange("social_whatsapp", e.target.value)}
                  placeholder="https://wa.me/250788000111"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Twitter / X Profile URL
                </label>
                <input
                  type="text"
                  value={formData.social_twitter || ""}
                  onChange={(e) => handleChange("social_twitter", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  YouTube Channel URL
                </label>
                <input
                  type="text"
                  value={formData.social_youtube || ""}
                  onChange={(e) => handleChange("social_youtube", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Instagram Profile URL
                </label>
                <input
                  type="text"
                  value={formData.social_instagram || ""}
                  onChange={(e) => handleChange("social_instagram", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Payment Gateways */}
        {activeTab === "payments" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-extrabold text-base text-slate-900">
              Payment Gateway Credentials &amp; Commission
            </h3>

            {/* Flutterwave Section */}
            <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-brand" /> Flutterwave Integration
                </span>
                <select
                  value={formData.flutterwave_enabled}
                  onChange={(e) => handleChange("flutterwave_enabled", e.target.value)}
                  className="text-xs font-bold px-3 py-1 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Public Key</label>
                  <input
                    type="text"
                    value={formData.flutterwave_public_key}
                    onChange={(e) => handleChange("flutterwave_public_key", e.target.value)}
                    placeholder="FLWPUBK_TEST-..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Secret Key</label>
                  <input
                    type="password"
                    value={formData.flutterwave_secret_key}
                    onChange={(e) => handleChange("flutterwave_secret_key", e.target.value)}
                    placeholder="FLWSECK_TEST-..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Manual MoMo / Bank Payments Section */}
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-600" /> Manual Payment (MoMo &amp; Bank Transfer)
                </span>
                <select
                  value={formData.manual_payment_enabled}
                  onChange={(e) => handleChange("manual_payment_enabled", e.target.value)}
                  className="text-xs font-bold px-3 py-1 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Instructions displayed to buyers
                </label>
                <textarea
                  rows={3}
                  value={formData.manual_payment_instructions}
                  onChange={(e) => handleChange("manual_payment_instructions", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    value={formData.manual_payment_account_name}
                    onChange={(e) => handleChange("manual_payment_account_name", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account / Phone Numbers</label>
                  <input
                    type="text"
                    value={formData.manual_payment_account_number}
                    onChange={(e) => handleChange("manual_payment_account_number", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Platform Commission */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Platform Commission Rate (%)
                </label>
                <input
                  type="number"
                  value={formData.commission_rate}
                  onChange={(e) => handleChange("commission_rate", e.target.value)}
                  placeholder="10"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Default Platform Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  <option value="RWF">RWF (Rwandan Franc)</option>
                  <option value="USD">USD (US Dollar)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Cloud Storage */}
        {activeTab === "storage" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-extrabold text-base text-slate-900">Cloud Storage Provider</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Primary Storage Provider
              </label>
              <select
                value={formData.storage_provider}
                onChange={(e) => handleChange("storage_provider", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-bold"
              >
                <option value="VERCEL_BLOB">Vercel Blob Storage (Primary Recommended)</option>
                <option value="AWS_S3">Amazon Web Services S3</option>
                <option value="CLOUDFLARE_R2">Cloudflare R2</option>
              </select>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Configure your respective environment credentials in <code>.env</code> (e.g. <code>BLOB_READ_WRITE_TOKEN</code> for Vercel Blob, or <code>STORAGE_ACCESS_KEY</code> for AWS/R2).
              </p>
            </div>
          </div>
        )}

        {/* Tab 5: Security & Authentication */}
        {activeTab === "security" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Security, Two-Factor &amp; Account Verification
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Control login friction, 2FA bypass behavior, and test outbound email connectivity.
              </p>
            </div>

            {/* 2FA Bypass Toggle */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Two-Factor Authentication (2FA) Globally</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    When <strong>Disabled</strong>, users bypass 2FA upon login and authenticate immediately with their password.
                  </p>
                </div>
                <select
                  value={formData.two_factor_enabled || "false"}
                  onChange={(e) => handleChange("two_factor_enabled", e.target.value)}
                  className="text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-300 bg-white shrink-0"
                >
                  <option value="false">Disabled (Bypass 2FA for all users)</option>
                  <option value="true">Enabled (Require 6-digit email code)</option>
                </select>
              </div>
            </div>

            {/* Email Verification Toggle */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Email Verification for New Signups</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    When <strong>Disabled</strong>, newly registered users are automatically verified and log in directly without requiring an email code.
                  </p>
                </div>
                <select
                  value={formData.email_verification_enabled || "false"}
                  onChange={(e) => handleChange("email_verification_enabled", e.target.value)}
                  className="text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-300 bg-white shrink-0"
                >
                  <option value="false">Disabled (Auto-verify accounts immediately)</option>
                  <option value="true">Enabled (Require email verification)</option>
                </select>
              </div>
            </div>

            {/* Email Credentials & Dispatch Configuration */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand" /> Outbound Email &amp; Resend Configuration
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Emails can be configured here in database settings (instant without redeployment) or via Vercel Environment Variables.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Resend API Key
                  </label>
                  <input
                    type="password"
                    value={formData.resend_api_key || ""}
                    onChange={(e) => handleChange("resend_api_key", e.target.value)}
                    placeholder="re_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Leave blank to use Vercel <code>RESEND_API_KEY</code> env variable.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sender Email Address (EMAIL_FROM)
                  </label>
                  <input
                    type="text"
                    value={formData.email_from || ""}
                    onChange={(e) => handleChange("email_from", e.target.value)}
                    placeholder="Umuguzipro <onboarding@resend.dev>"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Use <code>onboarding@resend.dev</code> for unverified domains.
                  </p>
                </div>
              </div>
            </div>

            {/* Outbound Email Diagnostics & Tester */}
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand" /> Outbound Email Tester &amp; Resend Diagnostics
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Send a live test email to verify whether Resend or SMTP is correctly dispatching messages from your server.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  placeholder="Enter email address to receive test (e.g. benirabok@gmail.com)"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testingEmail || !testEmailRecipient}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all shrink-0 shadow-sm"
                >
                  {testingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{testingEmail ? "Sending Test..." : "Send Test Email"}</span>
                </button>
              </div>

              {testEmailResult && (
                <div
                  className={`p-4 rounded-xl text-xs space-y-2 border ${
                    testEmailResult.success
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  <div className="font-bold flex items-center gap-2">
                    {testEmailResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>
                      {testEmailResult.success
                        ? `Test Email Sent Successfully via ${testEmailResult.provider?.toUpperCase()}! (Message ID: ${testEmailResult.messageId})`
                        : `Email Delivery Failed: ${testEmailResult.error || "Unknown error"}`}
                    </span>
                  </div>

                  {testEmailResult.diagnostic && (
                    <div className="text-[11px] font-mono bg-white/80 p-3 rounded-lg border border-slate-200 space-y-1 mt-2 text-slate-700">
                      <div>Sender Address: <strong>{testEmailResult.diagnostic.configuredSender}</strong></div>
                      <div>
                        Resend Key: <strong>
                          {testEmailResult.diagnostic.hasResendKey
                            ? `Active (${testEmailResult.diagnostic.resendKeyPrefix}) [Source: ${testEmailResult.diagnostic.keySource || "Configured"}]`
                            : "Missing (Not found in Database or Vercel RESEND_API_KEY)"}
                        </strong>
                      </div>
                      <div>SMTP Fallback: <strong>{testEmailResult.diagnostic.hasSmtp ? "Configured" : "Not configured"}</strong></div>
                      {!testEmailResult.success && (
                        <div className="text-amber-700 font-sans mt-2 pt-2 border-t border-slate-200 leading-relaxed">
                          💡 <strong>Resend Sandbox Notice:</strong> With unverified custom domains, Resend sandbox only permits sending from <code>onboarding@resend.dev</code> directly to your Resend account owner email. To send to any recipient, verify your domain at <strong>resend.com/domains</strong>.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-brand hover:bg-brand-hover text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Saving Settings..." : "Save & Apply Customizations"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
