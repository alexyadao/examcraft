import { Exam, EvaluationDetail, CategoryPerformance, EvaluationResult, Question } from '@/types/quiz';

export function evaluateExamAnswers(
  exam: Exam,
  answers: Record<string, string>,
  candidateName: string,
  timeSpentSeconds: number
): EvaluationResult {
  const details: EvaluationDetail[] = [];
  const categoryMap: Record<string, CategoryPerformance> = {};

  let totalPoints = 0;
  let earnedPoints = 0;

  for (const question of exam.questions) {
    const pointsPossible = question.pointWeight || 1;
    totalPoints += pointsPossible;

    const selectedOptionId = answers[question.id] || null;
    const selectedOption = question.options.find((opt) => opt.id === selectedOptionId) || null;
    const correctOption = question.options.find((opt) => opt.isCorrect);

    const isCorrect = selectedOptionId ? selectedOptionId === correctOption?.id : false;
    const pointsEarned = isCorrect ? pointsPossible : 0;
    earnedPoints += pointsEarned;

    // Track category performance
    const cat = question.category || 'General';
    if (!categoryMap[cat]) {
      categoryMap[cat] = {
        category: cat,
        totalPoints: 0,
        earnedPoints: 0,
        percentage: 0,
        questionCount: 0,
        correctCount: 0,
      };
    }

    categoryMap[cat].totalPoints += pointsPossible;
    categoryMap[cat].earnedPoints += pointsEarned;
    categoryMap[cat].questionCount += 1;
    if (isCorrect) {
      categoryMap[cat].correctCount += 1;
    }

    details.push({
      questionId: question.id,
      questionTitle: question.title,
      prompt: question.prompt,
      category: cat,
      difficulty: question.difficulty,
      pointsPossible,
      pointsEarned,
      isCorrect,
      selectedOptionId,
      selectedOptionText: selectedOption ? selectedOption.text : null,
      correctOptionId: correctOption ? correctOption.id : '',
      correctOptionText: correctOption ? correctOption.text : 'No correct option designated',
      explanation: question.explanation || (correctOption?.explanation ?? 'No specific explanation provided.'),
    });
  }

  // Calculate percentages per category
  Object.keys(categoryMap).forEach((cat) => {
    const item = categoryMap[cat];
    item.percentage = item.totalPoints > 0 ? Math.round((item.earnedPoints / item.totalPoints) * 100) : 0;
  });

  const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = scorePercent >= exam.passingScorePercent;
  const submissionId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  return {
    submissionId,
    examId: exam.id,
    examTitle: exam.title,
    candidateName: candidateName.trim() || 'Anonymous Candidate',
    scorePercent,
    totalPoints,
    earnedPoints,
    passed,
    passingScorePercent: exam.passingScorePercent,
    timeSpentSeconds,
    submittedAt: new Date().toISOString(),
    details,
    categoryBreakdown: categoryMap,
  };
}
