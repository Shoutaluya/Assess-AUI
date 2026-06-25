import numpy as np
import pandas as pd

def generate_data():
    np.random.seed(42)
    n_students = 500
    
    waec_score = np.random.randint(30, 91, n_students)
    internal_test_score = np.random.randint(20, 101, n_students)
    first_sem_gpa = np.random.uniform(0.0, 5.0, n_students).round(2)
    attendance_pct = np.random.randint(40, 101, n_students)
    carryover_count = np.random.randint(0, 7, n_students)
    assignment_rate = np.random.uniform(0.0, 1.0, n_students).round(2)
    study_hours = np.random.randint(0, 11, n_students)
    student_level = np.random.choice([100, 200, 300, 400], n_students)
    
    # Weighted target logic
    score = (
        (attendance_pct / 100 * 0.3) +
        (first_sem_gpa / 5.0 * 0.4) +
        (assignment_rate * 0.3)
    )
    
    # Add gaussian noise
    noise = np.random.normal(0, 0.1, n_students)
    score += noise
    
    # 0 = At Risk, 1 = Pass/Graduate
    pass_fail = (score > 0.55).astype(int)
    
    df = pd.DataFrame({
        'waec_score': waec_score,
        'internal_test_score': internal_test_score,
        'first_sem_gpa': first_sem_gpa,
        'attendance_pct': attendance_pct,
        'carryover_count': carryover_count,
        'assignment_rate': assignment_rate,
        'study_hours': study_hours,
        'student_level': student_level,
        'pass_fail': pass_fail
    })
    
    df.to_csv('aui_students.csv', index=False)
    print("Synthesized dataset saved to aui_students.csv")

if __name__ == "__main__":
    generate_data()
