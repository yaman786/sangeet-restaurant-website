const pool = require('../config/database');

// Get overall business analytics
const getBusinessAnalytics = async (req, res) => {
  try {
    const { timeframe = '30' } = req.query; // days
    const daysAgo = parseInt(timeframe);
    
    // Since we don't have orders table yet, let's create analytics based on existing data
    const [
      menuStats,
      reservationStats,
      reviewStats,
      eventStats
    ] = await Promise.all([
      // Menu analytics
      pool.query(`
        SELECT 
          COUNT(*) as total_items,
          COUNT(*) FILTER (WHERE is_popular = true) as popular_items,
          COUNT(*) FILTER (WHERE is_vegetarian = true) as vegetarian_items,
          COUNT(DISTINCT category_id) as total_categories
        FROM menu_items 
        WHERE is_active = true
      `),
      
      // Reservation analytics
      pool.query(`
        SELECT 
          COUNT(*) as total_reservations,
          COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_reservations,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_reservations,
          COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_reservations,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '${daysAgo} days') as recent_reservations,
          AVG(guests) as avg_party_size,
          SUM(guests) as total_guests
        FROM reservations
      `),
      
      // Review analytics
      pool.query(`
        SELECT 
          COUNT(*) as total_reviews,
          AVG(rating) as avg_rating,
          COUNT(*) FILTER (WHERE is_verified = true) as verified_reviews,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '${daysAgo} days') as recent_reviews
        FROM customer_reviews
      `),
      
      // Event analytics
      pool.query(`
        SELECT 
          COUNT(*) as total_events,
          COUNT(*) FILTER (WHERE is_featured = true) as featured_events,
          COUNT(*) FILTER (WHERE date >= CURRENT_DATE) as upcoming_events,
          COUNT(*) FILTER (WHERE date >= CURRENT_DATE AND date <= CURRENT_DATE + INTERVAL '30 days') as events_next_month
        FROM events
      `)
    ]);

    const analytics = {
      menu: menuStats.rows[0],
      reservations: reservationStats.rows[0],
      reviews: reviewStats.rows[0],
      events: eventStats.rows[0],
      timeframe: `${daysAgo} days`
    };

    res.json({
      message: 'Business analytics retrieved successfully',
      analytics
    });
  } catch (error) {
    console.error('Error fetching business analytics:', error);
    res.status(500).json({ error: 'Failed to fetch business analytics' });
  }
};

// Get reservation trends
const getReservationTrends = async (req, res) => {
  try {
    const { period = 'week' } = req.query; // week, month, year
    
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
      WHERE date >= CURRENT_DATE - INTERVAL '${interval}'
      GROUP BY TO_CHAR(date, '${dateFormat}')
      ORDER BY period
    `);

    res.json({
      message: 'Reservation trends retrieved successfully',
      trends: trends.rows,
      period
    });
  } catch (error) {
    console.error('Error fetching reservation trends:', error);
    res.status(500).json({ error: 'Failed to fetch reservation trends' });
  }
};

// Get popular menu items analytics
const getMenuAnalytics = async (req, res) => {
  try {
    const [
      categoryStats,
      popularItems,
      dietaryStats
    ] = await Promise.all([
      // Category breakdown
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
      
      // Most popular items
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
      
      // Dietary preferences stats
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

    res.json({
      message: 'Menu analytics retrieved successfully',
      analytics: {
        categories: categoryStats.rows,
        popularItems: popularItems.rows,
        dietaryStats: dietaryStats.rows[0]
      }
    });
  } catch (error) {
    console.error('Error fetching menu analytics:', error);
    res.status(500).json({ error: 'Failed to fetch menu analytics' });
  }
};

// Get customer insights
const getCustomerInsights = async (req, res) => {
  try {
    const [
      reservationPatterns,
      reviewInsights,
      peakTimes
    ] = await Promise.all([
      // Reservation patterns by day of week
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
      
      // Review insights
      pool.query(`
        SELECT 
          rating,
          COUNT(*) as count,
          COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage
        FROM customer_reviews
        GROUP BY rating
        ORDER BY rating DESC
      `),
      
      // Peak reservation times
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

    res.json({
      message: 'Customer insights retrieved successfully',
      insights: {
        reservationPatterns: reservationPatterns.rows,
        reviewDistribution: reviewInsights.rows,
        peakHours: peakTimes.rows
      }
    });
  } catch (error) {
    console.error('Error fetching customer insights:', error);
    res.status(500).json({ error: 'Failed to fetch customer insights' });
  }
};

// Get performance metrics
const getPerformanceMetrics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE created_at BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    } else {
      dateFilter = 'WHERE created_at >= CURRENT_DATE - INTERVAL \'30 days\'';
    }

    const [
      monthlyTrends,
      topPerformers,
      systemHealth
    ] = await Promise.all([
      // Monthly performance trends
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
      
      // Top performing categories/items
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
      
      // System health metrics
      pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM menu_items WHERE is_active = true) as active_menu_items,
          (SELECT COUNT(*) FROM reservations WHERE status = 'pending') as pending_reservations,
          (SELECT COUNT(*) FROM customer_reviews WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as recent_reviews,
          (SELECT COUNT(*) FROM events WHERE date >= CURRENT_DATE) as upcoming_events
      `)
    ]);

    res.json({
      message: 'Performance metrics retrieved successfully',
      metrics: {
        monthlyTrends: monthlyTrends.rows,
        topPerformers: topPerformers.rows,
        systemHealth: systemHealth.rows[0]
      }
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
};

// Export data for reports
const exportAnalyticsData = async (req, res) => {
  try {
    const { type = 'summary', format = 'json' } = req.query;
    
    let data = {};
    
    switch (type) {
      case 'reservations':
        const reservations = await pool.query(`
          SELECT 
            customer_name,
            email,
            phone,
            date,
            time,
            guests,
            status,
            special_requests,
            created_at
          FROM reservations
          ORDER BY created_at DESC
        `);
        data = reservations.rows;
        break;
        
      case 'reviews':
        const reviews = await pool.query(`
          SELECT 
            customer_name,
            review_text,
            rating,
            is_verified,
            created_at
          FROM customer_reviews
          ORDER BY created_at DESC
        `);
        data = reviews.rows;
        break;
        
      case 'menu':
        const menu = await pool.query(`
          SELECT 
            mi.name,
            mi.description,
            mi.price,
            c.name as category,
            mi.is_vegetarian,
            mi.is_spicy,
            mi.is_popular,
            mi.preparation_time
          FROM menu_items mi
          JOIN categories c ON mi.category_id = c.id
          WHERE mi.is_active = true
          ORDER BY c.name, mi.name
        `);
        data = menu.rows;
        break;
        
      default:
        // Summary report
        const [businessSummary] = await Promise.all([
          getBusinessAnalytics({ query: { timeframe: '30' } }, { json: (data) => data })
        ]);
        data = businessSummary;
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_export_${new Date().toISOString().split('T')[0]}.csv"`);
      return res.send(csv);
    }

    res.json({
      message: 'Analytics data exported successfully',
      data,
      type,
      exportedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    res.status(500).json({ error: 'Failed to export analytics data' });
  }
};

// Helper function to convert JSON to CSV
const convertToCSV = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
};

module.exports = {
  getBusinessAnalytics,
  getReservationTrends,
  getMenuAnalytics,
  getCustomerInsights,
  getPerformanceMetrics,
  exportAnalyticsData
};
