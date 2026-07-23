// server/src/modules/career/fuzzyLogic.engine.js

/**
 * Triangular Membership Function μ(x; a, b, c)
 */
const trimf = (x, a, b, c) => {
  if (x <= a || x >= c) return 0.0;
  if (x === b) return 1.0;
  if (x > a && x < b) return (x - a) / (b - a);
  if (x > b && x < c) return (c - x) / (c - b);
  return 0.0;
};

/**
 * Trapezoidal Membership Function μ(x; a, b, c, d)
 */
const trapmf = (x, a, b, c, d) => {
  if (x <= a || x >= d) return 0.0;
  if (x >= b && x <= c) return 1.0;
  if (x > a && x < b) return (x - a) / (b - a);
  if (x > c && x < d) return (d - x) / (d - c);
  return 0.0;
};

/**
 * Fuzzification: Calculate Membership Degrees for Inputs
 */
const fuzzifyInputs = (inputs) => {
  const {
    studyHours = 15,
    codingFrequency = 2, // 0=Never, 1=Rarely, 2=Weekly, 3=3-4x/wk, 4=Daily
    mathConfidence = 5,
    confidenceLevel = 5,
    handsOnVsTheory = 50,
    individualVsTeam = 50
  } = inputs;

  // Study Hours Fuzzification [0..40]
  const studyLow = trapmf(studyHours, -10, 0, 8, 15);
  const studyMed = trimf(studyHours, 10, 20, 30);
  const studyHigh = trapmf(studyHours, 22, 30, 40, 60);

  // Coding Frequency Fuzzification [0..4]
  const codeLow = trapmf(codingFrequency, -1, 0, 1, 2);
  const codeMed = trimf(codingFrequency, 1.5, 2.5, 3.5);
  const codeHigh = trapmf(codingFrequency, 2.8, 3.5, 4, 5);

  // Math Confidence Fuzzification [1..10]
  const mathLow = trapmf(mathConfidence, 0, 1, 3, 5);
  const mathMed = trimf(mathConfidence, 4, 6, 8);
  const mathHigh = trapmf(mathConfidence, 7, 8.5, 10, 11);

  // Confidence Level Fuzzification [1..10]
  const confLow = trapmf(confidenceLevel, 0, 1, 3, 5);
  const confMed = trimf(confidenceLevel, 4, 6, 8);
  const confHigh = trapmf(confidenceLevel, 7, 8.5, 10, 11);

  // HandsOn vs Theory Ratio Fuzzification [0..100] (0=Theory, 100=HandsOn)
  const theoryDegree = trapmf(handsOnVsTheory, -10, 0, 25, 50);
  const balancedDegree = trimf(handsOnVsTheory, 30, 50, 70);
  const handsOnDegree = trapmf(handsOnVsTheory, 50, 75, 100, 110);

  // Individual vs Team Ratio Fuzzification [0..100] (0=Solo, 100=Team)
  const soloDegree = trapmf(individualVsTeam, -10, 0, 25, 50);
  const teamBalancedDegree = trimf(individualVsTeam, 30, 50, 70);
  const teamDegree = trapmf(individualVsTeam, 50, 75, 100, 110);

  return {
    study: { low: studyLow, med: studyMed, high: studyHigh },
    code: { low: codeLow, med: codeMed, high: codeHigh },
    math: { low: mathLow, med: mathMed, high: mathHigh },
    conf: { low: confLow, med: confMed, high: confHigh },
    style: { theory: theoryDegree, balanced: balancedDegree, handsOn: handsOnDegree },
    collab: { solo: soloDegree, balanced: teamBalancedDegree, team: teamDegree }
  };
};

/**
 * Mamdani Rule Base Evaluation & Centroid Defuzzification
 * Computes 5 Output Metrics (0 to 100)
 */
export const evaluateFuzzyLogicEngine = (inputs) => {
  const f = fuzzifyInputs(inputs);
  const { projectInterest = 'Medium', learningMethod = 'Mixed' } = inputs;

  const projIntWeight = projectInterest === 'High' ? 1.0 : projectInterest === 'Medium' ? 0.65 : 0.35;
  const methodFlexWeight = learningMethod === 'Mixed' ? 0.9 : learningMethod === 'Hands-on' ? 0.8 : 0.7;

  // 1. Learning Commitment (Rule Evaluation)
  // R1: IF Study High AND Code High THEN Commitment High (90)
  // R2: IF Study Med AND Code Med THEN Commitment Med (65)
  // R3: IF Study Low OR Code Low THEN Commitment Low (30)
  const commHighFiring = Math.min(f.study.high, f.code.high);
  const commMedFiring = Math.min(f.study.med, f.code.med);
  const commLowFiring = Math.max(f.study.low, f.code.low);

  const commNumerator = (commHighFiring * 90) + (commMedFiring * 65) + (commLowFiring * 30);
  const commDenominator = commHighFiring + commMedFiring + commLowFiring;
  const learningCommitment = commDenominator > 0 ? commNumerator / commDenominator : 60;

  // 2. Programming Readiness (Rule Evaluation)
  // R1: IF Code High AND HandsOn High AND ProjInt High THEN Readiness High (95)
  // R2: IF Code Med AND ProjInt Med THEN Readiness Med (65)
  // R3: IF Code Low THEN Readiness Low (25)
  const progHighFiring = Math.min(f.code.high, f.style.handsOn, projIntWeight);
  const progMedFiring = Math.min(f.code.med, projIntWeight);
  const progLowFiring = f.code.low;

  const progNumerator = (progHighFiring * 95) + (progMedFiring * 65) + (progLowFiring * 25);
  const progDenominator = progHighFiring + progMedFiring + progLowFiring;
  const programmingReadiness = progDenominator > 0 ? progNumerator / progDenominator : 55;

  // 3. Study Consistency (Rule Evaluation)
  // R1: IF Study High AND Code High THEN Consistency High (92)
  // R2: IF Study Med THEN Consistency Med (65)
  // R3: IF Study Low THEN Consistency Low (30)
  const consHighFiring = Math.min(f.study.high, f.code.high);
  const consMedFiring = f.study.med;
  const consLowFiring = f.study.low;

  const consNumerator = (consHighFiring * 92) + (consMedFiring * 65) + (consLowFiring * 30);
  const consDenominator = consHighFiring + consMedFiring + consLowFiring;
  const studyConsistency = consDenominator > 0 ? consNumerator / consDenominator : 60;

  // 4. Learning Flexibility (Rule Evaluation)
  // R1: IF Style Balanced AND Collab Balanced THEN Flexibility High (92)
  // R2: IF Method Mixed THEN Flexibility High (85)
  // R3: IF Extreme Theory OR Extreme Solo THEN Flexibility Med (50)
  const flexHighFiring = Math.max(Math.min(f.style.balanced, f.collab.balanced), methodFlexWeight);
  const flexMedFiring = Math.max(f.style.theory, f.collab.solo);

  const flexNumerator = (flexHighFiring * 90) + (flexMedFiring * 50);
  const flexDenominator = flexHighFiring + flexMedFiring;
  const learningFlexibility = flexDenominator > 0 ? flexNumerator / flexDenominator : 70;

  // 5. Analytical Readiness (Rule Evaluation)
  // R1: IF Math High AND Conf High THEN Analytical High (95)
  // R2: IF Math Med AND Conf Med THEN Analytical Med (65)
  // R3: IF Math Low THEN Analytical Low (30)
  const mathHighFiring = Math.min(f.math.high, f.conf.high);
  const mathMedFiring = Math.min(f.math.med, f.conf.med);
  const mathLowFiring = f.math.low;

  const mathNumerator = (mathHighFiring * 95) + (mathMedFiring * 65) + (mathLowFiring * 30);
  const mathDenominator = mathHighFiring + mathMedFiring + mathLowFiring;
  const analyticalReadiness = mathDenominator > 0 ? mathNumerator / mathDenominator : 60;

  return {
    learningCommitment: Number(learningCommitment.toFixed(1)),
    programmingReadiness: Number(programmingReadiness.toFixed(1)),
    studyConsistency: Number(studyConsistency.toFixed(1)),
    learningFlexibility: Number(learningFlexibility.toFixed(1)),
    analyticalReadiness: Number(analyticalReadiness.toFixed(1))
  };
};
