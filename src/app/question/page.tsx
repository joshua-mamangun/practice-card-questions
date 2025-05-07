"use client";
import ScoreHeader from "@/components/ScoreHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useAltTabbing from "@/hooks/useAltTabbing";
import useQuestionnaireStore from "@/stores/useQuestionnaireStore";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Data {
	category: string;
	itemNo: number;
	question: string;
	choices: {
		label: string;
		isCorrect: boolean;
	}[];
	scores: {
		correct: number;
		wrong: number;
	};
};

export default function Question() {

	const router = useRouter();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [answer, setAnswer] = useState<string>('option-0');
	const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
	const { getCurrentQuestion, nextQuestion, getCurrentQuestionNo, getScores, submitAnswer, isLastAnsweredQuestionSameAsCurrent, getIsShowAnswer, isDone } = useQuestionnaireStore();
	const questionnaire = useQuestionnaireStore();
	const [timerSeconds, setTimerSeconds] = useState<number>(0);
	const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
	const [timesUp, setTimesUp] = useState<boolean>(false);
	
	useAltTabbing({
		onAltTab: () => { questionnaire.incrementAltTabbing() }
	});

	const [data, setData] = useState<Data>({
		category: '#',
		itemNo: -1, 
		question: 'Question',
		choices: [],
		scores: {
			correct: 0,
			wrong: 0,
		}
	});

	const clearTimer = () => {
		if (timerInterval) {
			clearInterval(timerInterval);
			setTimerInterval(null);
		}
	};

	const onSubmit = () => {
		try {
			setIsLoading(true);
			submitAnswer(Number(answer.replace('option-', '')));
			updateScores();
			setIsSubmitted(true);
			clearTimer();

			if (!getIsShowAnswer()) {
				onNext();
				return;
			}
		} catch {
		
		} finally {
			setIsLoading(false);
		}
	};

	const onNext = () => {
		try {
			setIsLoading(true);
			nextQuestion();
			setQuestion();
			setIsSubmitted(false);
			setTimer();

			if (isDone()) {
				router.push('/summary');
				return;
			} 
		} catch {

		} finally {
			setIsLoading(false);
		}
	};

	const updateScores = () => {
		const scores = getScores();

		setData({
			...data,
			scores: {
				correct: scores.correct,
				wrong: scores.wrong
			},
		});
	};

	const setQuestion = () => {
		const temp = getCurrentQuestion();
		const scores = getScores();

		setData({
			...data,
			category: temp.category,
			itemNo: getCurrentQuestionNo(),
			question: temp.question,
			choices: temp.choices,
			scores: {
				correct: scores.correct,
				wrong: scores.wrong
			},
		});
		setAnswer('option-0');
	};

	const setTimer = async () => {
		if (!questionnaire.getIsUsingTimer()) {
			return;
		}

		if (questionnaire.isLastAnsweredQuestionSameAsCurrent()) {
			return;
		}

		setTimesUp(false);
		clearTimer();
		setTimerSeconds(questionnaire.getTimer());

		const interval = setInterval(() => {
			setTimerSeconds(prev => {
				if (prev <= 1) {
					clearTimer();
					setTimesUp(true);
					return 0;
				} else {
					return prev - 1;
				}
			});
		}, 1000);
		setTimerInterval(interval);

		return () => clearTimer();
	};

	useEffect(() => {
		setQuestion();
		setIsSubmitted(isLastAnsweredQuestionSameAsCurrent());

		if (!timerInterval) {
			setTimer();
		}
	},[]);

	useEffect(() => {
		if (timesUp) {
			onSubmit();
		}
	}, [timesUp]);

	return (
		<div className="w-full min-h-screen flex flex-col items-center justify-center p-12 gap-12">

			<ScoreHeader
				onRestart={() => {
					setQuestion();
					setIsSubmitted(false);
					setTimer();
				}}
				onUploadNewQuestions={() => {
					clearTimer();
				}}
			/>
			
			{data.itemNo > 0 && (
				<Card className="w-[600px] max-w-full font-poppins">
					<CardHeader>
						<div className="flex flex-row items-center justify-between">
							<CardTitle className="flex-grow">{data.category} ({data.itemNo}/{getScores().total})</CardTitle>

							{questionnaire.getIsUsingTimer() && (
								<p>
									{timerSeconds}s
								</p>
							)}
						</div>
					</CardHeader>
					<CardContent>
						<p className="text-base">
							{data.question}
						</p>

						<RadioGroup
							defaultValue="option-0"
							className="pt-6 gap-1"
							value={answer}
							onValueChange={(value) => setAnswer(value)}
						>
							{data.choices.map((choice, key) => (
								<div 
									key={key}
									className={`flex flex-row gap-2 p-2 items-center
										${isSubmitted && getIsShowAnswer() && answer === `option-${key}` && !choice.isCorrect ? ' bg-red-400' : ''}
										${isSubmitted && getIsShowAnswer() && choice.isCorrect ? ' bg-green-400' : ''}
									`}
								>
									<RadioGroupItem 
										id={`option-${key}`}
										value={`option-${key}`} 
										className="cursor-pointer"
									/>
									<Label 
										htmlFor={`opiton-${key}`}
										className="!text-base font-normal"
									>
										{choice.label}
									</Label>
								</div>
							))}
						</RadioGroup>

					</CardContent>
					<CardFooter>
						<div className="w-full flex flex-row items-center justify-end">
							{!isSubmitted && (
								<Button 
									disabled={isLoading}
									className="cursor-pointer"
									onClick={() => onSubmit()}
								>
									{isLoading && <Loader2 className="animate-spin" />} Submit
								</Button>
							)}

							{isSubmitted && (
								<Button 
									disabled={isLoading}
									className="cursor-pointer"
									onClick={() => onNext()}
								>
									{isLoading && <Loader2 className="animate-spin" />} Next
								</Button>
							)}
						</div>
					</CardFooter>
				</Card>
			)}

		</div>
	);
}
