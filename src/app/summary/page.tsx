"use client";
import ScoreHeader from "@/components/ScoreHeader";
import SummaryRow from "@/components/SummaryRow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import useQuestionnaireStore from "@/stores/useQuestionnaireStore";
import { useRouter } from "next/navigation";

export default function Summary() {

	const router = useRouter();
	const questionnaire = useQuestionnaireStore();

	const onComplete = () => {
		// clear zustand
		router.push('/');
	}

	return (
		<div className="w-full min-h-screen flex flex-col items-center justify-center p-12 gap-12">

			<ScoreHeader
				onRestart={() => router.push('/question')}
			/>

			<Card className="w-[600px] max-w-full font-poppins">
				<CardHeader>
					<CardTitle>Summary</CardTitle>
				</CardHeader>
				<CardContent>
					<div>
						<SummaryRow
							label={'Total Score'}
							value={questionnaire.scores.correct + '/' + questionnaire.scores.total}
							labelClassName="font-bold"
						/>

						<SummaryRow
							label={'Percentage Score'}
							value={((questionnaire.scores.correct / questionnaire.scores.total) * 100).toFixed(2) + '%'}
						/>

						<SummaryRow
							label={'Duration'}
							value={questionnaire.duration ?? 'N/A'}
						/>

						<SummaryRow
							label={'# of Alt Tabbing (cheating)'}
							value={String(questionnaire.noOfAltTabbing)}
						/>

						{/* <SummaryRow
							label={'# of Refreshing Page to restart the timer (cheating)'}
							value={String(questionnaire.noOfRefreshing)}
						/> */}

						<br />

						{questionnaire.scores.categoryScores.map((category, key) => (
							<SummaryRow
								key={key}
								label={category.label}
								value={category.correct + '/' + category.total}
							/>
						))}
					</div>

				</CardContent>
				<CardFooter>
					<div className="w-full flex flex-row items-center justify-end">
						<Button 
							className="cursor-pointer"
							onClick={() => onComplete()}
						>
							Complete
						</Button>
					</div>
				</CardFooter>
			</Card>

		</div>
	);
}
