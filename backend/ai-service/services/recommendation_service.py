"""
Smart Health Recommendation Service
====================================
ML-based heart disease risk prediction using the Framingham Heart Study model.

Features:
- 10-year CHD risk prediction
- Personalized health recommendations based on risk factors
- Feature engineering for enhanced predictions
- Optimal threshold-based classification
"""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import joblib
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin

logger = logging.getLogger(__name__)


class FeatureEngineeringTransformer(BaseEstimator, TransformerMixin):
    """Custom transformer for Framingham feature engineering.

    Creates 14 derived features from the 15 original Framingham features (29 total):
    Continuous:
    - pulse_pressure: sysBP - diaBP
    - mean_arterial_pressure: diaBP + (pulse_pressure / 3)
    - age_sysBP: age * sysBP interaction
    - chol_age: cholesterol * age interaction
    - bmi_age: BMI * age interaction
    - smoking_intensity: currentSmoker * cigsPerDay
    - glucose_diabetes: glucose * diabetes interaction
    - age_male_interaction: age * male / 100  (sex-age composite risk)
    - framingham_score: simplified clinical risk score
    Binary:
    - bp_risk: stage-2 hypertension (sysBP≥140 OR diaBP≥90)
    - chol_risk: high cholesterol (totChol≥240)
    - high_risk_combo: age≥50 AND stage-2 HTN AND (smoker OR diabetic)
    - hr_risk: abnormal heart rate (<60 brady OR >100 tachy)
    - isolated_systolic_htn: sysBP≥140 AND diaBP<90 (arterial stiffness)
    """
    
    def __init__(self):
        self.feature_names_out_ = None
    
    def fit(self, X, y=None):
        return self
    
    def transform(self, X):
        """Transform input features by adding engineered features."""
        if isinstance(X, pd.DataFrame):
            df = X.copy()
        else:
            df = pd.DataFrame(X, columns=self._get_input_features())
        
        # Continuous derived features
        df['pulse_pressure'] = df['sysBP'] - df['diaBP']
        df['mean_arterial_pressure'] = df['diaBP'] + (df['pulse_pressure'] / 3)
        df['age_sysBP'] = df['age'] * df['sysBP'] / 100
        df['chol_age'] = df['totChol'] * df['age'] / 100
        df['bmi_age'] = df['BMI'] * df['age'] / 100
        
        # Interaction features
        df['smoking_intensity'] = df['currentSmoker'] * df['cigsPerDay']
        df['glucose_diabetes'] = df['glucose'] * df['diabetes']
        # Sex-age composite: men have sharply higher CHD risk before age 55
        df['age_male_interaction'] = df['age'] * df['male'] / 100

        # Risk indicator features
        df['bp_risk'] = ((df['sysBP'] >= 140) | (df['diaBP'] >= 90)).astype(int)
        df['chol_risk'] = (df['totChol'] >= 240).astype(int)
        df['high_risk_combo'] = (
            (df['age'] >= 50) &
            (df['sysBP'] >= 140) &
            ((df['currentSmoker'] == 1) | (df['diabetes'] == 1))
        ).astype(int)
        # Abnormal heart rate: bradycardia (<60) or tachycardia (>100) both
        # increase cardiac event risk independently of other Framingham factors
        df['hr_risk'] = ((df['heartRate'] < 60) | (df['heartRate'] > 100)).astype(int)
        # Isolated systolic hypertension: marker of arterial stiffness (common in elderly)
        # associated with increased cardiac and stroke risk even when diastolic is normal
        df['isolated_systolic_htn'] = (
            (df['sysBP'] >= 140) & (df['diaBP'] < 90)
        ).astype(int)

        # Simplified Framingham risk score
        df['framingham_score'] = (
            df['age'] * 0.5 +
            df['male'] * 3 +
            df['sysBP'] * 0.1 +
            df['currentSmoker'] * 4 +
            df['totChol'] * 0.01 +
            df['diabetes'] * 3
        )
        
        self.feature_names_out_ = list(df.columns)
        return df
    
    def _get_input_features(self):
        """Return the expected input feature names in order."""
        return [
            'male', 'age', 'education', 'currentSmoker', 'cigsPerDay',
            'BPMeds', 'prevalentStroke', 'prevalentHyp', 'diabetes',
            'totChol', 'sysBP', 'diaBP', 'BMI', 'heartRate', 'glucose'
        ]
    
    def get_feature_names_out(self, input_features=None):
        return self.feature_names_out_


class RecommendationService:
    """Service for ML-based heart disease risk prediction and recommendations."""

    # Expected input features for Framingham dataset
    FRAMINGHAM_FEATURES = [
        'male', 'age', 'education', 'currentSmoker', 'cigsPerDay',
        'BPMeds', 'prevalentStroke', 'prevalentHyp', 'diabetes',
        'totChol', 'sysBP', 'diaBP', 'BMI', 'heartRate', 'glucose'
    ]

    # Risk thresholds for display labels (applied to raw probability)
    RISK_THRESHOLDS = {
        'low': 0.20,
        'moderate': 0.50,
        'high': 0.70,
        'very_high': 0.85
    }

    # Clinical screening threshold: overrides the model's accuracy-optimised threshold
    # when the model's sensitivity is dangerously low (< 40%).
    # Accuracy-optimised thresholds (e.g. 0.718) can give <15% sensitivity —
    # meaning 85%+ of true CHD-risk patients are missed, which is clinically unsafe.
    # Youden's-J-based retraining is the permanent fix; this override protects patients
    # until the model is retrained.
    CLINICAL_SENSITIVITY_THRESHOLD = 0.35
    MIN_ACCEPTABLE_SENSITIVITY = 0.40
    
    def __init__(self):
        """Initialize the recommendation service."""
        self.model = None
        self.preprocessor = None
        self.feature_engineer = None
        self.metadata = {}
        self.feature_names = []
        self.model_type = 'Unknown'
        self.threshold = 0.5  # Default, will be loaded from model
        self.dataset = 'framingham'
        
        self._load_model()
        logger.info("RecommendationService initialized successfully")
    
    def _load_model(self) -> None:
        """Load the trained model and metadata."""
        model_path = Path(__file__).parent.parent / "models" / "recommendation_model.pkl"
        metadata_path = Path(__file__).parent.parent / "models" / "recommendation_metadata.json"
        
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found at {model_path}")
        
        try:
            # Load the model (dict format)
            model_data = joblib.load(model_path)
            
            # Handle both old (Pipeline) and new (dict) formats
            if isinstance(model_data, dict):
                # New dict format
                self.feature_engineer = model_data.get('feature_engineer')
                self.preprocessor = model_data.get('preprocessor')
                self.model = model_data.get('model')
                self.model_type = model_data.get('model_type', 'Unknown')
                self.threshold = model_data.get('threshold', 0.5)
                self.dataset = model_data.get('dataset', 'framingham')
                
                # If feature_engineer not in pickle, create locally
                if self.feature_engineer is None:
                    self.feature_engineer = FeatureEngineeringTransformer()

                logger.info(f"Model loaded (dict format): {self.model_type}, dataset={self.dataset}")
                logger.info(f"Model threshold from training: {self.threshold:.3f}")
            else:
                # Old Pipeline format - use as-is (backwards compatibility)
                self.model = model_data
                self.feature_engineer = FeatureEngineeringTransformer()
                self.preprocessor = None
                self.model_type = 'Legacy Pipeline'
                self.dataset = 'unknown'
                logger.info("Model loaded (legacy pipeline format)")
            
            logger.info(f"Model loaded from {model_path}")

            # Load metadata
            if metadata_path.exists():
                with open(metadata_path, 'r') as f:
                    self.metadata = json.load(f)
                self.feature_names = self.metadata.get('feature_names', [])
                logger.info(f"Model type: {self.metadata.get('model_type', 'Unknown')}")
                logger.info(f"Model accuracy: {self.metadata.get('test_accuracy', 0)*100:.2f}%")

                # Apply clinical sensitivity override when model threshold is too conservative
                model_sensitivity = self.metadata.get('sensitivity', 1.0)
                if model_sensitivity < self.MIN_ACCEPTABLE_SENSITIVITY:
                    logger.warning(
                        "Model sensitivity is %.1f%% at threshold %.3f — "
                        "applying clinical override threshold %.2f to improve screening safety. "
                        "Retrain with Youden's-J optimisation for a permanent fix.",
                        model_sensitivity * 100,
                        self.threshold,
                        self.CLINICAL_SENSITIVITY_THRESHOLD,
                    )
                    self.threshold = self.CLINICAL_SENSITIVITY_THRESHOLD
                else:
                    logger.info(f"Model sensitivity {model_sensitivity*100:.1f}% is acceptable — keeping model threshold {self.threshold:.3f}")
            else:
                self.metadata = {}
                self.feature_names = []
                logger.warning("Metadata file not found, using defaults")
                
        except FileNotFoundError:
            raise
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise
    
    def _validate_input(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and prepare input data for Framingham model."""
        validated = {}
        
        for feature in self.FRAMINGHAM_FEATURES:
            if feature not in patient_data:
                raise ValueError(f"Missing required feature: {feature}")
            
            value = patient_data[feature]
            
            # Type conversion
            if feature in ['male', 'currentSmoker', 'BPMeds', 'prevalentStroke', 
                          'prevalentHyp', 'diabetes']:
                validated[feature] = int(value)
            elif feature == 'education':
                validated[feature] = int(value)
            else:
                validated[feature] = float(value)
        
        # Validation ranges
        if not 20 <= validated['age'] <= 100:
            logger.warning(f"Age {validated['age']} outside typical range [20, 100]")
        
        if not 80 <= validated['sysBP'] <= 250:
            logger.warning(f"Systolic BP {validated['sysBP']} outside typical range [80, 250]")
        
        if not 40 <= validated['diaBP'] <= 150:
            logger.warning(f"Diastolic BP {validated['diaBP']} outside typical range [40, 150]")
        
        if not 100 <= validated['totChol'] <= 500:
            logger.warning(f"Total cholesterol {validated['totChol']} outside typical range [100, 500]")
        
        if not 10 <= validated['BMI'] <= 60:
            logger.warning(f"BMI {validated['BMI']} outside typical range [10, 60]")
        
        if not 30 <= validated['glucose'] <= 400:
            logger.warning(f"Glucose {validated['glucose']} outside typical range [30, 400]")
        
        return validated
    
    def _identify_risk_factors(self, patient_data: Dict[str, Any]) -> List[str]:
        """Identify key risk factors from patient data."""
        risk_factors = []
        
        # Age risk
        if patient_data['age'] >= 55:
            risk_factors.append('advanced_age')
        
        # Blood pressure
        if patient_data['sysBP'] >= 140:
            risk_factors.append('high_systolic_bp')
        if patient_data['diaBP'] >= 90:
            risk_factors.append('high_diastolic_bp')
        
        # Cholesterol
        if patient_data['totChol'] >= 240:
            risk_factors.append('elevated_cholesterol')
        
        # Smoking
        if patient_data['currentSmoker'] == 1:
            risk_factors.append('current_smoker')
            if patient_data['cigsPerDay'] >= 20:
                risk_factors.append('heavy_smoker')
        
        # BMI
        if patient_data['BMI'] >= 30:
            risk_factors.append('obesity')
        elif patient_data['BMI'] >= 25:
            risk_factors.append('overweight')
        
        # Diabetes
        if patient_data['diabetes'] == 1:
            risk_factors.append('diabetes')
        elif patient_data['glucose'] >= 100:
            risk_factors.append('prediabetes')
        
        # Hypertension
        if patient_data['prevalentHyp'] == 1:
            risk_factors.append('hypertension')
        
        # Prior stroke
        if patient_data['prevalentStroke'] == 1:
            risk_factors.append('prior_stroke')
        
        # BP medications
        if patient_data['BPMeds'] == 1:
            risk_factors.append('on_bp_medication')

        # Gender
        if patient_data['male'] == 1:
            risk_factors.append('male_gender')

        # Abnormal heart rate (bradycardia or tachycardia)
        hr = patient_data['heartRate']
        if hr < 60:
            risk_factors.append('bradycardia')
        elif hr > 100:
            risk_factors.append('tachycardia')

        # Isolated systolic hypertension (arterial stiffness marker)
        if patient_data['sysBP'] >= 140 and patient_data['diaBP'] < 90:
            risk_factors.append('isolated_systolic_htn')

        return risk_factors
    
    def _generate_recommendations(self, patient_data: Dict[str, Any], 
                                   risk_factors: List[str], 
                                   risk_level: str,
                                   risk_score: float) -> List[Dict[str, str]]:
        """Generate personalized recommendations based on risk assessment."""
        recommendations = []
        
        # High priority recommendations for elevated risk
        if risk_level in ['high', 'very_high']:
            recommendations.append({
                'category': 'medical',
                'priority': 'urgent',
                'message': f"Based on your clinical profile, your 10-year CHD risk score is high ({risk_score*100:.0f}%). "
                          "Immediate cardiology referral is strongly recommended for comprehensive evaluation "
                          "including stress testing and possible coronary angiography."
            })
        
        # Smoking cessation
        if 'current_smoker' in risk_factors:
            recommendations.append({
                'category': 'lifestyle',
                'priority': 'urgent',
                'message': "Smoking significantly increases your cardiovascular risk. Consider smoking cessation "
                          "programs, nicotine replacement therapy, or medications. Quitting smoking can reduce "
                          "your heart disease risk by 50% within 1 year."
            })
        
        # Blood pressure management
        if 'high_systolic_bp' in risk_factors or 'high_diastolic_bp' in risk_factors:
            recommendations.append({
                'category': 'lifestyle',
                'priority': 'high',
                'message': f"Your systolic blood pressure ({patient_data['sysBP']} mmHg) is elevated. "
                          "Reduce sodium intake to <2300mg/day, maintain healthy weight, exercise regularly, "
                          "and consult your doctor about antihypertensive therapy."
            })
        
        # Cholesterol management
        if 'elevated_cholesterol' in risk_factors:
            recommendations.append({
                'category': 'lifestyle',
                'priority': 'high',
                'message': f"Your total cholesterol ({patient_data['totChol']} mg/dL) is elevated. "
                          "Follow a heart-healthy diet low in saturated fats, increase fiber intake, "
                          "consider omega-3 supplements, and discuss statin therapy with your doctor."
            })
        
        # Weight management
        if 'obesity' in risk_factors:
            recommendations.append({
                'category': 'lifestyle',
                'priority': 'high',
                'message': f"Your BMI ({patient_data['BMI']}) indicates Class I obesity. "
                          "Weight loss through caloric restriction and increased physical activity can "
                          "significantly reduce cardiovascular risk. Consider consulting a nutritionist."
            })
        elif 'overweight' in risk_factors:
            recommendations.append({
                'category': 'lifestyle',
                'priority': 'moderate',
                'message': f"Your BMI ({patient_data['BMI']}) indicates overweight status. "
                          "Gradual weight loss of 5-10% can improve cardiovascular health. Focus on "
                          "portion control and regular physical activity."
            })
        
        # Diabetes management
        if 'diabetes' in risk_factors:
            recommendations.append({
                'category': 'medical',
                'priority': 'high',
                'message': "Diabetes significantly increases cardiovascular risk. Maintain strict glycemic control "
                          "(HbA1c <7%), regular monitoring, and follow diabetic medication regimen. Annual eye, "
                          "kidney, and foot exams are essential."
            })
        elif 'prediabetes' in risk_factors:
            recommendations.append({
                'category': 'medical',
                'priority': 'moderate',
                'message': f"Your fasting glucose ({patient_data['glucose']} mg/dL) indicates prediabetes. "
                          "Lifestyle modifications can prevent progression to type 2 diabetes."
            })
        
        # Hypertension follow-up
        if 'hypertension' in risk_factors:
            recommendations.append({
                'category': 'medical',
                'priority': 'high',
                'message': "You have a history of hypertension. Ensure regular blood pressure monitoring, "
                          "medication adherence, sodium restriction (<2000mg/day), and regular cardiology follow-up."
            })
        
        # Prior stroke
        if 'prior_stroke' in risk_factors:
            recommendations.append({
                'category': 'medical',
                'priority': 'urgent',
                'message': "History of stroke significantly increases future cardiovascular event risk. "
                          "Strict secondary prevention measures including antiplatelet therapy, statin therapy, "
                          "and blood pressure control are essential."
            })
        
        # Abnormal heart rate
        if 'tachycardia' in risk_factors:
            recommendations.append({
                'category': 'medical',
                'priority': 'high',
                'message': (
                    f"Your resting heart rate ({patient_data['heartRate']:.0f} bpm) is elevated (>100 bpm — tachycardia). "
                    "Persistent tachycardia increases cardiac workload and is associated with higher CHD risk. "
                    "An ECG and thyroid function test are recommended. Avoid stimulants and review medications."
                )
            })
        elif 'bradycardia' in risk_factors:
            recommendations.append({
                'category': 'medical',
                'priority': 'moderate',
                'message': (
                    f"Your resting heart rate ({patient_data['heartRate']:.0f} bpm) is low (<60 bpm — bradycardia). "
                    "If symptomatic (dizziness, fatigue, syncope), an ECG and cardiology review are recommended "
                    "to exclude conduction disease or medication side effects."
                )
            })

        # Isolated systolic hypertension
        if 'isolated_systolic_htn' in risk_factors:
            recommendations.append({
                'category': 'medical',
                'priority': 'high',
                'message': (
                    f"You have isolated systolic hypertension (SBP {patient_data['sysBP']:.0f} / DBP {patient_data['diaBP']:.0f} mmHg). "
                    "This pattern reflects arterial stiffness and is an independent predictor of cardiovascular events, "
                    "especially in older adults. Discuss antihypertensive therapy, sodium restriction, and "
                    "regular ambulatory blood pressure monitoring with your physician."
                )
            })

        # Advanced age
        if 'advanced_age' in risk_factors:
            recommendations.append({
                'category': 'medical',
                'priority': 'moderate',
                'message': "Age is a non-modifiable risk factor. Focus on managing other risk factors and "
                          "maintaining regular health screenings including annual ECG and lipid panel."
            })
        
        # Elevated risk (0.20–0.50): low-to-moderate CHD probability — lifestyle action required
        if risk_level == 'elevated':
            recommendations.append({
                'category': 'medical',
                'priority': 'moderate',
                'message': (
                    f"Your CHD risk score ({risk_score*100:.0f}%) is in the elevated range. "
                    "While below the high-risk threshold, action now can prevent progression. "
                    "Schedule a cardiovascular risk assessment with your primary care physician "
                    "within the next month, including fasting lipid panel and blood pressure review."
                )
            })

        # If low risk, provide general guidance
        if risk_level == 'low':
            recommendations.append({
                'category': 'lifestyle',
                'priority': 'low',
                'message': "Maintain a heart-healthy lifestyle with regular exercise (150 minutes/week), "
                          "a Mediterranean-style diet rich in fruits, vegetables, and whole grains."
            })
            recommendations.append({
                'category': 'medical',
                'priority': 'low',
                'message': "Continue routine health monitoring with annual check-ups including blood pressure, "
                          "cholesterol, and blood glucose screening."
            })
        
        return recommendations
    
    def predict(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Make a prediction and generate recommendations.
        
        Args:
            patient_data: Dictionary with Framingham features
            
        Returns:
            Dictionary with prediction results and recommendations
        """
        try:
            # Validate input
            validated_data = self._validate_input(patient_data)
            
            # Create DataFrame with correct feature order
            input_df = pd.DataFrame([validated_data], columns=self.FRAMINGHAM_FEATURES)
            
            # Feature engineering
            engineered_df = self.feature_engineer.transform(input_df)
            
            # Preprocess
            if self.preprocessor is not None:
                X_processed = self.preprocessor.transform(engineered_df)
            else:
                X_processed = engineered_df.values
            
            # Get probability
            proba = self.model.predict_proba(X_processed)[0, 1]
            
            # Apply optimal threshold from model
            prediction = int(proba >= self.threshold)
            
            # Determine risk level (very_high must be checked before high)
            if proba >= self.RISK_THRESHOLDS['very_high']:
                risk_level = 'very_high'
            elif proba >= self.RISK_THRESHOLDS['high']:
                risk_level = 'high'
            elif proba >= self.RISK_THRESHOLDS['moderate']:
                risk_level = 'moderate'
            elif proba >= self.RISK_THRESHOLDS['low']:
                risk_level = 'elevated'
            else:
                risk_level = 'low'
            
            # Confidence based on distance from threshold
            distance_from_threshold = abs(proba - self.threshold)
            if distance_from_threshold > 0.3:
                confidence = 'high'
            elif distance_from_threshold > 0.15:
                confidence = 'moderate'
            else:
                confidence = 'low'
            
            # Identify risk factors
            risk_factors = self._identify_risk_factors(validated_data)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                validated_data, risk_factors, risk_level, proba
            )
            
            # Determine follow-up urgency
            if risk_level == 'very_high' or 'prior_stroke' in risk_factors:
                follow_up = 'immediate'
            elif risk_level == 'high':
                follow_up = 'within_48h'
            elif risk_level == 'moderate' or len(risk_factors) >= 3:
                follow_up = 'within_1_week'
            elif risk_level == 'elevated':
                follow_up = 'within_1_month'
            else:
                follow_up = 'routine'

            # Generate alert message based on risk level
            if risk_level == 'very_high':
                alert_message = (
                    f"⚠️ CRITICAL: Very high 10-year CHD risk detected ({proba*100:.0f}%). "
                    "Immediate cardiology evaluation is urgently required. Do not delay."
                )
            elif risk_level == 'high':
                alert_message = (
                    f"🔴 HIGH RISK: Elevated 10-year CHD risk ({proba*100:.0f}%). "
                    "Please consult a cardiologist within 48 hours."
                )
            elif risk_level == 'moderate':
                alert_message = (
                    f"🟡 MODERATE RISK: CHD risk detected ({proba*100:.0f}%). "
                    "Schedule a medical evaluation within the next week."
                )
            elif risk_level == 'elevated':
                alert_message = (
                    f"🟠 ELEVATED RISK: Low-to-moderate CHD risk ({proba*100:.0f}%). "
                    "Lifestyle modifications are strongly recommended."
                )
            else:
                alert_message = (
                    f"✅ LOW RISK: 10-year CHD risk is low ({proba*100:.0f}%). "
                    "Maintain a heart-healthy lifestyle and continue routine check-ups."
                )

            return {
                'risk_level': risk_level,
                'risk_score': float(proba),
                'prediction': prediction,
                'confidence': confidence,
                'alert_message': alert_message,
                'recommendations': recommendations,
                'key_risk_factors': risk_factors,
                'follow_up_urgency': follow_up
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            raise
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model including clinical threshold status."""
        model_sensitivity = self.metadata.get('sensitivity', None)
        override_active = (
            model_sensitivity is not None
            and model_sensitivity < self.MIN_ACCEPTABLE_SENSITIVITY
        )
        return {
            'model_type':                self.model_type,
            'dataset':                   self.dataset,
            'active_threshold':          self.threshold,
            'clinical_override_active':  override_active,
            'accuracy':                  self.metadata.get('test_accuracy'),
            'auc_roc':                   self.metadata.get('auc_roc'),
            'f1_macro':                  self.metadata.get('f1_macro'),
            'sensitivity':               model_sensitivity,
            'specificity':               self.metadata.get('specificity'),
            'n_features':                self.metadata.get('n_features'),
            'trained_at':                self.metadata.get('trained_at'),
            'retraining_recommended':    override_active,
        }
