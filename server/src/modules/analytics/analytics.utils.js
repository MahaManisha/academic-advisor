export const detectWeaknesses = (attempts) => {
  const weakTopics = {};

  attempts.forEach(a => {
    a.answers.forEach(ans => {
      if (!ans.isCorrect) {
        weakTopics[ans.questionId] =
          (weakTopics[ans.questionId] || 0) + 1;
      }
    });
  });

  return Object.keys(weakTopics).slice(0, 3);
};

export const calculateTrend = (attempts) =>
  attempts.map(a => a.score);
