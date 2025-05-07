import { useRouter } from "next/navigation";
import { Card, CardContent } from "./ui/card";
import useQuestionnaireStore from "@/stores/useQuestionnaireStore";
import { Button } from "./ui/button";

interface ScoreHeaderProps {
	onRestart?: () => void;
	onUploadNewQuestions?: () => void;
};

export  default function ScoreHeader ({ onRestart, onUploadNewQuestions } : ScoreHeaderProps) {

	const router = useRouter();
	const questionnaire = useQuestionnaireStore();

	return (
		<Card className="w-[600px] max-w-full font-poppins">
			<CardContent>

				<div className="flex flex-row gap-4 justify-between flex-wrap items-center">
					<p>Correct: {questionnaire.scores.correct}</p>

					<p>Wrong: {questionnaire.scores.wrong}</p>

					<Button 
						variant="outline"
						className="cursor-pointer"
						onClick={() => { 
							questionnaire.restart();
							onRestart?.();
						}}
					>
						Restart
					</Button>
					
					<Button 
						variant="outline"
						className="cursor-pointer"
						onClick={() => {
							onUploadNewQuestions?.();
							router.push('/');
						}}
					>
						Upload New Questions
					</Button>
					
				</div>
			</CardContent>
		</Card>
	)
};