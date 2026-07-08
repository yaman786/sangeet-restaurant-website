import HomePage from '@/_pages/HomePage';
import { fetchMenuItems, fetchReviews, fetchEvents } from '@/services/api';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sangeet Restaurant - Authentic South Asian Cuisine in Hong Kong',
  description: 'Experience South Asian Elegance. Authentic cuisine rooted in tradition, crafted with passion, served in the heart of Hong Kong. Book a table or explore our menu.',
  openGraph: {
    title: 'Sangeet Restaurant - Authentic South Asian Cuisine',
    description: 'Experience South Asian Elegance in the heart of Hong Kong.',
    siteName: 'Sangeet Restaurant',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export const revalidate = 3600;

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

  try {
    const [menuRes, reviewsRes, eventsRes] = await Promise.all([
      fetchMenuItems().catch(() => FALLBACK_MENU),
      fetchReviews().catch(() => FALLBACK_REVIEWS),
      fetchEvents().catch(() => FALLBACK_EVENTS)
    ]);
    
    // In our backend, responses often look like { success: true, data: [...] } or just [...]
    // For now we assign them directly because the axios interceptor usually returns response.data
    menuItems = (menuRes as any)?.data || menuRes || FALLBACK_MENU;
    reviews = (reviewsRes as any)?.data || reviewsRes || FALLBACK_REVIEWS;
    events = (eventsRes as any)?.data || eventsRes || FALLBACK_EVENTS;
  } catch (err) {
    console.error("Failed to fetch server data", err);
  }

  // Pass fallback if the response was an empty array and we want to show something rich initially
  if (!menuItems || menuItems.length === 0) menuItems = FALLBACK_MENU;
  if (!reviews || reviews.length === 0) reviews = FALLBACK_REVIEWS;
  if (!events || events.length === 0) events = FALLBACK_EVENTS;

  return <HomePage menuItems={menuItems} reviews={reviews} events={events} />;
}
