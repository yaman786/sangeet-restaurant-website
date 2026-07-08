const fs = require('fs');
const path = require('path');

const adminRoutes = [
    { path: 'login', comp: 'LoginPage', roles: null },
    { path: 'dashboard', comp: 'AdminDashboard', roles: "['admin', 'reception', 'waiter']" },
    { path: 'history', comp: 'HistoryDashboard', roles: "['admin', 'reception']" },
    { path: 'orders', comp: 'AdminOrders', roles: "['admin', 'reception', 'waiter']" },
    { path: 'menu-management', comp: 'MenuManagement', roles: "'admin'" },
    { path: 'qr-management', comp: 'QRManagement', roles: "['admin']" },
    { path: 'reservations', comp: 'ReservationManagementPage', roles: "['admin', 'reception']" },
    { path: 'staff-management', comp: 'StaffManagement', roles: "'admin'" },
    { path: 'website-management', comp: 'RestaurantWebsiteManagementPage', roles: "'admin'" },
    { path: 'analytics', comp: 'AnalyticsReportsPage', roles: "'admin'" },
    { path: 'kitchen', comp: 'KitchenDisplayPage', roles: "['admin', 'kitchen', 'waiter']" },
];

function createAdminRoute(baseDir, route) {
    const routeDir = path.join(baseDir, route.path);
    fs.mkdirSync(routeDir, { recursive: true });
    
    let content = `'use client';\n`;
    if (route.comp === 'StaffManagement') {
        // StaffManagement uses index.tsx inside its folder in _pages
        content += `import ${route.comp} from '@/_pages/${route.comp}';\n`;
    } else {
        content += `import ${route.comp} from '@/_pages/${route.comp}';\n`;
    }
    
    if (route.roles) {
        content += `import ProtectedRoute from '@/components/ProtectedRoute';\n\n`;
        content += `export default function Page() {\n  return (\n    <ProtectedRoute requiredRole={${route.roles}}>\n      <${route.comp} />\n    </ProtectedRoute>\n  );\n}\n`;
    } else {
        content += `\nexport default function Page() {\n  return <${route.comp} />;\n}\n`;
    }
    
    fs.writeFileSync(path.join(routeDir, 'page.tsx'), content);
}

const adminDir = path.join(__dirname, 'src', 'app', 'admin');
fs.mkdirSync(adminDir, { recursive: true });

// Create layout
fs.writeFileSync(path.join(adminDir, 'layout.tsx'), `'use client';
import StandaloneLayout from '@/layouts/StandaloneLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <StandaloneLayout>{children}</StandaloneLayout>;
}
`);

adminRoutes.forEach(r => createAdminRoute(adminDir, r));

console.log('Generated admin routes.');
