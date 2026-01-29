// server/src/modules/recommendation/similarity.utils.js
export const cosineSimilarity = (vecA, vecB) => {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB || 1);
};

export const normalizeSkills = (skills) =>
  skills.map(skill => {
    if (skill.level === "beginner") return 0.3;
    if (skill.level === "intermediate") return 0.6;
    return 0.9;
  });
