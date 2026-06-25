export interface StudentFeatures {
    age: number;
    level: number;
    continuous_assessment: number;
    exam_score: number;
    attendance: number;
    study_hours: number;
}

export function decisionTreePredict(features: StudentFeatures): number {
    // Decision Tree logic with node splits
    if (features.exam_score <= 35) {
        if (features.continuous_assessment <= 15) {
            return 0.15; // Leaf 1: High risk
        } else {
            return (features.attendance > 75) ? 0.45 : 0.25; // Leaf 2 & 3
        }
    } else if (features.exam_score <= 50) {
        if (features.study_hours <= 2) {
            return 0.55; // Leaf 4
        } else {
            return 0.70; // Leaf 5
        }
    } else {
        if (features.continuous_assessment <= 25) {
            return 0.80; // Leaf 6
        } else {
            return 0.95; // Leaf 7: Excellent alignment
        }
    }
}

export function randomForestPredict(features: StudentFeatures): number {
    // Random Forest: Ensemble of multiple decision trees
    const tree1 = decisionTreePredict(features);
    
    // Tree 2: Emphasizes Attendance and CA
    const tree2 = features.attendance < 60 
        ? (features.continuous_assessment < 20 ? 0.2 : 0.4)
        : (features.continuous_assessment > 28 ? 0.9 : 0.65);
        
    // Tree 3: Emphasizes Study Hours and Exam Score
    const tree3 = features.study_hours < 3
        ? (features.exam_score < 40 ? 0.3 : 0.6)
        : (features.exam_score >= 50 ? 0.9 : 0.75);

    // Tree 4: Emphasizes Age and Level context
    const tree4 = features.level >= 300 
        ? ((features.exam_score + features.continuous_assessment) > 60 ? 0.85 : 0.45)
        : ((features.attendance + features.study_hours * 5) > 90 ? 0.75 : 0.5);
        
    // Average predictions (Bootstrap Aggregating)
    return (tree1 + tree2 + tree3 + tree4) / 4;
}

export function svmPredict(features: StudentFeatures): number {
    // Support Vector Machine approximation using a linear kernel
    // Weights (w) and bias (b) for the hyperplane
    const w = {
        ca: 0.1,
        exam: 0.08,
        att: 0.03,
        study: 0.20,
        age: -0.02,
        level: 0.002
    };
    const b = -8.5;
    
    // Calculate the decision function z = w·x + b
    const z = (features.continuous_assessment * w.ca) + 
              (features.exam_score * w.exam) + 
              (features.attendance * w.att) + 
              (features.study_hours * w.study) + 
              (features.age * w.age) + 
              (features.level * w.level) + b;
              
    // Apply sigmoid function to map distance to a probability [0, 1]
    return 1 / (1 + Math.exp(-z));
}
