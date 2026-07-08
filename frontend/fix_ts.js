const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, regex, replacement) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content.replace(regex, replacement);
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent);
            console.log('Fixed:', filePath);
        }
    }
}

// Global fix for logoImg TS error
function walkAndFix(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkAndFix(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            replaceInFile(fullPath, /\{logoImg\}/g, '{(logoImg as any).src || (logoImg as any)}');
        }
    }
}

walkAndFix('./src');

// Fix QRMenuPage
replaceInFile('./src/_pages/QRMenuPage.tsx', /qrCode\s*=\s*useParams\(\)\.qrCode/g, 'qrCode = useParams().qrCode as string');
// Ensure it works for `const { qrCode } = useParams()`
replaceInFile('./src/_pages/QRMenuPage.tsx', /const\s+\{\s*qrCode\s*\}\s*=\s*useParams\(\);/g, 'const params = useParams(); const qrCode = typeof params?.qrCode === "string" ? params.qrCode : (params?.qrCode ? params.qrCode[0] : "");');
// Replace the exact error line in QRMenuPage.tsx (204)
replaceInFile('./src/_pages/QRMenuPage.tsx', /qrCode:\s*qrCode,/g, 'qrCode: qrCode as string,');

console.log('TS Fixes Applied.');
