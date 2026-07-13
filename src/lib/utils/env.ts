export default {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV !== 'production',
  CLIENT_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  EMAIL_USER: process.env.EMAIL_USER,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
};
