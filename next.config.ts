import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: 'export',
  	basePath: '/practice-card-questions',
	images: {
		unoptimized: true,
	},
};

export default nextConfig;
