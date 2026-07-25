import { prisma } from '@/lib/db';
import type { QRCodeRow, QRCodeResult } from '@/lib/types';
import beautifulQRGenerator from '../utils/beautifulQRGenerator';

class AnalyticsService {
  async getBusinessAnalytics(timeframe: string = 'month', startDate?: string, endDate?: string): Promise<Record<string, any>> {
    let revenueResult: any[];
    let recentOrders: any[];

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      revenueResult = await prisma.$queryRaw`
        SELECT 
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COUNT(*) as total_orders,
          COALESCE(AVG(total_amount), 0) as average_order_value
        FROM orders 
        WHERE created_at >= ${start} AND created_at <= ${end}
        AND status = 'completed'
      `;

      recentOrders = await prisma.$queryRaw`
        SELECT DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as orders
        FROM orders
        WHERE created_at >= ${start} AND created_at <= ${end} AND status = 'completed'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;
    } else {
      const ALLOWED_INTERVALS: Record<string, string> = {
        today: '1 day',
        week: '7 days',
        month: '30 days',
        year: '365 days',
        '7': '7 days',
        '30': '30 days',
        '90': '90 days'
      };
      const interval = ALLOWED_INTERVALS[timeframe] ?? '30 days';

      revenueResult = await prisma.$queryRaw`
        SELECT 
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COUNT(*) as total_orders,
          COALESCE(AVG(total_amount), 0) as average_order_value
        FROM orders 
        WHERE created_at >= NOW() - ${interval}::interval 
        AND status = 'completed'
      `;

      recentOrders = await prisma.$queryRaw`
        SELECT DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as orders
        FROM orders
        WHERE created_at >= NOW() - ${interval}::interval AND status = 'completed'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;
    }

    return {
      summary: {
        totalRevenue: parseFloat(revenueResult[0]?.total_revenue || '0'),
        totalOrders: Number(revenueResult[0]?.total_orders || 0),
        averageOrderValue: parseFloat(revenueResult[0]?.average_order_value || '0')
      },
      trends: recentOrders.map(r => ({
        date: r.date ? new Date(r.date).toISOString().split('T')[0] : '',
        revenue: parseFloat(r.revenue || '0'),
        orders: Number(r.orders || 0)
      }))
    };
  }

  async getReservationTrends(period: string = 'month', startDate?: string, endDate?: string): Promise<{ trends: any[], period: string }> {
    let result: any[];

    if (startDate && endDate) {
      result = await prisma.$queryRaw`
        SELECT 
          date,
          COUNT(*) as total_reservations,
          SUM(guests) as total_guests,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
          COUNT(CASE WHEN status = 'no-show' THEN 1 END) as no_show
        FROM reservations
        WHERE date >= ${startDate} AND date <= ${endDate}
        GROUP BY date
        ORDER BY date ASC
      `;
    } else {
      const ALLOWED_INTERVALS: Record<string, string> = {
        week: '7 days',
        month: '30 days',
        year: '365 days',
        '7': '7 days',
        '30': '30 days',
        '90': '90 days'
      };
      const interval = ALLOWED_INTERVALS[period] ?? '30 days';

      result = await prisma.$queryRaw`
        SELECT 
          date,
          COUNT(*) as total_reservations,
          SUM(guests) as total_guests,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
          COUNT(CASE WHEN status = 'no-show' THEN 1 END) as no_show
        FROM reservations
        WHERE date >= (CURRENT_DATE - ${interval}::interval)::text
        GROUP BY date
        ORDER BY date ASC
      `;
    }

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

  async getDrillDownData(dateStr: string, type: 'orders' | 'reservations'): Promise<any[]> {
    if (type === 'orders') {
      const start = new Date(dateStr);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateStr);
      end.setHours(23, 59, 59, 999);

      const orders = await prisma.orders.findMany({
        where: {
          created_at: {
            gte: start,
            lte: end
          }
        },
        include: {
          order_items: {
            include: {
              menu_items: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });

      return orders.map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        customerName: o.customer_name || 'Guest',
        tableNumber: o.table_number,
        orderType: o.order_type,
        status: o.status,
        totalAmount: Number(o.total_amount),
        createdAt: o.created_at,
        itemsCount: o.order_items.reduce((acc, item) => acc + item.quantity, 0),
        items: o.order_items.map(i => ({
          name: i.menu_items?.name || 'Item',
          quantity: i.quantity,
          price: Number(i.unit_price)
        }))
      }));
    } else {
      const reservations = await prisma.reservations.findMany({
        where: {
          date: dateStr
        },
        orderBy: { time: 'asc' }
      });

      return reservations.map(r => ({
        id: r.id,
        customerName: r.customer_name,
        customerEmail: r.customer_email,
        customerPhone: r.customer_phone,
        date: r.date,
        time: r.time,
        guests: r.guests,
        status: r.status,
        tableId: r.table_id,
        specialRequests: r.special_requests
      }));
    }
  }

  async getMenuAnalytics(): Promise<Record<string, any>> {
    const itemPerformance: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        m.id, 
        m.name, 
        m.category, 
        m.price,
        COUNT(oi.id) as times_ordered, 
        SUM(oi.quantity) as total_quantity,
        SUM(oi.unit_price * oi.quantity) as total_revenue,
        SUM(oi.unit_price * 0.32 * oi.quantity) as total_cost
      FROM menu_items m
      JOIN order_items oi ON m.id = oi.menu_item_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed'
      GROUP BY m.id, m.name, m.category, m.price
      ORDER BY total_revenue DESC
    `);

    const categoryPerformance: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        m.category, 
        COUNT(oi.id) as total_orders, 
        SUM(oi.unit_price * oi.quantity) as total_revenue,
        SUM(oi.unit_price * 0.32 * oi.quantity) as total_cost
      FROM menu_items m
      JOIN order_items oi ON m.id = oi.menu_item_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed'
      GROUP BY m.category
      ORDER BY total_revenue DESC
    `);

    let grandRevenue = 0;
    let grandCost = 0;

    const formattedItems = itemPerformance.map(r => {
      const revenue = parseFloat(r.total_revenue || '0');
      const cost = parseFloat(r.total_cost || '0');
      const profit = revenue - cost;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
      grandRevenue += revenue;
      grandCost += cost;

      return {
        id: r.id, 
        name: r.name, 
        category: r.category,
        price: parseFloat(r.price || '0'),
        timesOrdered: Number(r.times_ordered || 0),
        totalQuantity: Number(r.total_quantity || 0),
        totalRevenue: revenue,
        totalCost: cost,
        netProfit: profit,
        profitMarginPct: parseFloat(margin.toFixed(1))
      };
    });

    const formattedCategories = categoryPerformance.map(r => {
      const revenue = parseFloat(r.total_revenue || '0');
      const cost = parseFloat(r.total_cost || '0');
      const profit = revenue - cost;
      return {
        category: r.category,
        totalOrders: Number(r.total_orders || 0),
        totalRevenue: revenue,
        totalCost: cost,
        netProfit: profit,
        profitMarginPct: revenue > 0 ? parseFloat(((profit / revenue) * 100).toFixed(1)) : 0
      };
    });

    const grandProfit = grandRevenue - grandCost;
    const overallMargin = grandRevenue > 0 ? (grandProfit / grandRevenue) * 100 : 0;

    // Top Profit Stars (sorted by highest net profit contribution)
    const profitStars = [...formattedItems].sort((a, b) => b.netProfit - a.netProfit).slice(0, 5);

    return {
      financialSummary: {
        totalRevenue: grandRevenue,
        totalCost: grandCost,
        totalNetProfit: grandProfit,
        overallMarginPct: parseFloat(overallMargin.toFixed(1))
      },
      topSellingItems: formattedItems.slice(0, 10),
      profitStars,
      categoryPerformance: formattedCategories
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
