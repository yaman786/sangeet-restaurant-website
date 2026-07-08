'use client';
import { useQuery } from '@tanstack/react-query';
import HomePage from '@/_pages/HomePage';
import { fetchMenuItems, fetchReviews, fetchEvents } from '@/services/api';

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

function LoadingSpinner({ message = 'Loading Authentic Flavors...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mx-auto mb-4" />
        <p className="text-sangeet-400">{message}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: menuItems = FALLBACK_MENU, isLoading: menuLoading } = useQuery({
    queryKey: ['menuItems'],
    queryFn: fetchMenuItems,
  });

  const { data: reviews = FALLBACK_REVIEWS, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: fetchReviews,
  });

  const { data: events = FALLBACK_EVENTS, isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });

  const loading = menuLoading && reviewsLoading && eventsLoading;

  if (loading) return <LoadingSpinner />;

  return <HomePage menuItems={menuItems || FALLBACK_MENU} reviews={reviews || FALLBACK_REVIEWS} events={events || FALLBACK_EVENTS} />;
}
