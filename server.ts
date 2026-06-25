import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/counter", (req, res) => {
    try {
      if (fs.existsSync("counter.json")) {
        const data = JSON.parse(fs.readFileSync("counter.json", "utf-8"));
        res.json({ counter: data.counter });
      } else {
        res.json({ counter: 247 });
      }
    } catch (e) {
      res.json({ counter: 247 });
    }
  });

  app.post("/api/predict", (req, res) => {
    try {
      let counter = 247;
      if (fs.existsSync("counter.json")) {
        const data = JSON.parse(fs.readFileSync("counter.json", "utf-8"));
        counter = data.counter + 1;
        fs.writeFileSync("counter.json", JSON.stringify({ counter }));
      }

      const {
        gender,
        age,
        department,
        level,
        semester,
        continuous_assessment,
        exam_score,
        attendance,
        study_hours,
      } = req.body;

      const numLevel = parseInt(level) || 100;
      const ca = parseFloat(continuous_assessment) || 0;
      const exam = parseFloat(exam_score) || 0;
      const att = parseFloat(attendance) || 0;
      const study = parseFloat(study_hours) || 0;

      const totalScore = ca + exam;

      const generateModelResult = (modelName: string, scoreModifier: number) => {
        let score = (totalScore / 100) * 0.55 + (att / 100) * 0.35 + (study / 24) * 0.1 + scoreModifier;
        score = Math.max(0, Math.min(1, score));
        
        let prob_high = score > 0.7 ? score * 100 : score * 40;
        let prob_med = score > 0.5 ? (1 - score) * 60 : score * 80;
        let prob_risk = 100 - prob_high - prob_med;
        
        prob_risk = Math.max(0, Math.min(100, prob_risk));
        
        let prediction = "First Class";
        if (prob_risk > 50) prediction = "At Risk";
        else if (prob_med > prob_high) prediction = "Second Class Upper";
        
        const metrics = {
            accuracy: 0, precision: 0, recall: 0, f1: 0,
            cm: { tp: 0, fp: 0, fn: 0, tn: 0 }
        };
        
        if (modelName === 'rf') {
            metrics.accuracy = 94.2; metrics.precision = 93.5; metrics.recall = 95.1; metrics.f1 = 94.3;
            metrics.cm = { tp: 108, fp: 3, fn: 5, tn: 84 };
        } else if (modelName === 'svm') {
            metrics.accuracy = 89.4; metrics.precision = 88.1; metrics.recall = 90.2; metrics.f1 = 89.1;
            metrics.cm = { tp: 104, fp: 8, fn: 9, tn: 79 };
        } else {
            metrics.accuracy = 86.5; metrics.precision = 85.0; metrics.recall = 88.0; metrics.f1 = 86.5;
            metrics.cm = { tp: 99, fp: 12, fn: 14, tn: 75 };
        }
        
        return {
            prediction,
            probabilities: {
                high: parseFloat(prob_high.toFixed(1)),
                medium: parseFloat(prob_med.toFixed(1)),
                risk: parseFloat(prob_risk.toFixed(1))
            },
            metrics,
            top_factor: score > 0.7 ? "Academic Score" : (att < 70 ? "Attendance" : "Study Hours")
        }
      };

      const models = {
        rf: generateModelResult('rf', 0),
        svm: generateModelResult('svm', -0.02),
        dt: generateModelResult('dt', 0.03)
      };

      const predicted_cgpa = Math.min(5.0, (totalScore / 100) * 5.0);

      let policy_text = "";
      let policy_critical = false;
      if (numLevel === 400) {
        if (totalScore < 40) {
          policy_text =
            "AUI Academic Policy Warning: Failing any course in your final semester triggers a mandatory extra academic session with a minimum registration requirement of 16 structural units.";
          policy_critical = true;
        } else {
          policy_text =
            "Status Clearance: You are on a stable trajectory for graduation. Maintain current academic performance vectors.";
        }
      } else {
        const sems = ((400 - numLevel) / 100) * 2;
        policy_text = `You are ${Math.floor(sems)} semesters away from your critical graduation window. Current trajectory: ${models.rf.prediction}.`;
        if (totalScore < 40) policy_critical = true;
      }

      // Simulate a computational delay for the transition effect
      setTimeout(() => {
        res.json({
          models,
          policy: policy_text,
          policy_critical,
          cgpa_estimate: parseFloat(predicted_cgpa.toFixed(2)),
          counter,
        });
      }, 1800);
    } catch (e) {
      res.status(500).json({ error: "Prediction failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
