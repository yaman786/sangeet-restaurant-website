import logger from './logger';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import type { ColorTheme, QRGenerationOptions } from '../types';

class BeautifulQRGenerator {
  readonly logoPath: string;

  constructor() {
    this.logoPath = path.join(__dirname, '../../public/logo.png');
  }

  async generateBeautifulQRCode(tableNumber: string | number, qrUrl: string, options: QRGenerationOptions = {}): Promise<Buffer> {
    try {
      // 600x750 is the perfect aspect ratio for this design
      const width = 600;
      const height = 760;
      const qrSize = 250;

      const qrCodeBuffer = await QRCode.toBuffer(qrUrl, {
        width: qrSize, margin: 1,
        color: { dark: '#0F172A', light: '#FFFFFF' },
        errorCorrectionLevel: 'H'
      });

      const svgContent = await this.generateSVGDesign(tableNumber, qrCodeBuffer, width, height, qrSize);
      
      // Return raw SVG buffer so browser renders it perfectly with fonts
      return Buffer.from(svgContent);
    } catch (error) {
      logger.error('Error generating beautiful QR code:', error);
      throw error;
    }
  }

  async generateSVGDesign(tableNumber: string | number, qrCodeBuffer: Buffer, width: number, height: number, qrSize: number): Promise<string> {
    const qrCodeBase64 = qrCodeBuffer.toString('base64');
    const centerX = width / 2;
    
    let logoBase64 = '';
    try {
      const logoBuffer = await fs.promises.readFile(this.logoPath);
      logoBase64 = logoBuffer.toString('base64');
    } catch {
      logger.info('Logo not found, using text fallback');
    }
    
    const bgColor = '#111827';
    const goldColor = '#eab308';
    const padding = 24;
    
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,500&amp;family=Inter:wght@400;600;700&amp;display=swap');
          .tagline { font-family: 'Playfair Display', serif; font-size: 20px; font-style: italic; fill: ${goldColor}; }
          .button-text { font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 700; fill: ${bgColor}; }
          .tracking-text { font-family: 'Inter', sans-serif; font-size: 14px; fill: #9ca3af; }
          .table-text { font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 700; fill: #ffffff; }
          .website-text { font-family: 'Inter', sans-serif; font-size: 14px; fill: #9ca3af; }
        </style>
        
        <!-- Background -->
        <rect width="${width}" height="${height}" fill="${bgColor}"/>
        
        <!-- Outer Border -->
        <rect x="${padding}" y="${padding}" width="${width - padding * 2}" height="${height - padding * 2}" 
              fill="${bgColor}" stroke="${goldColor}" stroke-width="2" rx="16" ry="16"/>
        
        <!-- Logo -->
        ${logoBase64 ? 
          `<image x="${centerX - 75}" y="70" width="150" height="75" href="data:image/png;base64,${logoBase64}" preserveAspectRatio="xMidYMid meet"/>` : 
          `<text x="${centerX}" y="120" text-anchor="middle" font-family="Playfair Display, serif" font-size="36" font-weight="bold" fill="#ef4444">Sangeet</text>`
        }
        
        <!-- Tagline -->
        <text x="${centerX}" y="235" text-anchor="middle" class="tagline">Authentic Nepali and Indian Flavours - Served Fresh,</text>
        <text x="${centerX}" y="260" text-anchor="middle" class="tagline">Served Warm</text>
        
        <!-- QR Code Wrapper -->
        <rect x="${centerX - (qrSize/2) - 8}" y="292" width="${qrSize + 16}" height="${qrSize + 16}" fill="${goldColor}" rx="12" ry="12"/>
        
        <!-- QR Code Image -->
        <image x="${centerX - qrSize/2}" y="300" width="${qrSize}" height="${qrSize}" href="data:image/png;base64,${qrCodeBase64}"/>
        
        <!-- Button -->
        <rect x="${centerX - 150}" y="565" width="300" height="40" fill="${goldColor}" rx="8" ry="8"/>
        <text x="${centerX}" y="591" text-anchor="middle" class="button-text">SCAN TO VIEW MENU AND ORDER ONLINE</text>
        
        <!-- Tracking Text -->
        <text x="${centerX}" y="635" text-anchor="middle" class="tracking-text">Track your order: open your camera, scan the QR, start tracking.</text>
        
        <!-- Table Number -->
        <text x="${centerX}" y="675" text-anchor="middle" class="table-text">TABLE ${tableNumber}</text>
        
        <!-- Website -->
        <text x="${centerX}" y="705" text-anchor="middle" class="website-text">www.sangeetrestaurant.com</text>
      </svg>
    `;
  }

  async generateClassicDesign(tableNumber: string | number, qrUrl: string, options: QRGenerationOptions = {}): Promise<Buffer> {
    return await this.generateBeautifulQRCode(tableNumber, qrUrl, options);
  }

  async generateLargeDesign(tableNumber: string | number, qrUrl: string, options: QRGenerationOptions = {}): Promise<Buffer> {
    return await this.generateBeautifulQRCode(tableNumber, qrUrl, options);
  }

  async generatePremiumDesign(tableNumber: string | number, qrUrl: string, options: QRGenerationOptions = {}): Promise<Buffer> {
    return await this.generateBeautifulQRCode(tableNumber, qrUrl, options);
  }

  getAvailableThemes(): { key: string; name: string; primary: string }[] {
    return [
      { key: 'modern', name: 'Modern Blue', primary: '#2563EB' }
    ];
  }
}

export default new BeautifulQRGenerator();
