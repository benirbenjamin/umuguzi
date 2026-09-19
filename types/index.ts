export type UserRole = 
  | 'USER'
  | 'CREATOR'
  | 'ARTIST'
  | 'PROVIDER'
  | 'AFFILIATE'
  | 'CONTENT_MODERATOR'
  | 'FINANCE_ADMIN'
  | 'SUPPORT_AGENT'
  | 'MODERATOR'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: UserRole;
  avatar?: string | null;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  referralCode: string;
}

export interface SiteSettings {
  app_name: string;
  app_tagline: string;
  logo_url: string;
  favicon_url: string;
  brand_primary: string;
  brand_primary_hover: string;
  brand_accent: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  social_facebook?: string;
  social_twitter?: string;
  social_instagram?: string;
  social_youtube?: string;
  social_linkedin?: string;
  social_tiktok?: string;
  social_whatsapp?: string;
  currency: string;
  commission_rate: string;
  flutterwave_enabled: string;
  flutterwave_public_key: string;
  flutterwave_secret_key: string;
  flutterwave_encryption_key: string;
  manual_payment_enabled: string;
  manual_payment_instructions: string;
  manual_payment_account_name: string;
  manual_payment_account_number: string;
  storage_provider: string; // VERCEL_BLOB, AWS_S3, CLOUDFLARE_R2
  maintenance_mode: string;
  two_factor_enabled?: string;
  email_verification_enabled?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  slug?: string;
  description?: string | null;
  videoUrl: string;
  thumbnailUrl?: string | null;
  duration: number;
  accessType?: 'PUBLIC' | 'PRIVATE' | 'PREMIUM';
  accessLevel?: 'ALL' | 'MEMBERS' | 'PREMIUM';
  price?: number;
  views: number;
  likes: number;
  dislikes?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  isFeatured?: boolean;
  channelId?: string;
  createdAt: string | Date;
  channel: {
    id: string;
    name: string;
    handle: string;
    avatar?: string | null;
    subscriberCount: number;
    isVerified?: boolean;
    [key: string]: any;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  [key: string]: any;
}

export interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  priceType: 'FIXED' | 'HOURLY' | 'STARTING_AT';
  location: string;
  images: string[];
  packages?: any;
  availability?: any;
  rating: number;
  reviewCount: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PAUSED';
  createdAt: string | Date;
  provider: {
    id: string;
    displayName: string;
    username: string;
    avatar?: string | null;
    phone?: string | null;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface ProductItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  downloadUrl?: string | null;
  fileType?: string | null;
  fileSize?: string | null;
  salesCount: number;
  rating: number;
  seller: {
    id: string;
    displayName: string;
    username: string;
    avatar?: string | null;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}
