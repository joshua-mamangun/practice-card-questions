"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import useQuestionnaireStore, { Question } from "@/stores/useQuestionnaireStore";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function Home() {

	const router = useRouter();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const questionnaire = useQuestionnaireStore();

	// Usually use useForm or Formik
	const uploadRef = useRef<HTMLInputElement | null>(null);
	const [isRandomized, setIsRandomized] = useState<boolean>(true);
	const [timer, setTimer] = useState<number>(60);
	const [isUsingTimer, setIsUsingTimer] = useState<boolean>(true);
	const [isShowCorrectAnswer, setIsSchowCorrectAnswer] = useState<boolean>(true);

	const onUpload = async () => {
		try {
			setIsLoading(true);
			const file = uploadRef.current?.files?.[0];

			if (!file) {
				alert('Please select a file');
				setIsLoading(false);
				return;
			}

			const obj = JSON.parse(await readCSVFile(file));
			await questionnaire.updateQuestions(obj as Question[]);
			await questionnaire.setIsRandomized(isRandomized);
			await questionnaire.updateIsUsingTimer(isUsingTimer, timer);
			await questionnaire.setIsShowAnswer(isShowCorrectAnswer);

			router.push('/question');
		} catch {
			alert('Failed to parse JSON');
			setIsLoading(false);
		} finally {

		}
	}

	const readCSVFile = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
		
			reader.onload = (e) => {
				const text = e.target?.result as string;
				resolve(text);
			};
		
			reader.onerror = (err) => reject(err);
			reader.readAsText(file);
		});
	};

	return (
		<div className="w-full min-h-screen flex flex-col items-center justify-center p-12 gap-12">
			
			<Card className="w-[600px] max-w-full font-poppins">
				<CardHeader>
					<CardTitle>Practice Card Questions</CardTitle>
					<CardDescription>Upload the questionnaire</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4">
						<Input 
							ref={uploadRef}
							type="file" 
							placeholder="File"
							accept=".json"
						/>

						<div className="items-center flex flex-row gap-2">
							<Checkbox 
								id="isRandomized" 
								checked={isRandomized}
								onCheckedChange={(checked) => setIsRandomized(checked === true)}
							/>
							<label htmlFor="isRandomized">
								Randomized questions and choices
							</label>
						</div>

						<div className="items-center flex flex-row gap-2">
							<Checkbox 
								id="isUsingTimer" 
								checked={isUsingTimer}
								onCheckedChange={(checked) => setIsUsingTimer(checked === true)}
							/>
							<label htmlFor="isUsingTimer">
								Use timer per question: 
							</label>

							<Input
								type="number"
								min={5}
								max={3600}
								step={1}
								value={timer}
								className="w-[80px]"
								onChange={(e) => setTimer(Number(e.target?.value))}
							/>

							<p>
								second/s
							</p>
						</div>

						<div className="items-center flex flex-row gap-2">
							<Checkbox 
								id="isShowCorrectAnswer" 
								checked={isShowCorrectAnswer}
								onCheckedChange={(checked) => setIsSchowCorrectAnswer(checked === true)}
							/>
							<label htmlFor="isShowCorrectAnswer">
								Show correct answer
							</label>
						</div>
					</div>
				</CardContent>
				<CardFooter>
					<div className="w-full flex flex-row items-center justify-end">
						<Button 
							className="cursor-pointer"
							disabled={isLoading}
							onClick={() => onUpload()}
						>
							{isLoading && <Loader2 className="animate-spin" />} Continue
						</Button>
					</div>
				</CardFooter>
			</Card>

		</div>
	);
}
