import { JwtPayload } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      optimizedImages?: Record<string, string>;
      imageMetadata?: {
        originalName: string;
        filename: string;
        mediaKey: string;
        sizes: string[];
        directory: string;
      };
    }
  }
}

export {};
