const QRCode = require('qrcode');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

class BeautifulQRGenerator {
  constructor() {
    this.logoPath = path.join(__dirname, '../../public/logo.png');
    
    // Multiple color themes with globally popular colors
    this.colorThemes = {
      modern: {
        primary: '#2563EB',
        secondary: '#1E293B',
        accent: '#0EA5E9',
        background: '#FFFFFF',
        text: '#1E293B',
        gradient: ['#2563EB', '#0EA5E9'],
        name: 'Modern Blue'
      },
      elegant: {
        primary: '#7C3AED',
        secondary: '#4C1D95',
        accent: '#A855F7',
        background: '#FFFFFF',
        text: '#4C1D95',
        gradient: ['#7C3AED', '#A855F7'],
        name: 'Elegant Purple'
      },
      premium: {
        primary: '#059669',
        secondary: '#064E3B',
        accent: '#10B981',
        background: '#FFFFFF',
        text: '#064E3B',
        gradient: ['#059669', '#10B981'],
        name: 'Premium Green'
      },
      classic: {
        primary: '#DC2626',
        secondary: '#7F1D1D',
        accent: '#EF4444',
        background: '#FFFFFF',
        text: '#7F1D1D',
        gradient: ['#DC2626', '#EF4444'],
        name: 'Classic Red'
      },
      gold: {
        primary: '#D4AF37',
        secondary: '#1d1b16',
        accent: '#B8860B',
        background: '#FFFFFF',
        text: '#1d1b16',
        gradient: ['#D4AF37', '#B8860B'],
        name: 'Elegant Gold'
      }
    };
    
    this.defaultColors = this.colorThemes.modern;
  }

  async generateBeautifulQRCode(tableNumber, qrUrl, options = {}) {
    try {
      const {
        width = 800,
        height = 1000,
        qrSize = 400,
        format = 'png',
        colors = this.defaultColors,
        theme = 'modern'
      } = options;

      // Use theme colors if specified
      const colorScheme = theme && this.colorThemes[theme] ? this.colorThemes[theme] : colors;

      // Generate QR code
      const qrCodeBuffer = await QRCode.toBuffer(qrUrl, {
        width: qrSize,
        margin: 2,
        color: {
          dark: colorScheme.secondary,
          light: colorScheme.background
        },
        errorCorrectionLevel: 'H'
      });

      // Create SVG for the beautiful design
      const svgContent = await this.generateSVGDesign(tableNumber, qrCodeBuffer, colorScheme, width, height, qrSize);

      // Convert SVG to buffer
      let outputBuffer;
      if (format === 'jpeg') {
        outputBuffer = await sharp(Buffer.from(svgContent))
          .jpeg({ quality: 98 })
          .toBuffer();
      } else {
        outputBuffer = await sharp(Buffer.from(svgContent))
          .png({ quality: 98 })
          .toBuffer();
      }

      return outputBuffer;

    } catch (error) {
      console.error('Error generating beautiful QR code:', error);
      throw error;
    }
  }

  // Helper function to wrap text within specified width
  wrapText(text, maxWidth, fontSize = 24) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    // Approximate character width (adjust based on font)
    const charWidth = fontSize * 0.6;
    const maxChars = Math.floor(maxWidth / charWidth);
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length <= maxChars) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  async generateSVGDesign(tableNumber, qrCodeBuffer, colors, width, height, qrSize) {
    const qrCodeBase64 = qrCodeBuffer.toString('base64');
    const centerX = width / 2;
    
    // Read and encode the logo
    let logoBase64 = '';
    try {
      const logoBuffer = await fs.promises.readFile(this.logoPath);
      logoBase64 = logoBuffer.toString('base64');
    } catch (error) {
      console.log('Logo not found, using text fallback');
    }
    
    // 1. Outer Padding (card edge to content) - Standard portrait format
    const outerPaddingTop = 40;
    const outerPaddingBottom = 40;
    const outerPaddingLeft = 24; // Decreased horizontal spacing
    const outerPaddingRight = 24; // Decreased horizontal spacing
    
    // 2. Header (Restaurant name & tagline)
    const restaurantNameFontSize = 30; // 28-32px
    const lineSpacingAfterName = 8;
    const taglineFontSize = 15; // 14-16px
    const spacingAfterTagline = 24;
    
    // 3. QR Code Section
    const qrSizePx = 240; // 220-260px square
    const spacingAboveQR = 0; // sits right after tagline space
    const spacingBelowQR = 24;
    
    // 4. Instruction Text
    const instructionFontSize = 15; // 14-16px
    const spacingAboveInstruction = 8;
    const spacingBelowInstruction = 16;
    
    // 5. Order Tracking Text
    const trackingFontSize = 13; // 12-14px
    const spacingAboveTracking = 4;
    
    // 6. Footer
    const spacingAboveFooter = 24;
    const tableNumberFontSize = 17; // 16-18px
    const websiteFontSize = 13; // 12-14px
    const bottomPadding = 20;
    
    // 7. Card Border & Corner
    const borderThickness = 2;
    const cornerRadius = 14; // 12-16px
    const shadowOpacity = 0.18; // 15-20%
    
    // Calculate positions
    const contentStartY = outerPaddingTop;
    const logoY = contentStartY + 10; // Logo position - decreased from 20px to 10px from top
    const logoSize = 180; // Logo size - increased from 160 to 180
    const taglineY = logoY + logoSize + 6; // Space between logo and tagline - decreased from 8px to 6px
    const qrCodeY = taglineY + taglineFontSize + spacingAfterTagline + spacingAboveQR;
    const buttonY = qrCodeY + qrSizePx + spacingBelowQR + 24; // Increased space between QR and button from 16px to 24px
    const trackingY = buttonY + 40 + spacingBelowInstruction + spacingAboveTracking;
    const footerY = trackingY + trackingFontSize + spacingAboveFooter;
    const tableNumberY = footerY;
    const websiteY = tableNumberY + tableNumberFontSize + 8;
    const bottomY = websiteY + websiteFontSize + bottomPadding;
    
    // Calculate total height needed
    const totalHeight = bottomY + outerPaddingBottom;
    
    // Tagline text
    const taglineText = "Authentic Nepali and Indian Flavours - Served Fresh, Served Warm";
    const maxTextWidth = (width - outerPaddingLeft - outerPaddingRight) * 0.85;
    const wrappedLines = this.wrapText(taglineText, maxTextWidth, taglineFontSize);
    
    // Calculate tagline positioning
    const lineHeight = taglineFontSize + 4;
    const totalTaglineHeight = wrappedLines.length * lineHeight;
    const taglineEndY = taglineY + totalTaglineHeight;
    
    // Adjust QR code position based on tagline height
    const adjustedQrY = taglineEndY + spacingAfterTagline + spacingAboveQR;

    // Generate wrapped tagline elements
    const taglineElements = wrappedLines.map((line, index) => 
      `<text x="${centerX}" y="${taglineY + (index * lineHeight)}" text-anchor="middle" font-family="Georgia, serif" font-size="${taglineFontSize}" font-style="italic" fill="#D4AF37">${line}</text>`
    ).join('\n        ');

    return `
      <svg width="${width}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="${shadowOpacity}"/>
          </filter>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Dark background -->
        <rect width="${width}" height="${totalHeight}" fill="#0D1B2A"/>
        
        <!-- Main card with golden border -->
        <rect x="${outerPaddingLeft}" y="${outerPaddingTop}" width="${width - outerPaddingLeft - outerPaddingRight}" height="${totalHeight - outerPaddingTop - outerPaddingBottom}" fill="#0D1B2A" stroke="#D4AF37" stroke-width="${borderThickness}" rx="${cornerRadius}" ry="${cornerRadius}" filter="url(#shadow)"/>
        

        
        <!-- Restaurant Logo -->
        ${logoBase64 ? `<image x="${centerX - logoSize/2}" y="${logoY}" width="${logoSize}" height="${logoSize}" href="data:image/png;base64,${logoBase64}"/>` : `<text x="${centerX}" y="${logoY + logoSize/2}" text-anchor="middle" font-family="Playfair Display, serif" font-size="24" font-weight="bold" fill="white">SANGEET</text>`}
        
        <!-- Tagline -->
        ${taglineElements}
        
        <!-- QR Code with golden border -->
        <rect x="${centerX - qrSizePx/2 - 8}" y="${adjustedQrY - 8}" width="${qrSizePx + 16}" height="${qrSizePx + 16}" fill="#D4AF37" rx="12" ry="12" filter="url(#shadow)"/>
        <image x="${centerX - qrSizePx/2}" y="${adjustedQrY}" width="${qrSizePx}" height="${qrSizePx}" href="data:image/png;base64,${qrCodeBase64}"/>
        
        <!-- Button-like element -->
        <rect x="${centerX - 150}" y="${buttonY}" width="300" height="40" fill="#D4AF37" rx="8" ry="8" filter="url(#shadow)"/>
        <text x="${centerX}" y="${buttonY + 25}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#0D1B2A">SCAN TO VIEW MENU AND ORDER ONLINE</text>
        
        <!-- Order Tracking Text -->
        <text x="${centerX}" y="${trackingY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${trackingFontSize}" fill="#ccc">Track your order: open your camera, scan the QR, start tracking.</text>
        
        <!-- Footer -->
        <text x="${centerX}" y="${tableNumberY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${tableNumberFontSize}" font-weight="bold" fill="white">TABLE ${tableNumber}</text>
        <text x="${centerX}" y="${websiteY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${websiteFontSize}" fill="#ccc">www.sangeetrestaurant.com</text>
      </svg>
    `;
  }

  // Generate different design variations - Standard portrait format
  async generateClassicDesign(tableNumber, qrUrl, options = {}) {
    return await this.generateBeautifulQRCode(tableNumber, qrUrl, {
      ...options,
      width: 600, // Standard portrait width
      qrSize: 240
    });
  }

  async generateLargeDesign(tableNumber, qrUrl, options = {}) {
    return await this.generateBeautifulQRCode(tableNumber, qrUrl, {
      ...options,
      width: 750, // Larger portrait width
      qrSize: 300
    });
  }

  // Generate a premium design with more details
  async generatePremiumDesign(tableNumber, qrUrl, options = {}) {
    try {
      const {
        width = 700, // Standard portrait width
        qrSize = 280,
        format = 'png',
        colors = this.defaultColors,
        theme = 'modern'
      } = options;

      // Use theme colors if specified
      const colorScheme = theme && this.colorThemes[theme] ? this.colorThemes[theme] : colors;

      // Generate QR code
      const qrCodeBuffer = await QRCode.toBuffer(qrUrl, {
        width: qrSize,
        margin: 2,
        color: {
          dark: colorScheme.secondary,
          light: colorScheme.background
        },
        errorCorrectionLevel: 'H'
      });

      // Create enhanced SVG for premium design
      const svgContent = await this.generatePremiumSVGDesign(tableNumber, qrCodeBuffer, colorScheme, width, height, qrSize);

      // Convert SVG to buffer
      let outputBuffer;
      if (format === 'jpeg') {
        outputBuffer = await sharp(Buffer.from(svgContent))
          .jpeg({ quality: 98 })
          .toBuffer();
      } else {
        outputBuffer = await sharp(Buffer.from(svgContent))
          .png({ quality: 98 })
          .toBuffer();
      }

      return outputBuffer;

    } catch (error) {
      console.error('Error generating premium QR code:', error);
      throw error;
    }
  }

  generatePremiumSVGDesign(tableNumber, qrCodeBuffer, colors, width, height, qrSize) {
    const qrCodeBase64 = qrCodeBuffer.toString('base64');
    const centerX = width / 2;
    const padding = 50;
    const contentWidth = width - (padding * 2);
    
    // Calculate positions for premium dark theme design with more space below QR code
    const logoY = padding + 50;
    const logoSize = 70;
    const headingY = logoY + logoSize + 40;
    const taglineY = headingY + 60;
    const qrCodeY = taglineY + 75;
    const ctaY = qrCodeY + qrSize + 70;
    const detailsY = ctaY + 65;
    
    // New tagline text
    const taglineText = "Authentic Nepali and Indian Flavours - Served Fresh, Served Warm";
    const maxTextWidth = contentWidth * 0.85;
    const wrappedLines = this.wrapText(taglineText, maxTextWidth, 20);
    
    // Calculate tagline positioning
    const lineHeight = 26;
    const totalTaglineHeight = wrappedLines.length * lineHeight;
    const taglineEndY = taglineY + totalTaglineHeight;
    
    // Adjust QR code position based on tagline height
    const adjustedQrY = taglineEndY + 40;

    // Generate wrapped tagline elements
    const taglineElements = wrappedLines.map((line, index) => 
      `<text x="${centerX}" y="${taglineY + (index * lineHeight)}" text-anchor="middle" font-family="Georgia, serif" font-size="20" font-style="italic" fill="#D4AF37">${line}</text>`
    ).join('\n        ');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="3" dy="6" stdDeviation="4" flood-color="#000000" flood-opacity="0.4"/>
          </filter>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Dark background -->
        <rect width="${width}" height="${height}" fill="#0D1B2A"/>
        
        <!-- Main card with golden border -->
        <rect x="${padding}" y="${padding}" width="${contentWidth}" height="${height - (padding * 2)}" fill="#0D1B2A" stroke="#D4AF37" stroke-width="3" rx="20" ry="20"/>
        
        <!-- Logo placeholder (you can replace with actual logo) -->
        <circle cx="${centerX}" cy="${logoY + logoSize/2}" r="${logoSize/2}" fill="#D4AF37" opacity="0.3"/>
        <text x="${centerX}" y="${logoY + logoSize/2 + 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#D4AF37">LOGO</text>
        
        <!-- Restaurant Name -->
        <text x="${centerX}" y="${headingY}" text-anchor="middle" font-family="Playfair Display, serif" font-size="40" font-weight="bold" fill="white">SANGEET</text>
        
        <!-- Tagline -->
        ${taglineElements}
        
        <!-- QR Code with golden border -->
        <rect x="${centerX - qrSize/2 - 12}" y="${adjustedQrY - 12}" width="${qrSize + 24}" height="${qrSize + 24}" fill="#D4AF37" rx="16" ry="16" filter="url(#shadow)"/>
        <image x="${centerX - qrSize/2}" y="${adjustedQrY}" width="${qrSize}" height="${qrSize}" href="data:image/png;base64,${qrCodeBase64}"/>
        
        <!-- CTA Button -->
        <rect x="${centerX - 170}" y="${ctaY - 15}" width="340" height="45" fill="#D4AF37" rx="10" ry="10" filter="url(#shadow)"/>
        <text x="${centerX}" y="${ctaY + 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0D1B2A">SCAN TO VIEW MENU AND ORDER ONLINE</text>
        
        <!-- Details -->
        <text x="${centerX}" y="${detailsY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white">TABLE ${tableNumber}</text>
        <text x="${centerX}" y="${detailsY + 28}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#ccc">www.sangeetrestaurant.com</text>
        <text x="${centerX}" y="${detailsY + 50}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#ccc">Open your camera, scan the QR, start ordering.</text>
      </svg>
    `;
  }

  // Get available color themes
  getAvailableThemes() {
    return Object.keys(this.colorThemes).map(key => ({
      key,
      name: this.colorThemes[key].name,
      primary: this.colorThemes[key].primary
    }));
  }
}

module.exports = new BeautifulQRGenerator();
