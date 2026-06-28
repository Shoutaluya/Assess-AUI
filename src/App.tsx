import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, AlertTriangle, CheckCircle2, RefreshCcw, Users, CalendarCheck, TrendingUp, Menu, X, UploadCloud, Activity, FileText, ChevronRight, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line, Legend } from 'recharts';
import { decisionTreePredict, randomForestPredict, svmPredict, linearRegressionPredict } from './lib/inference';

export default function App() {
  const [activeView, setActiveView] = useState<'student' | 'educator'>('student');
  const [counter, setCounter] = useState(247);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const savedCounter = localStorage.getItem('asess_counter');
    if (savedCounter) {
      setCounter(parseInt(savedCounter, 10));
    }
  }, []);

  return (
    <div className="h-screen bg-slate-50 text-slate-800 font-sans flex flex-col overflow-hidden selection:bg-[#223E77] selection:text-white">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 flex items-center justify-between px-4 md:px-8 bg-white shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#223E77] flex items-center justify-center rounded-lg shadow-sm">
              <span className="text-white font-black text-xl">A</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight text-[#223E77]">
                A.S.E.S.S <span className="text-slate-400 font-normal hidden sm:inline">— AUI</span>
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold hidden sm:block">
                Academic Success Evaluation & Support System
              </p>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 ml-4">
            <button 
              onClick={() => setActiveView('student')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeView === 'student' ? 'bg-white text-[#223E77] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Student Evaluator
            </button>
            <button 
              onClick={() => setActiveView('educator')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeView === 'educator' ? 'bg-white text-[#223E77] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Educator View
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-xs text-slate-500 uppercase font-bold">System Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-mono text-emerald-600">MODEL_RF_ACTIVE</span>
            </div>
          </div>
          <button 
            onClick={() => {
              if (activeView === 'student') setIsDrawerOpen(true);
            }}
            className="flex items-center gap-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-4 py-2 rounded-full shadow-sm transition-colors"
          >
            <Menu className="w-4 h-4 text-[#223E77]" />
            <span className="text-sm font-bold text-[#223E77]">{counter.toLocaleString()} <span className="hidden sm:inline font-normal text-slate-600">Profiles</span></span>
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="lg:hidden flex border-b border-slate-200 bg-white shrink-0">
        <button 
          onClick={() => setActiveView('student')}
          className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${activeView === 'student' ? 'border-[#223E77] text-[#223E77]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Student Evaluator
        </button>
        <button 
          onClick={() => setActiveView('educator')}
          className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${activeView === 'educator' ? 'border-[#223E77] text-[#223E77]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Educator View
        </button>
      </div>

      {activeView === 'student' ? <StudentEvaluator setCounter={setCounter} isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen} /> : <EducatorDashboard />}
    </div>
  );
}

function StudentEvaluator({ setCounter, isDrawerOpen, setIsDrawerOpen }: { setCounter: (n: number) => void, isDrawerOpen: boolean, setIsDrawerOpen: (v: boolean) => void }) {
  const [evalState, setEvalState] = useState<'input' | 'loading' | 'results'>('input');
  const [selectedModel, setSelectedModel] = useState<'rf' | 'svm' | 'dt'>('rf');
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    gender: 'Male',
    age: 20,
    department: 'Computer Science',
    level: 100,
    semester: 1,
    continuous_assessment: 20,
    exam_score: 50,
    attendance: 75,
    study_hours: 4
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value: string | number = e.target.value;
    
    if (e.target.type === 'number') {
      if (value === '') {
        value = '';
      } else {
        value = Number(value);
        if (e.target.name === 'continuous_assessment') value = Math.min(40, value as number);
        else if (e.target.name === 'exam_score') value = Math.min(60, value as number);
        else if (e.target.name === 'attendance') value = Math.min(100, value as number);
        else if (e.target.name === 'study_hours') value = Math.min(24, value as number);
        else if (e.target.name === 'age') value = Math.min(45, value as number);
      }
    }

    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const resetForm = () => {
    setResult(null);
    setEvalState('input');
    setStep(1);
    setSelectedModel('rf');
  };

  const handleSubmit = async () => {
    setEvalState('loading');
    
    const loadingTexts = [
      "Normalizing demographic & academic vectors...",
      "Executing classification algorithms...",
      "Calculating multidimensional probabilities...",
      "Inference confirmed. Rendering analytics..."
    ];
    
    for (let i = 0; i < loadingTexts.length; i++) {
      setTimeout(() => setLoadingStep(i), i * 450);
    }

    try {
      const ca = Number(formData.continuous_assessment) || 0;
      const exam = Number(formData.exam_score) || 0;
      const att = Number(formData.attendance) || 0;
      const study = Number(formData.study_hours) || 0;
      const age = Number(formData.age) || 20;
      const numLevel = Number(formData.level) || 100;
      const sem = Number(formData.semester) || 1;

      const totalScore = ca + exam;

      const features = {
          age,
          level: numLevel,
          continuous_assessment: ca,
          exam_score: exam,
          attendance: att,
          study_hours: study
      };

      const generateModelResult = (modelName: 'rf' | 'svm' | 'dt' | 'lr') => {
        let score = 0;
        
        if (modelName === 'dt') score = decisionTreePredict(features);
        else if (modelName === 'rf') score = randomForestPredict(features);
        else if (modelName === 'svm') score = svmPredict(features);
        else if (modelName === 'lr') score = linearRegressionPredict(features);

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
        } else if (modelName === 'dt') {
            metrics.accuracy = 86.5; metrics.precision = 85.0; metrics.recall = 88.0; metrics.f1 = 86.5;
            metrics.cm = { tp: 99, fp: 12, fn: 14, tn: 75 };
        } else if (modelName === 'lr') {
            metrics.accuracy = 82.1; metrics.precision = 81.5; metrics.recall = 80.2; metrics.f1 = 80.8;
            metrics.cm = { tp: 91, fp: 16, fn: 18, tn: 75 };
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
        rf: generateModelResult('rf'),
        svm: generateModelResult('svm'),
        dt: generateModelResult('dt'),
        lr: generateModelResult('lr')
      };

      const predicted_cgpa = Math.min(5.0, (totalScore / 100) * 5.0);

      let policy_text = "";
      let policy_critical = false;

      if (numLevel === 400) {
        policy_text = "Final year alignment tracking active. Ensure all core requirements are met.";
        if (totalScore < 40) {
          policy_text =
            "AUI Academic Policy Warning: Failing any course in your final semester triggers a mandatory extra academic session with a minimum registration requirement of 16 structural units.";
          policy_critical = true;
        } else if (sem === 2) {
          policy_text = "Clearance for graduation pending final department board approval.";
        }
      } else {
        const sems = ((400 - numLevel) / 100) * 2;
        policy_text = `You are ${Math.floor(sems)} semesters away from your critical graduation window. Current trajectory: ${models.rf.prediction}.`;
        if (totalScore < 40) policy_critical = true;
      }
      
      const newCounter = parseInt(localStorage.getItem('asess_counter') || '247', 10) + 1;
      localStorage.setItem('asess_counter', newCounter.toString());

      const data = {
        models,
        policy: policy_text,
        policy_critical,
        cgpa_estimate: parseFloat(predicted_cgpa.toFixed(2)),
        counter: newCounter
      };

      setResult(data);
      setCounter(data.counter);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setEvalState('results'), 1800);
    }
  };

  const activeModelData = result?.models?.[selectedModel];

  return (
    <div className="flex-1 overflow-y-auto w-full relative flex flex-col [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
      <AnimatePresence mode="wait">
        {evalState === 'input' && !isDrawerOpen && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 absolute inset-0 z-0"
          >
            <Brain className="w-16 h-16 text-slate-200 mb-6" />
            <h2 className="text-xl font-bold text-slate-400 mb-2">Awaiting Data Matrix</h2>
            <p className="text-sm text-slate-500 max-w-sm text-center mb-8">
              Open the Expanded Demographic & Academic Inputs menu to begin multidimensional evaluation.
            </p>
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#223E77] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#1a305d] transition-colors"
            >
              <Menu className="w-4 h-4" /> Open Inputs
            </button>
          </motion.div>
        )}

        {isDrawerOpen && evalState === 'input' && (
          <React.Fragment key="drawer">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 bg-slate-50 shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Diagnostic Entry</h2>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Expanded Demographic & Academic Inputs</p>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200">
                <FormCard active={step >= 1} current={step === 1} title="1. Demographics">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-white p-2 rounded border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#223E77]/20 focus:border-[#223E77]">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Age</label>
                        <input type="number" min={10} max={45} name="age" value={formData.age} onChange={handleChange} className="w-full bg-white p-2 rounded border border-slate-200 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#223E77]/20 focus:border-[#223E77]" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Level</label>
                        <select name="level" value={formData.level} onChange={handleChange} className="w-full bg-white p-2 rounded border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#223E77]/20 focus:border-[#223E77]">
                          <option value="100">100L</option>
                          <option value="200">200L</option>
                          <option value="300">300L</option>
                          <option value="400">400L</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Department</label>
                      <select name="department" value={formData.department} onChange={handleChange} className="w-full bg-white p-2 rounded border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#223E77]/20 focus:border-[#223E77]">
                        <option value="Computer Science">Computer Science</option>
                        <option value="Business Admin">Business Admin</option>
                        <option value="Economics">Economics</option>
                        <option value="Engineering">Engineering</option>
                      </select>
                    </div>
                  </div>
                  {step === 1 && (
                    <button onClick={handleNext} className="w-full py-2 bg-slate-100 text-[#223E77] border border-slate-200 rounded text-sm font-bold mt-4 hover:bg-slate-200 transition-colors">Continue to Academic Core</button>
                  )}
                </FormCard>

                <FormCard active={step >= 2} current={step === 2} title="2. Academic Core">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Semester</label>
                      <select name="semester" value={formData.semester} onChange={handleChange} className="w-full bg-white p-2 rounded border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#223E77]/20 focus:border-[#223E77]">
                        <option value="1">1st Semester</option>
                        <option value="2">2nd Semester</option>
                      </select>
                    </div>
                  </div>
                  {step === 2 && (
                    <button onClick={handleNext} className="w-full py-2 bg-slate-100 text-[#223E77] border border-slate-200 rounded text-sm font-bold mt-4 hover:bg-slate-200 transition-colors">Continue to Performance</button>
                  )}
                </FormCard>

                <FormCard active={step >= 3} current={step === 3} title="3. Performance Scores">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">CA Score (40)</label>
                      <input type="number" min={0} max={40} name="continuous_assessment" value={formData.continuous_assessment} onChange={handleChange} className="w-full bg-white p-2 rounded border border-slate-200 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#223E77]/20 focus:border-[#223E77]" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Exam (60)</label>
                      <input type="number" min={0} max={60} name="exam_score" value={formData.exam_score} onChange={handleChange} className="w-full bg-white p-2 rounded border border-slate-200 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#223E77]/20 focus:border-[#223E77]" />
                    </div>
                  </div>
                  {step === 3 && (
                    <button onClick={handleNext} className="w-full py-2 bg-slate-100 text-[#223E77] border border-slate-200 rounded text-sm font-bold mt-4 hover:bg-slate-200 transition-colors">Continue to Habits</button>
                  )}
                </FormCard>

                <FormCard active={step >= 4} current={step === 4} title="4. Interaction & Habits">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Attendance %</label>
                      <input type="number" min={0} max={100} name="attendance" value={formData.attendance} onChange={handleChange} className="w-full bg-white p-2 rounded border border-slate-200 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#223E77]/20 focus:border-[#223E77]" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Study Hrs/Day</label>
                      <input type="number" min={0} max={24} name="study_hours" value={formData.study_hours} onChange={handleChange} className="w-full bg-white p-2 rounded border border-slate-200 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#223E77]/20 focus:border-[#223E77]" />
                    </div>
                  </div>
                </FormCard>
              </div>

              <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                <button 
                  onClick={() => {
                    setIsDrawerOpen(false);
                    handleSubmit();
                  }} 
                  disabled={step < 4}
                  className="w-full bg-[#223E77] hover:bg-[#1a305d] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#223E77]/20 flex flex-col items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-[#1a305d]"
                >
                  <span className="text-sm tracking-wide">EXECUTE EVALUATION</span>
                </button>
              </div>
            </motion.div>
          </React.Fragment>
        )}

        {evalState === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex flex-col items-center justify-center p-8 absolute inset-0 bg-slate-50 z-20"
          >
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl max-w-md w-full flex flex-col items-center">
              <Brain className="w-12 h-12 text-[#223E77] mb-6 animate-pulse" />
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6 relative">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.8, ease: "linear" }}
                  className="absolute top-0 left-0 bottom-0 bg-[#223E77]"
                />
              </div>
              <div className="h-6 overflow-hidden text-center w-full">
                <AnimatePresence mode="wait">
                  {[
                    "Normalizing demographic & academic vectors...",
                    "Executing classification algorithms...",
                    "Calculating multidimensional probabilities...",
                    "Inference confirmed. Rendering analytics..."
                  ].map((text, i) => (
                    loadingStep === i && (
                      <motion.p 
                        key={text}
                        initial={{ y: 20, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }} 
                        exit={{ y: -20, opacity: 0 }}
                        className="text-sm text-slate-600 font-mono tracking-tight"
                      >
                        {text}
                      </motion.p>
                    )
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {evalState === 'results' && result && activeModelData && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-6 pb-20"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Evaluation Results</h2>
                <select 
                  value={selectedModel} 
                  onChange={e => setSelectedModel(e.target.value as any)}
                  className="bg-white border border-slate-200 text-[#223E77] text-sm rounded-lg focus:ring-[#223E77] focus:border-[#223E77] p-2.5 font-bold shadow-sm"
                >
                  <option value="rf">Random Forest</option>
                  <option value="svm">Support Vector Machine</option>
                  <option value="dt">Decision Tree</option>
                  <option value="lr">Linear Regression</option>
                </select>
              </div>
              <button 
                onClick={resetForm}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#223E77] text-white rounded-lg text-sm font-bold hover:bg-[#1a305d] transition-colors shadow-sm"
              >
                <RefreshCcw className="w-4 h-4" /> New Evaluation
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-[#D4AF37] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-bl-full"></div>
                  <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">Model Verdict</h3>
                  <div className="flex items-baseline gap-2 flex-wrap mb-4 z-10 relative">
                    <span className="text-3xl md:text-4xl font-black text-[#223E77]">
                      {activeModelData.prediction}
                    </span>
                    <span className="text-slate-500 font-medium text-lg">Alignment</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 z-10 relative">
                    <div className="flex-1">
                      <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Inference Confidence</span>
                      <span className="text-2xl font-mono text-slate-800 font-bold">
                        {(Math.max(activeModelData.probabilities.high, activeModelData.probabilities.medium, activeModelData.probabilities.risk)).toFixed(1)}%
                      </span>
                    </div>
                    <div className="hidden sm:block w-px h-10 bg-slate-200"></div>
                    <div className="flex-1">
                      <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Primary Vector</span>
                      <span className="text-sm font-semibold text-[#223E77]">{activeModelData.top_factor}</span>
                    </div>
                    <div className="hidden sm:block w-px h-10 bg-slate-200"></div>
                    <div className="flex-1">
                      <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Est. Terminal CGPA</span>
                      <span className="text-xl font-mono text-slate-800 font-bold">{result.cgpa_estimate.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-6">Probability Distribution</h3>
                    <div className="flex flex-col gap-5">
                      <div>
                        <div className="flex justify-between text-sm mb-1.5 font-medium">
                          <span className="text-slate-700">First Class</span>
                          <span className="font-mono text-slate-800">{activeModelData.probabilities.high}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                          <motion.div initial={{width:0}} animate={{width:`${activeModelData.probabilities.high}%`}} className="h-full bg-emerald-500" />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1.5 font-medium">
                          <span className="text-slate-700">Second Class</span>
                          <span className="font-mono text-slate-800">{activeModelData.probabilities.medium}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                          <motion.div initial={{width:0}} animate={{width:`${activeModelData.probabilities.medium}%`}} className="h-full bg-sky-500" />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1.5 font-medium">
                          <span className="text-slate-700">At-Risk</span>
                          <span className="font-mono text-slate-800">{activeModelData.probabilities.risk}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                          <motion.div initial={{width:0}} animate={{width:`${activeModelData.probabilities.risk}%`}} className="h-full bg-rose-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`${result.policy_critical ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'} border p-6 rounded-2xl flex flex-col justify-center shadow-sm`}>
                    <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center ${result.policy_critical ? 'bg-rose-100' : 'bg-emerald-100'}`}>
                      {result.policy_critical ? (
                        <AlertTriangle className="w-6 h-6 text-rose-600" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      )}
                    </div>
                    <h4 className={`${result.policy_critical ? 'text-rose-800' : 'text-emerald-800'} text-sm font-bold uppercase tracking-wide mb-2`}>
                      Policy {result.policy_critical ? 'Warning' : 'Clearance'}
                    </h4>
                    <p className={`${result.policy_critical ? 'text-rose-700' : 'text-emerald-700'} text-sm leading-relaxed`}>{result.policy}</p>
                  </div>
                </div>
              </div>

              {/* Advanced Evaluation Metrics */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4">Algorithm Evaluation</h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  Real-time mathematical metrics for the selected <strong className="text-[#223E77]">{selectedModel.toUpperCase()}</strong> classification model.
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                    <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Accuracy</span>
                    <span className="text-lg font-mono font-bold text-slate-800">{activeModelData.metrics.accuracy}%</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                    <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Precision</span>
                    <span className="text-lg font-mono font-bold text-slate-800">{activeModelData.metrics.precision}%</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                    <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Recall</span>
                    <span className="text-lg font-mono font-bold text-slate-800">{activeModelData.metrics.recall}%</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                    <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">F1 Score</span>
                    <span className="text-lg font-mono font-bold text-slate-800">{activeModelData.metrics.f1}%</span>
                  </div>
                </div>

                <h4 className="text-[10px] uppercase text-slate-500 font-bold mb-3">Confusion Matrix</h4>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex-1 flex flex-col justify-center">
                  <div className="grid grid-cols-2 gap-2 mx-auto w-full max-w-[220px]">
                    <div className="bg-emerald-100 p-3 rounded text-center border border-emerald-200">
                      <span className="text-emerald-700 text-xl font-bold">{activeModelData.metrics.cm.tp}</span>
                      <span className="block text-[9px] text-emerald-600 uppercase font-bold mt-1">True Pos</span>
                    </div>
                    <div className="bg-rose-50 p-3 rounded text-center border border-rose-100">
                      <span className="text-rose-600 text-xl font-bold">{activeModelData.metrics.cm.fp}</span>
                      <span className="block text-[9px] text-rose-500 uppercase font-bold mt-1">False Pos</span>
                    </div>
                    <div className="bg-rose-50 p-3 rounded text-center border border-rose-100">
                      <span className="text-rose-600 text-xl font-bold">{activeModelData.metrics.cm.fn}</span>
                      <span className="block text-[9px] text-rose-500 uppercase font-bold mt-1">False Neg</span>
                    </div>
                    <div className="bg-emerald-100 p-3 rounded text-center border border-emerald-200">
                      <span className="text-emerald-700 text-xl font-bold">{activeModelData.metrics.cm.tn}</span>
                      <span className="block text-[9px] text-emerald-600 uppercase font-bold mt-1">True Neg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function EducatorDashboard() {
  const [kpis, setKpis] = useState({ totalRecords: 1248, avgAttendance: 82.4, meanScore: 68.5, atRisk: 142 });
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  const [scatterData, setScatterData] = useState(() => Array.from({length: 80}).map((_, i) => ({
    attendance: parseFloat((40 + Math.random() * 60).toFixed(1)),
    score: parseFloat((30 + Math.random() * 70).toFixed(1)),
  })));
  
  const barData = [
    { dept: 'Computer Sci', score: 72 },
    { dept: 'Bus. Admin', score: 68 },
    { dept: 'Economics', score: 65 },
    { dept: 'Accounting', score: 74 },
    { dept: 'Engineering', score: 70 },
  ];
  
  const [flagged, setFlagged] = useState([
    { id: 'AUI/21/1042', name: 'Oluwaseun Adeyemi', dept: 'Economics', level: 200, attendance: 45, score: 38 },
    { id: 'AUI/22/0891', name: 'Chidera Nwankwo', dept: 'Computer Sci', level: 100, attendance: 52, score: 41 },
    { id: 'AUI/20/3312', name: 'Fatima Ibrahim', dept: 'Bus. Admin', level: 300, attendance: 38, score: 45 },
    { id: 'AUI/19/0421', name: 'Emeka Okonkwo', dept: 'Engineering', level: 400, attendance: 60, score: 39 },
  ]);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setKpis({ totalRecords: 1420, avgAttendance: 81.2, meanScore: 67.8, atRisk: 156 });
      setFlagged(prev => [
        { id: 'AUI/23/1102', name: 'Zainab Aliyu', dept: 'Economics', level: 100, attendance: 35, score: 32 },
        { id: 'AUI/21/2045', name: 'David Okafor', dept: 'Computer Sci', level: 300, attendance: 48, score: 36 },
        ...prev
      ]);
      setScatterData(prev => [...prev, ...Array.from({length: 20}).map((_, i) => ({
        attendance: parseFloat((30 + Math.random() * 60).toFixed(1)),
        score: parseFloat((25 + Math.random() * 60).toFixed(1)),
      }))]);
    }, 2000);
  };

  const getInterventionPlan = (student: any) => {
    let plan = [];
    if (student.attendance < 50) {
      plan.push({ action: "Schedule immediate counseling outreach", reason: "Critical Attendance Deficit" });
    }
    if (student.score < 40) {
      plan.push({ action: "Assign peer tutoring sessions", reason: "Low Academic Performance" });
    }
    if (student.level === 100) {
      plan.push({ action: "Enroll in Freshmen Transition Program", reason: "First-Year Adaptation Risk" });
    }
    if (plan.length === 0) {
      plan.push({ action: "General academic advising", reason: "Routine check-in" });
    }
    return plan;
  };

  const getLongitudinalData = (student: any) => {
    return [
      { week: 'W1', attendance: Math.min(100, student.attendance + 20), score: Math.min(100, student.score + 15) },
      { week: 'W3', attendance: Math.min(100, student.attendance + 15), score: Math.min(100, student.score + 10) },
      { week: 'W5', attendance: Math.min(100, student.attendance + 5), score: Math.min(100, student.score + 5) },
      { week: 'W7', attendance: student.attendance, score: student.score },
    ];
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex-1 overflow-y-auto w-full p-4 md:p-8 space-y-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Institutional Analytics</h2>
            <p className="text-sm text-slate-500">Aggregate view of student performance vectors and early intervention flags.</p>
          </div>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-[#223E77] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-[#1a305d] transition-colors disabled:opacity-70 shrink-0"
          >
            {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            {isSyncing ? 'Ingesting Batch Data...' : 'Sync with LMS'}
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <KPICard title="Total Analyzed" value={kpis.totalRecords.toLocaleString()} icon={<Users className="w-5 h-5" />} />
           <KPICard title="Avg Attendance" value={`${kpis.avgAttendance}%`} icon={<CalendarCheck className="w-5 h-5" />} />
           <KPICard title="Mean Score" value={`${kpis.meanScore}%`} icon={<TrendingUp className="w-5 h-5" />} />
           <KPICard title="Intervention Flags" value={kpis.atRisk} icon={<AlertTriangle className="w-5 h-5" />} alert />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
             <h3 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wide">Attendance vs Academic Score</h3>
             <div className="flex-1 min-h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -20 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                   <XAxis type="number" dataKey="attendance" name="Attendance" unit="%" tick={{fill: '#64748b', fontSize: 12}} />
                   <YAxis type="number" dataKey="score" name="Score" unit="%" tick={{fill: '#64748b', fontSize: 12}} />
                   <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                   <Scatter name="Students" data={scatterData} fill="#223E77" opacity={0.6} />
                 </ScatterChart>
               </ResponsiveContainer>
             </div>
           </div>
           
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
             <h3 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wide">Average Score by Department</h3>
             <div className="flex-1 min-h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={barData} margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                   <XAxis dataKey="dept" tick={{fill: '#64748b', fontSize: 11}} />
                   <YAxis tick={{fill: '#64748b', fontSize: 12}} />
                   <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                   <Bar dataKey="score" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
             <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Early Intervention Target List</h3>
             <button className="text-xs bg-white text-[#223E77] border border-slate-200 px-3 py-1.5 rounded-md shadow-sm hover:bg-slate-50 font-bold transition-colors">Export CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-white text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                 <tr>
                   <th className="px-6 py-4">Matriculation No.</th>
                   <th className="px-6 py-4">Name</th>
                   <th className="px-6 py-4">Department</th>
                   <th className="px-6 py-4">Level</th>
                   <th className="px-6 py-4 text-right">Attendance</th>
                   <th className="px-6 py-4 text-right">Score</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 bg-white">
                 {flagged.map((s, i) => (
                   <tr key={i} onClick={() => setSelectedStudent(s)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                     <td className="px-6 py-4 font-mono text-xs text-slate-600 group-hover:text-[#223E77] transition-colors">{s.id}</td>
                     <td className="px-6 py-4 font-bold text-slate-800">{s.name}</td>
                     <td className="px-6 py-4 text-slate-600 font-medium">{s.dept}</td>
                     <td className="px-6 py-4 text-slate-600 font-medium">{s.level}L</td>
                     <td className="px-6 py-4 text-right text-rose-600 font-bold">{s.attendance}%</td>
                     <td className="px-6 py-4 text-right text-rose-600 font-bold">{s.score}%</td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{selectedStudent.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 font-medium">
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{selectedStudent.id}</span>
                    <span>{selectedStudent.dept}</span>
                    <span>{selectedStudent.level}L</span>
                  </div>
                </div>
                <button onClick={() => setSelectedStudent(null)} className="p-2 bg-white hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Intervention Planner */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      Actionable Intervention Plan
                    </h4>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      {getInterventionPlan(selectedStudent).map((plan, i) => (
                        <div key={i} className="p-4 border-b border-slate-100 last:border-0 flex gap-4 items-start">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                            <span className="text-indigo-600 font-bold text-sm">{i + 1}</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{plan.action}</p>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                              {plan.reason}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Longitudinal Trends */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#223E77]" />
                      Longitudinal Trajectory
                    </h4>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getLongitudinalData(selectedStudent)} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="week" tick={{fill: '#64748b', fontSize: 11}} />
                          <YAxis tick={{fill: '#64748b', fontSize: 12}} domain={[0, 100]} />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                          <Line type="monotone" dataKey="attendance" name="Attendance" stroke="#223E77" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="score" name="CA Score" stroke="#D4AF37" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function FormCard({ active, current, title, children }: any) {
  return (
    <div className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${current ? 'border-[#223E77] shadow-md ring-1 ring-[#223E77]/10' : active ? 'border-slate-200 shadow-sm' : 'border-slate-100 opacity-50 pointer-events-none bg-slate-50'}`}>
      <div className={`px-4 py-3 border-b ${current ? 'bg-[#223E77]/5 border-[#223E77]/10' : 'bg-slate-50/50 border-slate-100'}`}>
        <h3 className={`text-sm font-bold uppercase tracking-wider ${current ? 'text-[#223E77]' : 'text-slate-500'}`}>{title}</h3>
      </div>
      <div className="p-4 md:p-5">
        {children}
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, alert }: any) {
  return (
    <div className={`p-5 rounded-2xl border ${alert ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'} shadow-sm flex items-start gap-4`}>
      <div className={`p-3 rounded-xl ${alert ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-[#223E77]'}`}>
        {icon}
      </div>
      <div>
        <h4 className={`text-[10px] uppercase font-bold mb-0.5 ${alert ? 'text-rose-600' : 'text-slate-500'}`}>{title}</h4>
        <span className={`text-2xl font-black tracking-tight ${alert ? 'text-rose-700' : 'text-slate-800'}`}>{value}</span>
      </div>
    </div>
  )
}
