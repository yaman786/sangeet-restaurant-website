const fs = require('fs');
const path = require('path');

function createRoute(dir, component, layout = false, roles = null) {
    fs.mkdirSync(dir, { recursive: true });
    let content = `'use client';\nimport ${component} from '@/_pages/${component}';\n`;
    if (layout) {
        content += `import StandaloneLayout from '@/layouts/StandaloneLayout';\n`;
    }
    if (roles) {
        content += `import ProtectedRoute from '@/components/ProtectedRoute';\n`;
    }
    
    content += `\nexport default function Page() {\n  return (\n`;
    
    let inner = `<${component} />`;
    if (roles) inner = `<ProtectedRoute requiredRole={${roles}}>\n      ${inner}\n    </ProtectedRoute>`;
    if (layout) inner = `<StandaloneLayout>\n      ${inner}\n    </StandaloneLayout>`;
    
    content += `    ${inner}\n  );\n}\n`;
    
    fs.writeFileSync(path.join(dir, 'page.tsx'), content);
}

const appDir = path.join(__dirname, 'src', 'app');

// Kitchen Routes
createRoute(path.join(appDir, 'kitchen', 'login'), 'LoginPage', true);
createRoute(path.join(appDir, 'kitchen', 'display'), 'KitchenDisplayPage', true, "['admin', 'kitchen', 'waiter']");

// QR Routes (dynamic route)
createRoute(path.join(appDir, 'qr', '[qrCode]'), 'QRMenuPage', true);
createRoute(path.join(appDir, 'qr', '[qrCode]', 'cart'), 'QRCartPage', true);

console.log('Generated extra routes.');
