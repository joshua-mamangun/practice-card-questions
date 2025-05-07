"use client";
import { useEffect } from "react";

interface UseAltTabbingProps {
	onAltTab: () => void;
};

export default function useAltTabbing({ onAltTab } : UseAltTabbingProps) {
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'hidden') {
				onAltTab();
			}
		};
	  
		document.addEventListener('visibilitychange', handleVisibilityChange);
		
		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, [onAltTab]);
}