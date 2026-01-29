// server/src/modules/chatbot/confidence.utils.js
export const calculateConfidence = (responseText) => {
  if (!responseText) return 0;

  const uncertaintyIndicators = [
    "not sure",
    "might be",
    "possibly",
    "I think",
    "uncertain",
    "maybe"
  ];

  let score = 1;

  for (const phrase of uncertaintyIndicators) {
    if (responseText.toLowerCase().includes(phrase)) {
      score -= 0.15;
    }
  }

  return Math.max(score, 0);
};
