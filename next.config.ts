import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: 'export',
  	basePath: '/practice-card-questions',
  	assetPrefix: '/practice-card-questions/',
	trailingSlash: true,
};

export default nextConfig;
