const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, regex, replacement) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content.replace(regex, replacement);
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent);
            console.log('Fixed env var in:', filePath);
        }
    }
}

function walkAndFix(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkAndFix(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.js') || fullPath.endsWith('.env.local') || fullPath.endsWith('.env.production')) {
            replaceInFile(fullPath, /NEXT_PUBLIC_/g, 'NEXT_PUBLIC_');
        }
    }
}

walkAndFix('./src');
walkAndFix('./');
