const fs = require('fs');
const path = require('path');

function addUseClient(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            addUseClient(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            // If it imports react hooks, framer-motion, lucide-react, or is a component, add "use client"
            // Let's just add "use client" to ALL .tsx files in these dirs, because they are client components from CRA.
            if (fullPath.endsWith('.tsx') && !content.startsWith('"use client";')) {
                fs.writeFileSync(fullPath, '"use client";\n' + content);
            }
        }
    }
}

addUseClient('./src/components');
addUseClient('./src/layouts');
addUseClient('./src/contexts');
addUseClient('./src/_pages');

console.log('Added "use client" to all TSX files.');
