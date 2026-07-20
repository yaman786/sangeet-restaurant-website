/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: { ignoreBuildErrors: false },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            }
        ],
    },
};

export default nextConfig;
