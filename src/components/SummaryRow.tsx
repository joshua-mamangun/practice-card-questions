interface SummaryRowProps {
	label: string;
	value: string;
	labelClassName?: string;
};

export default function SummaryRow ({ label, value, labelClassName } : SummaryRowProps) {
	return (
		<div className="flex flex-row gap-6">
			<p className={labelClassName}>{label}:</p>
			<div className="border border-dashed border-gray-400 flex-grow h-0 self-center"></div>
			<p>{value}</p>
		</div>
	);
}