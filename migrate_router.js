const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace `react-router-dom` imports
    if (content.includes('react-router-dom')) {
        let imports = [];
        let rrdRegex = /import\s+\{([^}]+)\}\s+from\s+['"]react-router-dom['"];?/g;
        let match;
        while ((match = rrdRegex.exec(content)) !== null) {
            let tokens = match[1].split(',').map(s => s.trim());
            let nextLink = false;
            let mockHooks = [];
            let nextNavigation = [];
            
            if (tokens.includes('Link')) nextLink = true;
            if (tokens.includes('useNavigate')) mockHooks.push('useNavigate');
            if (tokens.includes('useLocation')) mockHooks.push('useLocation');
            if (tokens.includes('useParams')) nextNavigation.push('useParams');
            if (tokens.includes('Outlet')) content = content.replace(/<Outlet\s*\/?>(<\/Outlet>)?/g, '{children}');

            let replacements = [];
            if (nextLink) replacements.push("import Link from 'next/link';");
            if (nextNavigation.length > 0) {
                replacements.push(`import { ${[...new Set(nextNavigation)].join(', ')} } from 'next/navigation';`);
            }
            if (mockHooks.length > 0) {
                // Calculate relative path to src/utils/router-mock
                // Just use alias @/utils/router-mock
                replacements.push(`import { ${[...new Set(mockHooks)].join(', ')} } from '@/utils/router-mock';`);
            }

            content = content.replace(match[0], replacements.join('\n'));
        }
    }

    // Replace `<Link to=` with `<Link href=`
    content = content.replace(/<Link\s+to=/g, '<Link href=');
    content = content.replace(/<Link\s+([^>]*?)to=/g, '<Link $1href=');
    
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Migrated router in:', filePath);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next') walk(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

walk('./src');
