import pool from '@/lib/db';
import type { QRCodeRow, QRCodeResult } from '@/lib/types';
import beautifulQRGenerator from '../utils/beautifulQRGenerator';

class AnalyticsService {
  async getBusinessAnalytics(timeframe: string = 'week'): Promise<Record<string, any>> {
    let dateFilter = "INTERVAL '7 days'";
    if (timeframe === 'month') dateFilter = "INTERVAL '30 days'";
    else if (timeframe === 'year') dateFilter = "INTERVAL '365 days'";
    else if (timeframe === 'today') dateFilter = "INTERVAL '1 day'";

    const revenueResult = await pool.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(*) as total_orders,
        COALESCE(AVG(total_amount), 0) as average_order_value
      FROM orders 
      WHERE created_at >= NOW() - ${dateFilter} 
      AND status = 'completed'
    `);

    const recentOrders = await pool.query(`
      SELECT DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as orders
      FROM orders
      WHERE created_at >= NOW() - ${dateFilter} AND status = 'completed'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    return {
      summary: {
        totalRevenue: parseFloat(revenueResult.rows[0].total_revenue),
        totalOrders: parseInt(revenueResult.rows[0].total_orders, 10),
        averageOrderValue: parseFloat(revenueResult.rows[0].average_order_value)
      },
      trends: recentOrders.rows.map(r => ({
        date: r.date,
        revenue: parseFloat(r.revenue),
        orders: parseInt(r.orders, 10)
      }))
    };
  }

  async getReservationTrends(period: string = 'month'): Promise<{ trends: any[], period: string }> {
    let dateFilter = "INTERVAL '30 days'";
    if (period === 'week') dateFilter = "INTERVAL '7 days'";
    else if (period === 'year') dateFilter = "INTERVAL '365 days'";

    const result = await pool.query(`
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
      trends: result.rows.map(r => ({
        date: r.date,
        totalReservations: parseInt(r.total_reservations, 10),
        totalGuests: parseInt(r.total_guests, 10),
        completed: parseInt(r.completed, 10),
        cancelled: parseInt(r.cancelled, 10),
        noShow: parseInt(r.no_show, 10)
      }))
    };
  }

  async getMenuAnalytics(): Promise<Record<string, any>> {
    const topItems = await pool.query(`
      SELECT m.id, m.name, m.category, COUNT(oi.id) as times_ordered, SUM(oi.quantity) as total_quantity
      FROM menu_items m
      JOIN order_items oi ON m.id = oi.menu_item_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed'
      GROUP BY m.id, m.name, m.category
      ORDER BY times_ordered DESC
      LIMIT 10
    `);

    const categoryPerformance = await pool.query(`
      SELECT m.category, COUNT(oi.id) as total_orders, SUM(oi.price * oi.quantity) as total_revenue
      FROM menu_items m
      JOIN order_items oi ON m.id = oi.menu_item_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed'
      GROUP BY m.category
      ORDER BY total_revenue DESC
    `);

    return {
      topSellingItems: topItems.rows.map(r => ({
        id: r.id, name: r.name, category: r.category,
        timesOrdered: parseInt(r.times_ordered, 10),
        totalQuantity: parseInt(r.total_quantity, 10)
      })),
      categoryPerformance: categoryPerformance.rows.map(r => ({
        category: r.category,
        totalOrders: parseInt(r.total_orders, 10),
        totalRevenue: parseFloat(r.total_revenue)
      }))
    };
  }

  async getCustomerInsights(): Promise<Record<string, any>> {
    const timeDistribution = await pool.query(`
      SELECT EXTRACT(HOUR FROM time::time) as hour, COUNT(*) as reservations
      FROM reservations
      WHERE status IN ('completed', 'confirmed')
      GROUP BY hour
      ORDER BY hour ASC
    `);

    const orderTypes = await pool.query(`
      SELECT order_type, COUNT(*) as count, SUM(total_amount) as revenue
      FROM orders
      WHERE status = 'completed'
      GROUP BY order_type
    `);

    const reviewSummary = await pool.query(`
      SELECT 
        AVG(rating) as avg_rating,
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_reviews
      FROM customer_reviews
      WHERE is_verified = true
    `);

    return {
      peakHours: timeDistribution.rows.map(r => ({
        hour: parseInt(r.hour, 10),
        reservations: parseInt(r.reservations, 10)
      })),
      orderTypes: orderTypes.rows.map(r => ({
        type: r.order_type,
        count: parseInt(r.count, 10),
        revenue: parseFloat(r.revenue)
      })),
      reviews: {
        averageRating: parseFloat(reviewSummary.rows[0].avg_rating || 0).toFixed(1),
        totalReviews: parseInt(reviewSummary.rows[0].total_reviews, 10),
        positiveReviews: parseInt(reviewSummary.rows[0].positive_reviews, 10)
      }
    };
  }

  async getPerformanceMetrics(startDate?: string, endDate?: string): Promise<Record<string, any>> {
    let dateFilter = '';
    const params = [];
    if (startDate && endDate) {
      dateFilter = 'WHERE created_at BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    }

    const completionTimes = await pool.query(`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at)))/60 as avg_prep_time_minutes
      FROM orders
      ${dateFilter ? dateFilter + " AND status = 'completed'" : "WHERE status = 'completed'"}
    `, params);

    return {
      averagePreparationTime: parseFloat(completionTimes.rows[0].avg_prep_time_minutes || 0).toFixed(1)
    };
  }

  async getExportData(type: string): Promise<any[]> {
    if (type === 'orders') {
      const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 1000');
      return result.rows;
    } else if (type === 'reservations') {
      const result = await pool.query('SELECT * FROM reservations ORDER BY date DESC, time DESC LIMIT 1000');
      return result.rows;
    } else {
      const result = await pool.query('SELECT * FROM menu_items ORDER BY category, name');
      return result.rows;
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
