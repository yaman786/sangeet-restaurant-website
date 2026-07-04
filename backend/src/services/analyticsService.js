const pool = require('../config/database');

class AnalyticsService {
  async getBusinessAnalytics(timeframe = '30') {
    const daysAgo = parseInt(timeframe);
    
    const [menuStats, reservationStats, reviewStats, eventStats] = await Promise.all([
      pool.query(`
        SELECT 
          COUNT(*) as total_items,
          COUNT(*) FILTER (WHERE is_popular = true) as popular_items,
          COUNT(*) FILTER (WHERE is_vegetarian = true) as vegetarian_items,
          COUNT(DISTINCT category_id) as total_categories
        FROM menu_items 
        WHERE is_active = true
      `),
      pool.query(`
        SELECT 
          COUNT(*) as total_reservations,
          COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_reservations,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_reservations,
          COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_reservations,
          COUNT(*) FILTER (WHERE created_at >= NOW() - ($1 || ' days')::interval) as recent_reservations,
          AVG(guests) as avg_party_size,
          SUM(guests) as total_guests
        FROM reservations
      `, [daysAgo]),
      pool.query(`
        SELECT 
          COUNT(*) as total_reviews,
          AVG(rating) as avg_rating,
          COUNT(*) FILTER (WHERE is_verified = true) as verified_reviews,
          COUNT(*) FILTER (WHERE created_at >= NOW() - ($1 || ' days')::interval) as recent_reviews
        FROM customer_reviews
      `, [daysAgo]),
      pool.query(`
        SELECT 
          COUNT(*) as total_events,
          COUNT(*) FILTER (WHERE is_featured = true) as featured_events,
          COUNT(*) FILTER (WHERE date >= CURRENT_DATE) as upcoming_events,
          COUNT(*) FILTER (WHERE date >= CURRENT_DATE AND date <= CURRENT_DATE + INTERVAL '30 days') as events_next_month
        FROM events
      `)
    ]);

    return {
      menu: menuStats.rows[0],
      reservations: reservationStats.rows[0],
      reviews: reviewStats.rows[0],
      events: eventStats.rows[0],
      timeframe: `${daysAgo} days`
    };
  }

  async getReservationTrends(period = 'week') {
    let dateFormat, interval;
    switch (period) {
      case 'week':
        dateFormat = 'YYYY-MM-DD';
        interval = '7 days';
        break;
      case 'month':
        dateFormat = 'YYYY-MM-DD';
        interval = '30 days';
        break;
      case 'year':
        dateFormat = 'YYYY-MM';
        interval = '365 days';
        break;
      default:
        dateFormat = 'YYYY-MM-DD';
        interval = '30 days';
    }

    const trends = await pool.query(`
      SELECT 
        TO_CHAR(date, '${dateFormat}') as period,
        COUNT(*) as total_reservations,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        SUM(guests) as total_guests,
        AVG(guests) as avg_party_size
      FROM reservations 
      WHERE date >= CURRENT_DATE - CAST($1 AS interval)
      GROUP BY TO_CHAR(date, '${dateFormat}')
      ORDER BY period
    `, [interval]);

    return { trends: trends.rows, period };
  }

  async getMenuAnalytics() {
    const [categoryStats, popularItems, dietaryStats] = await Promise.all([
      pool.query(`
        SELECT 
          c.name as category_name,
          COUNT(mi.id) as item_count,
          COUNT(*) FILTER (WHERE mi.is_popular = true) as popular_count,
          COUNT(*) FILTER (WHERE mi.is_vegetarian = true) as vegetarian_count,
          AVG(mi.price) as avg_price
        FROM categories c
        LEFT JOIN menu_items mi ON c.id = mi.category_id AND mi.is_active = true
        WHERE c.is_active = true
        GROUP BY c.id, c.name
        ORDER BY item_count DESC
      `),
      pool.query(`
        SELECT 
          mi.name,
          mi.price,
          mi.is_vegetarian,
          mi.is_spicy,
          c.name as category_name,
          mi.preparation_time
        FROM menu_items mi
        JOIN categories c ON mi.category_id = c.id
        WHERE mi.is_popular = true AND mi.is_active = true
        ORDER BY mi.price DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT 
          COUNT(*) as total_items,
          COUNT(*) FILTER (WHERE is_vegetarian = true) as vegetarian_items,
          COUNT(*) FILTER (WHERE is_spicy = true) as spicy_items,
          COUNT(*) FILTER (WHERE is_popular = true) as popular_items,
          AVG(price) as avg_price,
          MIN(price) as min_price,
          MAX(price) as max_price
        FROM menu_items 
        WHERE is_active = true
      `)
    ]);

    return {
      categories: categoryStats.rows,
      popularItems: popularItems.rows,
      dietaryStats: dietaryStats.rows[0]
    };
  }

  async getCustomerInsights() {
    const [reservationPatterns, reviewInsights, peakTimes] = await Promise.all([
      pool.query(`
        SELECT 
          EXTRACT(DOW FROM date) as day_of_week,
          CASE EXTRACT(DOW FROM date)
            WHEN 0 THEN 'Sunday'
            WHEN 1 THEN 'Monday'
            WHEN 2 THEN 'Tuesday'
            WHEN 3 THEN 'Wednesday'
            WHEN 4 THEN 'Thursday'
            WHEN 5 THEN 'Friday'
            WHEN 6 THEN 'Saturday'
          END as day_name,
          COUNT(*) as reservation_count,
          AVG(guests) as avg_party_size,
          COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_count
        FROM reservations
        WHERE date >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY EXTRACT(DOW FROM date)
        ORDER BY day_of_week
      `),
      pool.query(`
        SELECT 
          rating,
          COUNT(*) as count,
          COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage
        FROM customer_reviews
        GROUP BY rating
        ORDER BY rating DESC
      `),
      pool.query(`
        SELECT 
          EXTRACT(HOUR FROM time) as hour,
          COUNT(*) as reservation_count
        FROM reservations
        WHERE date >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY EXTRACT(HOUR FROM time)
        ORDER BY hour
      `)
    ]);

    return {
      reservationPatterns: reservationPatterns.rows,
      reviewDistribution: reviewInsights.rows,
      peakHours: peakTimes.rows
    };
  }

  async getPerformanceMetrics(startDate, endDate) {
    let dateFilter = '';
    const params = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE created_at BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    } else {
      dateFilter = 'WHERE created_at >= CURRENT_DATE - INTERVAL \'30 days\'';
    }

    const [monthlyTrends, topPerformers, systemHealth] = await Promise.all([
      pool.query(`
        SELECT 
          TO_CHAR(r.created_at, 'YYYY-MM') as month,
          COUNT(*) as total_reservations,
          AVG(cr.rating) as avg_rating
        FROM reservations r
        LEFT JOIN customer_reviews cr ON DATE(r.created_at) = DATE(cr.created_at)
        ${dateFilter ? dateFilter.replace('created_at', 'r.created_at') : ''}
        GROUP BY TO_CHAR(r.created_at, 'YYYY-MM')
        ORDER BY month
      `, params),
      pool.query(`
        SELECT 
          c.name as category,
          COUNT(mi.id) as item_count,
          AVG(mi.price) as avg_price,
          COUNT(*) FILTER (WHERE mi.is_popular = true) as popular_count
        FROM categories c
        LEFT JOIN menu_items mi ON c.id = mi.category_id
        WHERE c.is_active = true AND (mi.is_active = true OR mi.is_active IS NULL)
        GROUP BY c.id, c.name
        ORDER BY popular_count DESC, avg_price DESC
        LIMIT 5
      `),
      pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM menu_items WHERE is_active = true) as active_menu_items,
          (SELECT COUNT(*) FROM reservations WHERE status = 'pending') as pending_reservations,
          (SELECT COUNT(*) FROM customer_reviews WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as recent_reviews,
          (SELECT COUNT(*) FROM events WHERE date >= CURRENT_DATE) as upcoming_events
      `)
    ]);

    return {
      monthlyTrends: monthlyTrends.rows,
      topPerformers: topPerformers.rows,
      systemHealth: systemHealth.rows[0]
    };
  }

  async getExportData(type) {
    switch (type) {
      case 'reservations':
        const reservations = await pool.query(`
          SELECT 
            customer_name, email, phone, date, time, guests, status, special_requests, created_at
          FROM reservations
          ORDER BY created_at DESC
        `);
        return reservations.rows;
        
      case 'reviews':
        const reviews = await pool.query(`
          SELECT 
            customer_name, review_text, rating, is_verified, created_at
          FROM customer_reviews
          ORDER BY created_at DESC
        `);
        return reviews.rows;
        
      case 'menu':
        const menu = await pool.query(`
          SELECT 
            mi.name, mi.description, mi.price, c.name as category, mi.is_vegetarian, mi.is_spicy, mi.is_popular, mi.preparation_time
          FROM menu_items mi
          JOIN categories c ON mi.category_id = c.id
          WHERE mi.is_active = true
          ORDER BY c.name, mi.name
        `);
        return menu.rows;
        
      default:
        const businessSummary = await this.getBusinessAnalytics('30');
        return businessSummary;
    }
  }

  convertToCSV(data) {
    if (!Array.isArray(data) || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    return csvContent;
  }
}

module.exports = new AnalyticsService();
