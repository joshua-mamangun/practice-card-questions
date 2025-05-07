import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
	variable: "--font-poppins",
	subsets: ["latin"],
	weight: ['400', '500'],
});

export const metadata: Metadata = {
	title: "Practice Card Questions",
	description: "Practice Card Questions",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${poppins.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
