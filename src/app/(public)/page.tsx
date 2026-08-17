export const dynamic = 'force-dynamic';

import HomePage from '@/_pages/HomePage';
import menuService from '@/lib/services/menuService';
import reviewService from '@/lib/services/reviewService';
import eventService from '@/lib/services/eventService';
import websiteService from '@/lib/services/websiteService';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  let seoConfig = {
    title: 'Sangeet | Fine-Dining South Asian Cuisine & Clay Tandoor | Wan Chai, Hong Kong',
    description: 'Sangeet is Hong Kong\'s newest South Asian fine-dining sanctuary in Wan Chai. Experience charcoal clay tandoor cooking, handcrafted regional curries, and modern luxury.',
    keywords: 'Sangeet restaurant, Wan Chai Indian food, South Asian fine dining, Hong Kong tandoor, authentic Indian curries, private dining Wan Chai',
    og_image: '/images/hero-interior.jpg'
  };

  try {
    const res = await websiteService.getPublicWebsiteConfig();
    if (res?.seo) {
      seoConfig = { ...seoConfig, ...res.seo };
    }
  } catch (err) {
    console.error("Failed to fetch SEO metadata", err);
  }

  return {
    title: seoConfig.title,
    description: seoConfig.description,
    keywords: seoConfig.keywords,
    openGraph: {
      title: seoConfig.title,
      description: seoConfig.description,
      siteName: 'Sangeet Restaurant',
      images: [
        {
          url: seoConfig.og_image,
          width: 1200,
          height: 630,
        }
      ],
      locale: 'en_US',
      type: 'website',
    },
  };
}

const FALLBACK_MENU = [
  {
    id: 1, name: "Butter Chicken", description: "Creamy tomato-based curry with tender chicken", price: 18.99,
    category_name: "Main Course", image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    is_vegetarian: false, is_spicy: false, is_popular: true, preparation_time: 20
  }
] as any;

const FALLBACK_REVIEWS = [
  {
    id: 1, customer_name: "Anika Sharma", review_text: "Sangeet offers an unparalleled dining experience. The Butter Chicken is a must-try! ★★★★★",
    rating: 5, image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", is_verified: true
  }
] as any;

const FALLBACK_EVENTS = [
  {
    id: 1, title: "Diwali Celebration", description: "A night of music, dance, and special dishes to celebrate the Festival of Lights",
    date: "2024-11-12T00:00:00.000Z", image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop", is_featured: true
  }
] as any;

export default async function Home() {
  let menuItems = FALLBACK_MENU;
  let reviews = FALLBACK_REVIEWS;
  let events = FALLBACK_EVENTS;
  let cmsConfig: any = null;

  try {
    const [menuRes, reviewsRes, eventsRes, cmsRes] = await Promise.all([
      menuService.getAllMenuItems().then(res => JSON.parse(JSON.stringify(res))).catch(() => FALLBACK_MENU),
      reviewService.getAllReviews().then(res => JSON.parse(JSON.stringify(res))).catch(() => FALLBACK_REVIEWS),
      eventService.getAllEvents().then(res => JSON.parse(JSON.stringify(res))).catch(() => FALLBACK_EVENTS),
      websiteService.getPublicWebsiteConfig().then(res => JSON.parse(JSON.stringify(res))).catch(() => null)
    ]);
    
    menuItems = (menuRes && menuRes.length > 0) ? menuRes : FALLBACK_MENU;
    reviews = (reviewsRes && reviewsRes.length > 0) ? reviewsRes : FALLBACK_REVIEWS;
    events = (eventsRes && eventsRes.length > 0) ? eventsRes : FALLBACK_EVENTS;
    cmsConfig = cmsRes;
  } catch (err) {
    console.error("Failed to fetch home page data on server", err);
  }

  return <HomePage menuItems={menuItems} reviews={reviews} events={events} cmsConfig={cmsConfig} />;
}
