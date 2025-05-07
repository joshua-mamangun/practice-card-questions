"use client";
import { useEffect } from "react";

interface UseRefreshingProps {
	onResfresh: () => void;
};

export default function useRefreshing({ onResfresh } : UseRefreshingProps) {
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			onResfresh?.();
			e.preventDefault();
   			e.returnValue = '';
		};
	  
		document.addEventListener('beforeunload', handleBeforeUnload);
		
		return () => {
			document.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [onResfresh]);
}