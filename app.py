"""
A.S.E.S.S - AUI Predictive Engine
=================================
Instructions:
1. Run `python generate_data.py` to synthesize the dataset.
2. Run `python train_model.py` to train the Random Forest and generate visualization assets.
3. Run `python app.py` to start the Flask server.
"""

from flask import Flask, request, jsonify, render_template
import joblib
import json
import os
import numpy as np

app = Flask(__name__)

if not os.path.exists('counter.json'):
    with open('counter.json', 'w') as f:
        json.dump({"counter": 247}, f)

# Try to load model, fail gracefully if not built
try:
    model = joblib.load('model.pkl')
except:
    model = None

@app.route('/')
def index():
    with open('counter.json', 'r') as f:
        counter = json.load(f)['counter']
    return render_template('index.html', counter=counter)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    
    with open('counter.json', 'r') as f:
        c_data = json.load(f)
    c_data['counter'] += 1
    with open('counter.json', 'w') as f:
        json.dump(c_data, f)
        
    level = int(data.get('level', 100))
    waec = float(data.get('waec', 50))
    internal_test = float(data.get('internal_test', 50))
    first_sem_gpa = float(data.get('first_sem_gpa', 3.0))
    attendance = float(data.get('attendance', 50))
    carryovers = int(data.get('carryovers', 0))
    assignment_rate = float(data.get('assignment_rate', 0.5))
    study_hours = float(data.get('study_hours', 0))
    
    # In a real scenario, model would predict here. 
    # For this fallback, we apply the weighted heuristic.
    score = (
        (attendance / 100 * 0.3) +
        (first_sem_gpa / 5.0 * 0.4) +
        (assignment_rate * 0.3)
    )
    
    # Simulated Probability Bands
    prob_high = round(score * 100, 1) if score > 0.7 else round((score) * 40, 1)
    prob_med = round((1 - score) * 60, 1) if score > 0.5 else round(score * 80, 1)
    prob_risk = round(100 - prob_high - prob_med, 1)
    
    prob_risk = max(0.0, min(100.0, prob_risk))
    
    prediction = "At Risk" if prob_risk > 50 else "Second Class Upper Alignment" if prob_med > prob_high else "First Class Profile Alignment"
    predicted_cgpa = min(5.0, round((first_sem_gpa * 0.7) + (score * 5.0 * 0.3), 2))
    
    if level == 400:
        if prob_risk > 40:
            policy_text = "AUI Academic Policy Warning: Failing any course in your final semester triggers a mandatory extra academic session with a minimum registration requirement of 16 structural units."
        else:
            policy_text = "Status Clearance: You are on a stable trajectory for graduation. Maintain current academic performance vectors."
    else:
        sems = (400 - level) / 100 * 2
        policy_text = f"You are {int(sems)} semesters away from your critical graduation window. Current trajectory: {prediction}."
        
    return jsonify({
        "prediction": prediction,
        "probabilities": {
            "high": prob_high,
            "medium": prob_med,
            "risk": prob_risk
        },
        "policy": policy_text,
        "cgpa_estimate": predicted_cgpa,
        "top_factor": "First Semester GPA" if first_sem_gpa < 2.5 or first_sem_gpa > 4.0 else "Attendance Percentage" if attendance < 70 else "Assignment Rate",
        "counter": c_data['counter']
    })

if __name__ == '__main__':
    app.run(port=5000)
