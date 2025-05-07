import { create } from "zustand";
import { persist } from "zustand/middleware";

interface QuestionnaireStore {
	questions: Question[];
	isRandomized: boolean;
	isUsingTimer: boolean;
	timer: number; // in munites;
	isShowAnswer: boolean;
	currentQuestionNo: number;
	lastQuestionNoAnswered: number;
	scores: Scores;
	dateTimeStart?: Date;
	dateTimeEnd?: Date;
	duration: string;
	noOfAltTabbing: number;
	noOfRefreshing: number;
	historyRaw: string[];

	getTimer: () => number;
	getIsUsingTimer: () => boolean;
	getDuration: () => string;
	
	updateQuestions: (value: Question[]) => void;
	setIsRandomized: (value: boolean) => void;
	randomized: () => void;
	updateIsUsingTimer: (value: boolean, timer: number) => void;
	nextQuestion: () => void;
	getCurrentQuestion: () => Question;
	getCurrentQuestionNo: () => number;
	getScores: () => Scores;
	submitAnswer: (answer: number) => void;
	calculateDuration: () => void;
	isLastAnsweredQuestionSameAsCurrent: () => boolean;
	getIsShowAnswer: () => boolean;
	setIsShowAnswer: (value: boolean) => void;
	isDone: () => boolean;
	restart: () => void;
	incrementAltTabbing: () => void;
	incrementRefreshing: () => void;
	addToHistory: () => void;
};

export interface Question {
	category: string;
	question: string;
	choices: {
		label: string;
		isCorrect: boolean;
	}[];
};

export interface Scores {
	correct: number;
	wrong: number;
	total: number;
	categoryScores: CategoryScore[];
};

interface CategoryScore {
	label: string;
	correct: number;
	wrong: number;
	total: number;
};

const useQuestionnaireStore = create<QuestionnaireStore>()(
	persist((set, get) => ({
		questions: [],
		isRandomized: false,
		isUsingTimer: false,
		timer: 0,
		isShowAnswer: false,
		currentQuestionNo: 1,
		lastQuestionNoAnswered: 0,
		scores: {
			correct: 0,
			wrong: 0,
			total: 0,
			categoryScores: []
		},
		dateTimeStart: undefined,
		dateTimeEnd: undefined,
		duration: '',
		noOfAltTabbing: 0,
		noOfRefreshing: 0,
		historyRaw: [],

		getTimer: () => get().timer,
		getIsUsingTimer: () => get().isUsingTimer,
		getDuration: () => get().duration,

		updateQuestions: (value: Question[]) => set({ 
			questions: value, 
			currentQuestionNo: 1,
			isShowAnswer: false,
			lastQuestionNoAnswered: 0,
			scores: { 
				correct: 0,
				wrong: 0,
				total: value.length,
				categoryScores: []
			},
			dateTimeStart: new Date(),
			dateTimeEnd: undefined,
			duration: ''
		}),
		setIsRandomized: (value: boolean) => {
			set({ isRandomized: value });

			if (value === true) {
				get().randomized();
			}
		},
		randomized: () => {
			const tempQuestions = get().questions;
			for (let index = 0; index < tempQuestions.length; index++) {
				const randomIndex = Math.floor(Math.random() * tempQuestions.length - index) + index;

				const tempQuestion = tempQuestions[index];
				tempQuestions[index] = tempQuestions[randomIndex];
				tempQuestions[randomIndex] = tempQuestion;

				// randomized choices
				const tempChoices = tempQuestions[index].choices;
				
				for (let choiceIndex = 0; choiceIndex < tempChoices.length; choiceIndex++) {
					const randomChoiceIndex = Math.floor(Math.random() * tempChoices.length - choiceIndex) + choiceIndex;
					
					const tempChoice = tempChoices[choiceIndex];
					tempChoices[choiceIndex] = tempChoices[randomChoiceIndex];
					tempChoices[randomChoiceIndex] = tempChoice;
				}
			}

			tempQuestions.sort((a, b) => a.category.localeCompare(b.category));

			set({ questions: tempQuestions });
		},
		updateIsUsingTimer: (value: boolean, timer: number) => set({ isUsingTimer: value, timer: timer }),
		nextQuestion: () => {
			if (get().currentQuestionNo + 1 <= get().questions.length) {
				set({ currentQuestionNo: get().currentQuestionNo + 1 });
			}
		},
		getCurrentQuestion: () => {
			const { questions, currentQuestionNo } = get();
			return questions[currentQuestionNo - 1] ?? {} as Question;
		},
		getCurrentQuestionNo: () => get().currentQuestionNo,
		getScores: () => get().scores,

		submitAnswer: (answer: number) => {
			if (get().currentQuestionNo === get().lastQuestionNoAnswered) {
				return;
			}

			const question = get().questions[get().currentQuestionNo - 1];
			const isCorrect = question.choices[answer].isCorrect;

			if (isCorrect) {
				set({ scores: { ...get().scores, correct: get().scores.correct + 1 }});
			} else {
				set({ scores: { ...get().scores, wrong: get().scores.wrong + 1 }});
			}

			// Update category score
			if (!get().scores.categoryScores.some(category => category.label === question.category)) {
				set({
					scores: {
						...get().scores,
						categoryScores: [
							...get().scores.categoryScores,
							{
								label: question.category,
								correct: 0,
								wrong: 0,
								total: 0
							}
						]
					}
				});
			}

			set({
				scores: {
					...get().scores,
					categoryScores: get().scores.categoryScores.map(category => {
						if (category.label !== question.category) {
							return category;
						}

						return {
							...category,
							correct: isCorrect ? category.correct + 1 : category.correct,
							wrong: !isCorrect ? category.correct - 1 : category.wrong,
							total: category.total + 1
						}
					})
				}
			});

			set({ lastQuestionNoAnswered: get().currentQuestionNo });

			// Set end date when the question no is the last item
			if (get().currentQuestionNo === get().questions.length) {
				set({ dateTimeEnd: new Date() });
				get().calculateDuration();
				get().addToHistory();
			}
		},

		calculateDuration: () => {
			const dateStart = get().dateTimeStart;
			const dateEnd = get().dateTimeEnd;

			if (dateStart === undefined || dateEnd === undefined) {
				return;
			}

			const dffMs = dateEnd.getTime() - dateStart.getTime();
			const diffSeconds = Math.floor(dffMs / 1000);
			const hours = Math.floor(diffSeconds / 3600);
			const minutes = Math.floor((diffSeconds % 3600) / 60);
			const seconds = diffSeconds % 60;

			set({ duration: `${hours}h ${minutes}m ${seconds}s` });
		},

		isLastAnsweredQuestionSameAsCurrent: () => get().currentQuestionNo === get().lastQuestionNoAnswered,
		getIsShowAnswer: () => get().isShowAnswer,
		setIsShowAnswer: (value: boolean) => set({ isShowAnswer: value }),
		isDone: () => get().currentQuestionNo === get().questions.length && get().currentQuestionNo === get().lastQuestionNoAnswered,
		restart: () => set({
			currentQuestionNo: 1,
			lastQuestionNoAnswered: 0,
			scores: {
				...get().scores,
				correct: 0,
				wrong: 0,
				categoryScores: [],
			},
			dateTimeStart: new Date(),
			dateTimeEnd: undefined,
			duration: '',
			noOfAltTabbing: 0,
			noOfRefreshing: 0,
		}),

		incrementAltTabbing: () => { set({ noOfAltTabbing: get().noOfAltTabbing + 1 }) },

		incrementRefreshing: () => { set({ noOfRefreshing: get().noOfRefreshing + 1 }) },

		addToHistory: () => {
			const onlyFields = Object.fromEntries(
				Object.entries(get()).filter(params => typeof params[1] !== 'function')
			);
			set({ historyRaw: [...get().historyRaw, JSON.stringify(onlyFields) ]});
		}
	}), {
		name: 'questionnaire-store'
	})
);

export default useQuestionnaireStore;