import logger from './logger';
import QRCode from 'qrcode';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import type { ColorTheme, QRGenerationOptions } from '../types';

class BeautifulQRGenerator {
  readonly logoPath: string;
  readonly colorThemes: Record<string, ColorTheme>;
  readonly defaultColors: ColorTheme;

  constructor() {
    this.logoPath = path.join(__dirname, '../../public/logo.png');
    
    this.colorThemes = {
      modern: { primary: '#2563EB', secondary: '#1E293B', accent: '#0EA5E9', background: '#FFFFFF', text: '#1E293B', gradient: ['#2563EB', '#0EA5E9'], name: 'Modern Blue' },
      elegant: { primary: '#7C3AED', secondary: '#4C1D95', accent: '#A855F7', background: '#FFFFFF', text: '#4C1D95', gradient: ['#7C3AED', '#A855F7'], name: 'Elegant Purple' },
      premium: { primary: '#059669', secondary: '#064E3B', accent: '#10B981', background: '#FFFFFF', text: '#064E3B', gradient: ['#059669', '#10B981'], name: 'Premium Green' },
      classic: { primary: '#DC2626', secondary: '#7F1D1D', accent: '#EF4444', background: '#FFFFFF', text: '#7F1D1D', gradient: ['#DC2626', '#EF4444'], name: 'Classic Red' },
      gold: { primary: '#D4AF37', secondary: '#1d1b16', accent: '#B8860B', background: '#FFFFFF', text: '#1d1b16', gradient: ['#D4AF37', '#B8860B'], name: 'Elegant Gold' }
    };
    
    this.defaultColors = this.colorThemes.modern;
  }

  async generateBeautifulQRCode(tableNumber: string | number, qrUrl: string, options: QRGenerationOptions = {}): Promise<Buffer> {
    try {
      const { width = 800, qrSize = 400, format = 'png', colors = this.defaultColors, theme = 'modern' } = options;
      const colorScheme = theme && this.colorThemes[theme] ? this.colorThemes[theme] : colors;

      const qrCodeBuffer = await QRCode.toBuffer(qrUrl, {
        width: qrSize, margin: 2,
        color: { dark: colorScheme.secondary, light: colorScheme.background },
        errorCorrectionLevel: 'H'
      });

      const svgContent = await this.generateSVGDesign(tableNumber, qrCodeBuffer, colorScheme, width, 1000, qrSize);
      let outputBuffer: Buffer;
      if (format === 'jpeg') {
        outputBuffer = await sharp(Buffer.from(svgContent)).jpeg({ quality: 98 }).toBuffer();
      } else {
        outputBuffer = await sharp(Buffer.from(svgContent)).png({ quality: 98 }).toBuffer();
      }
      return outputBuffer;
    } catch (error) {
      logger.error('Error generating beautiful QR code:', error);
      throw error;
    }
  }

  wrapText(text: string, maxWidth: number, fontSize = 24): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    const charWidth = fontSize * 0.6;
    const maxChars = Math.floor(maxWidth / charWidth);
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length <= maxChars) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  async generateSVGDesign(tableNumber: string | number, qrCodeBuffer: Buffer, colors: ColorTheme, width: number, _height: number, qrSize: number): Promise<string> {
    const qrCodeBase64 = qrCodeBuffer.toString('base64');
    const centerX = width / 2;
    
    let logoBase64 = '';
    try {
      const logoBuffer = await fs.promises.readFile(this.logoPath);
      logoBase64 = logoBuffer.toString('base64');
    } catch {
      logger.info('Logo not found, using text fallback');
    }
    
    const outerPaddingTop = 40; const outerPaddingBottom = 40;
    const outerPaddingLeft = 24; const outerPaddingRight = 24;
    const taglineFontSize = 15; const spacingAfterTagline = 24;
    const qrSizePx = 240; const spacingBelowQR = 24;
    const spacingBelowInstruction = 16;
    const trackingFontSize = 13;
    const tableNumberFontSize = 17; const websiteFontSize = 13;
    const bottomPadding = 20; const borderThickness = 2;
    const cornerRadius = 14; const shadowOpacity = 0.18;
    
    const contentStartY = outerPaddingTop;
    const logoY = contentStartY + 10;
    const logoSize = 180;
    const taglineY = logoY + logoSize + 6;
    
    const taglineText = "Authentic Nepali and Indian Flavours - Served Fresh, Served Warm";
    const maxTextWidth = (width - outerPaddingLeft - outerPaddingRight) * 0.85;
    const wrappedLines = this.wrapText(taglineText, maxTextWidth, taglineFontSize);
    
    const lineHeight = taglineFontSize + 4;
    const totalTaglineHeight = wrappedLines.length * lineHeight;
    const taglineEndY = taglineY + totalTaglineHeight;
    const adjustedQrY = taglineEndY + spacingAfterTagline;
    const buttonY = adjustedQrY + qrSizePx + spacingBelowQR + 24;
    const trackingY = buttonY + 40 + spacingBelowInstruction + 4;
    const tableNumberY = trackingY + trackingFontSize + 24;
    const websiteY = tableNumberY + tableNumberFontSize + 8;
    const bottomY = websiteY + websiteFontSize + bottomPadding;
    const totalHeight = bottomY + outerPaddingBottom;

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
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <rect width="${width}" height="${totalHeight}" fill="#0D1B2A"/>
        <rect x="${outerPaddingLeft}" y="${outerPaddingTop}" width="${width - outerPaddingLeft - outerPaddingRight}" height="${totalHeight - outerPaddingTop - outerPaddingBottom}" fill="#0D1B2A" stroke="#D4AF37" stroke-width="${borderThickness}" rx="${cornerRadius}" ry="${cornerRadius}" filter="url(#shadow)"/>
        ${logoBase64 ? `<image x="${centerX - logoSize/2}" y="${logoY}" width="${logoSize}" height="${logoSize}" href="data:image/png;base64,${logoBase64}"/>` : `<text x="${centerX}" y="${logoY + logoSize/2}" text-anchor="middle" font-family="Playfair Display, serif" font-size="24" font-weight="bold" fill="white">SANGEET</text>`}
        ${taglineElements}
        <rect x="${centerX - qrSizePx/2 - 8}" y="${adjustedQrY - 8}" width="${qrSizePx + 16}" height="${qrSizePx + 16}" fill="#D4AF37" rx="12" ry="12" filter="url(#shadow)"/>
        <image x="${centerX - qrSizePx/2}" y="${adjustedQrY}" width="${qrSizePx}" height="${qrSizePx}" href="data:image/png;base64,${qrCodeBase64}"/>
        <rect x="${centerX - 150}" y="${buttonY}" width="300" height="40" fill="#D4AF37" rx="8" ry="8" filter="url(#shadow)"/>
        <text x="${centerX}" y="${buttonY + 25}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#0D1B2A">SCAN TO VIEW MENU AND ORDER ONLINE</text>
        <text x="${centerX}" y="${trackingY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${trackingFontSize}" fill="#ccc">Track your order: open your camera, scan the QR, start tracking.</text>
        <text x="${centerX}" y="${tableNumberY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${tableNumberFontSize}" font-weight="bold" fill="white">TABLE ${tableNumber}</text>
        <text x="${centerX}" y="${websiteY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${websiteFontSize}" fill="#ccc">www.sangeetrestaurant.com</text>
      </svg>
    `;
  }

  async generateClassicDesign(tableNumber: string | number, qrUrl: string, options: QRGenerationOptions = {}): Promise<Buffer> {
    return await this.generateBeautifulQRCode(tableNumber, qrUrl, { ...options, width: 600, qrSize: 240 });
  }

  async generateLargeDesign(tableNumber: string | number, qrUrl: string, options: QRGenerationOptions = {}): Promise<Buffer> {
    return await this.generateBeautifulQRCode(tableNumber, qrUrl, { ...options, width: 750, qrSize: 300 });
  }

  async generatePremiumDesign(tableNumber: string | number, qrUrl: string, options: QRGenerationOptions = {}): Promise<Buffer> {
    try {
      const { width = 700, qrSize = 280, format = 'png', colors = this.defaultColors, theme = 'modern' } = options;
      const colorScheme = theme && this.colorThemes[theme] ? this.colorThemes[theme] : colors;

      const qrCodeBuffer = await QRCode.toBuffer(qrUrl, {
        width: qrSize, margin: 2,
        color: { dark: colorScheme.secondary, light: colorScheme.background },
        errorCorrectionLevel: 'H'
      });

      const svgContent = this.generatePremiumSVGDesign(tableNumber, qrCodeBuffer, colorScheme, width, 1000, qrSize);
      let outputBuffer: Buffer;
      if (format === 'jpeg') {
        outputBuffer = await sharp(Buffer.from(svgContent)).jpeg({ quality: 98 }).toBuffer();
      } else {
        outputBuffer = await sharp(Buffer.from(svgContent)).png({ quality: 98 }).toBuffer();
      }
      return outputBuffer;
    } catch (error) {
      logger.error('Error generating premium QR code:', error);
      throw error;
    }
  }

  generatePremiumSVGDesign(tableNumber: string | number, qrCodeBuffer: Buffer, _colors: ColorTheme, width: number, height: number, qrSize: number): string {
    const qrCodeBase64 = qrCodeBuffer.toString('base64');
    const centerX = width / 2;
    const padding = 50;
    const contentWidth = width - (padding * 2);
    
    const logoY = padding + 50; const logoSize = 70;
    const headingY = logoY + logoSize + 40;
    const taglineY = headingY + 60;

    const taglineText = "Authentic Nepali and Indian Flavours - Served Fresh, Served Warm";
    const maxTextWidth = contentWidth * 0.85;
    const wrappedLines = this.wrapText(taglineText, maxTextWidth, 20);
    const lineHeight = 26;
    const totalTaglineHeight = wrappedLines.length * lineHeight;
    const taglineEndY = taglineY + totalTaglineHeight;
    const adjustedQrY = taglineEndY + 40;
    const ctaY = adjustedQrY + qrSize + 70;
    const detailsY = ctaY + 65;

    const taglineElements = wrappedLines.map((line, index) => 
      `<text x="${centerX}" y="${taglineY + (index * lineHeight)}" text-anchor="middle" font-family="Georgia, serif" font-size="20" font-style="italic" fill="#D4AF37">${line}</text>`
    ).join('\n        ');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="3" dy="6" stdDeviation="4" flood-color="#000000" flood-opacity="0.4"/>
          </filter>
        </defs>
        <rect width="${width}" height="${height}" fill="#0D1B2A"/>
        <rect x="${padding}" y="${padding}" width="${contentWidth}" height="${height - (padding * 2)}" fill="#0D1B2A" stroke="#D4AF37" stroke-width="3" rx="20" ry="20"/>
        <circle cx="${centerX}" cy="${logoY + logoSize/2}" r="${logoSize/2}" fill="#D4AF37" opacity="0.3"/>
        <text x="${centerX}" y="${logoY + logoSize/2 + 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#D4AF37">LOGO</text>
        <text x="${centerX}" y="${headingY}" text-anchor="middle" font-family="Playfair Display, serif" font-size="40" font-weight="bold" fill="white">SANGEET</text>
        ${taglineElements}
        <rect x="${centerX - qrSize/2 - 12}" y="${adjustedQrY - 12}" width="${qrSize + 24}" height="${qrSize + 24}" fill="#D4AF37" rx="16" ry="16" filter="url(#shadow)"/>
        <image x="${centerX - qrSize/2}" y="${adjustedQrY}" width="${qrSize}" height="${qrSize}" href="data:image/png;base64,${qrCodeBase64}"/>
        <rect x="${centerX - 170}" y="${ctaY - 15}" width="340" height="45" fill="#D4AF37" rx="10" ry="10" filter="url(#shadow)"/>
        <text x="${centerX}" y="${ctaY + 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0D1B2A">SCAN TO VIEW MENU AND ORDER ONLINE</text>
        <text x="${centerX}" y="${detailsY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white">TABLE ${tableNumber}</text>
        <text x="${centerX}" y="${detailsY + 28}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#ccc">www.sangeetrestaurant.com</text>
        <text x="${centerX}" y="${detailsY + 50}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#ccc">Open your camera, scan the QR, start ordering.</text>
      </svg>
    `;
  }

  getAvailableThemes(): { key: string; name: string; primary: string }[] {
    return Object.keys(this.colorThemes).map(key => ({
      key,
      name: this.colorThemes[key].name,
      primary: this.colorThemes[key].primary
    }));
  }
}

export default new BeautifulQRGenerator();
