import { prisma } from '@/lib/db';
import type { QRCodeRow, QRCodeResult } from '@/lib/types';
import beautifulQRGenerator from '../utils/beautifulQRGenerator';

class AnalyticsService {
  async getBusinessAnalytics(timeframe: string = 'week'): Promise<Record<string, any>> {
    let dateFilter = "INTERVAL '7 days'";
    if (timeframe === 'month') dateFilter = "INTERVAL '30 days'";
    else if (timeframe === 'year') dateFilter = "INTERVAL '365 days'";
    else if (timeframe === 'today') dateFilter = "INTERVAL '1 day'";

    const revenueResult: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(*) as total_orders,
        COALESCE(AVG(total_amount), 0) as average_order_value
      FROM orders 
      WHERE created_at >= NOW() - ${dateFilter} 
      AND status = 'completed'
    `);

    const recentOrders: any[] = await prisma.$queryRawUnsafe(`
      SELECT DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as orders
      FROM orders
      WHERE created_at >= NOW() - ${dateFilter} AND status = 'completed'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    return {
      summary: {
        totalRevenue: parseFloat(revenueResult[0]?.total_revenue || '0'),
        totalOrders: Number(revenueResult[0]?.total_orders || 0),
        averageOrderValue: parseFloat(revenueResult[0]?.average_order_value || '0')
      },
      trends: recentOrders.map(r => ({
        date: r.date,
        revenue: parseFloat(r.revenue || '0'),
        orders: Number(r.orders || 0)
      }))
    };
  }

  async getReservationTrends(period: string = 'month'): Promise<{ trends: any[], period: string }> {
    let dateFilter = "INTERVAL '30 days'";
    if (period === 'week') dateFilter = "INTERVAL '7 days'";
    else if (period === 'year') dateFilter = "INTERVAL '365 days'";

    const result: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        date,
        COUNT(*) as total_reservations,
        SUM(guests) as total_guests,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        COUNT(CASE WHEN status = 'no-show' THEN 1 END) as no_show
      FROM reservations
      WHERE date >= CURRENT_DATE - ${dateFilter}
      GROUP BY date
      ORDER BY date ASC
    `);

    return {
      period,
      trends: result.map(r => ({
        date: r.date,
        totalReservations: Number(r.total_reservations || 0),
        totalGuests: Number(r.total_guests || 0),
        completed: Number(r.completed || 0),
        cancelled: Number(r.cancelled || 0),
        noShow: Number(r.no_show || 0)
      }))
    };
  }

  async getMenuAnalytics(): Promise<Record<string, any>> {
    const topItems: any[] = await prisma.$queryRawUnsafe(`
      SELECT m.id, m.name, m.category, COUNT(oi.id) as times_ordered, SUM(oi.quantity) as total_quantity
      FROM menu_items m
      JOIN order_items oi ON m.id = oi.menu_item_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed'
      GROUP BY m.id, m.name, m.category
      ORDER BY times_ordered DESC
      LIMIT 10
    `);

    const categoryPerformance: any[] = await prisma.$queryRawUnsafe(`
      SELECT m.category, COUNT(oi.id) as total_orders, SUM(oi.unit_price * oi.quantity) as total_revenue
      FROM menu_items m
      JOIN order_items oi ON m.id = oi.menu_item_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed'
      GROUP BY m.category
      ORDER BY total_revenue DESC
    `);

    return {
      topSellingItems: topItems.map(r => ({
        id: r.id, name: r.name, category: r.category,
        timesOrdered: Number(r.times_ordered || 0),
        totalQuantity: Number(r.total_quantity || 0)
      })),
      categoryPerformance: categoryPerformance.map(r => ({
        category: r.category,
        totalOrders: Number(r.total_orders || 0),
        totalRevenue: parseFloat(r.total_revenue || '0')
      }))
    };
  }

  async getCustomerInsights(): Promise<Record<string, any>> {
    const timeDistribution: any[] = await prisma.$queryRawUnsafe(`
      SELECT EXTRACT(HOUR FROM time::time) as hour, COUNT(*) as reservations
      FROM reservations
      WHERE status IN ('completed', 'confirmed')
      GROUP BY hour
      ORDER BY hour ASC
    `);

    const orderTypes: any[] = await prisma.$queryRawUnsafe(`
      SELECT order_type, COUNT(*) as count, SUM(total_amount) as revenue
      FROM orders
      WHERE status = 'completed'
      GROUP BY order_type
    `);

    const reviewSummary: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        AVG(rating) as avg_rating,
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_reviews
      FROM customer_reviews
      WHERE is_verified = true
    `);

    return {
      peakHours: timeDistribution.map(r => ({
        hour: Number(r.hour || 0),
        reservations: Number(r.reservations || 0)
      })),
      orderTypes: orderTypes.map(r => ({
        type: r.order_type,
        count: Number(r.count || 0),
        revenue: parseFloat(r.revenue || '0')
      })),
      reviews: {
        averageRating: parseFloat(reviewSummary[0]?.avg_rating || '0').toFixed(1),
        totalReviews: Number(reviewSummary[0]?.total_reviews || 0),
        positiveReviews: Number(reviewSummary[0]?.positive_reviews || 0)
      }
    };
  }

  async getPerformanceMetrics(startDate?: string, endDate?: string): Promise<Record<string, any>> {
    let dateFilter = '';
    const params: any[] = [];
    if (startDate && endDate) {
      dateFilter = 'WHERE created_at BETWEEN $1 AND $2';
      params.push(new Date(startDate), new Date(endDate));
    }

    const completionTimes: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at)))/60 as avg_prep_time_minutes
      FROM orders
      ${dateFilter ? dateFilter + " AND status = 'completed'" : "WHERE status = 'completed'"}
    `, ...params);

    return {
      averagePreparationTime: parseFloat(completionTimes[0]?.avg_prep_time_minutes || '0').toFixed(1)
    };
  }

  async getExportData(type: string): Promise<any[]> {
    if (type === 'orders') {
      return prisma.orders.findMany({ orderBy: { created_at: 'desc' }, take: 1000 });
    } else if (type === 'reservations') {
      return prisma.reservations.findMany({ orderBy: [{ date: 'desc' }, { time: 'desc' }], take: 1000 });
    } else {
      return prisma.menu_items.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });
    }
  }

  convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      });
      csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  }
}

export default new AnalyticsService();
