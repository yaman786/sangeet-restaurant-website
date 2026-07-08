const fs = require('fs');
const path = require('path');

const publicRoutes = [
    { path: 'menu', comp: 'MenuPage' },
    { path: 'qr-codes', comp: 'QRCodeDisplayPage' },
    { path: 'reservations', comp: 'ReservationsPage' },
    { path: 'about', comp: 'AboutPage' },
    { path: 'contact', comp: 'ContactPage' },
    { path: 'location', comp: 'LocationPage' },
    { path: 'review', comp: 'ReviewSubmissionPage' },
    { path: 'track-order', comp: 'OrderTrackingPage' },
];

const standaloneRoutes = [
    { path: 'login', comp: 'LoginPage' },
    { path: 'order', comp: 'UnifiedOrderPage' },
    { path: 'dashboard', comp: 'UnifiedDashboard' },
    { path: 'order-success', comp: 'OrderSuccessPage' },
];

function createRoute(baseDir, routePath, component, layoutStr = '') {
    const routeDir = path.join(baseDir, routePath);
    fs.mkdirSync(routeDir, { recursive: true });
    
    let content = `'use client';\nimport ${component} from '@/_pages/${component}';\n\n`;
    if (layoutStr) {
        content += `import Layout from '@/layouts/${layoutStr}';\n\n`;
        content += `export default function Page() {\n  return <Layout><${component} /></Layout>;\n}\n`;
    } else {
        content += `export default function Page() {\n  return <${component} />;\n}\n`;
    }
    
    fs.writeFileSync(path.join(routeDir, 'page.tsx'), content);
}

const appDir = path.join(__dirname, 'src', 'app');

publicRoutes.forEach(r => createRoute(path.join(appDir, '(public)'), r.path, r.comp));

standaloneRoutes.forEach(r => createRoute(appDir, r.path, r.comp, 'StandaloneLayout'));

console.log('Generated public and standalone routes.');
