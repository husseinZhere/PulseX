"""
Enhanced Heart Health Chatbot Service
=======================================
Improvements over baseline keyword-only version:
1. TF-IDF semantic intent classification (no external model download)
2. Medical abbreviation expansion (BP, SOB, MI, CAD …)
3. Negation-aware symptom extraction via regex
4. Optional Google Gemini AI for dynamic response generation
5. Session / conversation history tracking
6. Structured JSON output with all required fields
"""

import os
import re
import uuid
import logging
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ── Medical abbreviation expansion table ─────────────────────────────────────
ABBREV_MAP: Dict[str, str] = {
    r'\bbp\b':    'blood pressure',
    r'\bhr\b':    'heart rate',
    r'\bsob\b':   'shortness of breath',
    r'\bcp\b':    'chest pain',
    r'\bhtn\b':   'hypertension',
    r'\bdm\b':    'diabetes',
    r'\bmi\b':    'myocardial infarction',
    r'\bcad\b':   'coronary artery disease',
    r'\bchf\b':   'congestive heart failure',
    r'\baf\b':    'atrial fibrillation',
    r'\bekg\b':   'electrocardiogram',
    r'\becg\b':   'electrocardiogram',
    r'\bsvt\b':   'supraventricular tachycardia',
    r'\bvt\b':    'ventricular tachycardia',
    r'\bpvcs\b':  'premature ventricular contractions',
    r'\bpacs\b':  'premature atrial contractions',
    r'\bldl\b':   'bad cholesterol',
    r'\bhdl\b':   'good cholesterol',
    r'\bcvd\b':   'cardiovascular disease',
    r'\bpe\b':    'pulmonary embolism',
    r'\bpaf\b':   'paroxysmal atrial fibrillation',
    r'\blvef\b':  'left ventricular ejection fraction',
    r'\bbmi\b':   'body mass index',
    r'\bcabg\b':  'coronary artery bypass graft',
    r'\bpci\b':   'percutaneous coronary intervention',
}

# ── Negation patterns ─────────────────────────────────────────────────────────
_NEGATION_RE = re.compile(
    r"\b(no|not|never|without|denies?|denied|absent|don'?t|doesn'?t|didn'?t|hadn'?t|free\s+of|rules?\s+out)\b",
    re.IGNORECASE,
)

# ── TF-IDF reference corpora ──────────────────────────────────────────────────
_MEDICAL_CORPUS = [
    "i have chest pain and shortness of breath",
    "my heart is beating fast and irregular palpitations",
    "high blood pressure treatment hypertension medication",
    "heart attack symptoms warning signs myocardial infarction",
    "chest tightness pressure when exercising exertion",
    "feeling dizzy lightheaded faint weakness",
    "cholesterol levels high ldl cardiovascular risk",
    "i am diabetic and worried about my heart glucose",
    "family history of cardiac disease heart attack",
    "swollen ankles legs feet edema fluid retention",
    "shortness of breath lying down orthopnea dyspnea",
    "fatigue weakness exhaustion for several weeks",
    "irregular heartbeat atrial fibrillation flutter rhythm",
    "chest pressure radiating to arm jaw shoulder angina",
    "coronary artery disease risk factors prevention",
    "ecg ekg results abnormal reading st changes",
    "heart failure congestive ejection fraction reduced",
    "myocardial infarction recovery prognosis treatment",
    "blood pressure 160 over 100 systolic diastolic",
    "statin medication cholesterol side effects atorvastatin",
    "beta blocker medication heart rate control metoprolol",
    "pacemaker defibrillator implant arrhythmia treatment",
    "cardiac catheterization angiography stent procedure",
    "stroke transient ischemic attack tia prevention",
    "aortic valve stenosis mitral valve regurgitation",
    "ventricular tachycardia fibrillation dangerous life threatening",
    "heart murmur valve disease symptoms treatment",
    "peripheral artery disease leg pain claudication",
    "sleep apnea heart disease risk cardiovascular",
    "alcohol smoking obesity cardiovascular risk factors",
]

_HEART_CORPUS = [
    "chest pain cardiac heart attack pressure tightness",
    "heart palpitations racing arrhythmia irregular beat",
    "coronary artery disease atherosclerosis plaque",
    "blood pressure hypertension cardiovascular risk",
    "heart failure congestive ejection fraction",
    "atrial fibrillation flutter stroke risk anticoagulation",
    "cardiomyopathy heart muscle disease weakness",
    "valvular heart disease aortic mitral stenosis regurgitation",
    "angina stable unstable pectoris ischemia",
    "electrocardiogram ecg st elevation ischemia block",
    "cholesterol ldl hdl triglycerides cardiovascular",
    "ventricular tachycardia fibrillation dangerous arrest",
    "ejection fraction low reduced heart function",
    "cardiac rehabilitation exercise heart recovery",
    "aortic stenosis mitral valve repair replacement surgery",
    "heart transplant end stage failure advanced",
    "pericarditis pericardial effusion inflammation",
    "endocarditis infection valve bacteria",
    "pulmonary hypertension pressure lung vessels",
    "deep vein thrombosis pulmonary embolism clot",
]

_NON_MEDICAL_CORPUS = [
    "what is the weather forecast tomorrow sunny rain",
    "tell me a funny joke humor comedy",
    "how to cook pasta dinner recipe food",
    "best movies to watch this weekend entertainment",
    "how are you doing today feeling good",
    "stock market prices cryptocurrency investment",
    "sports news football basketball results score",
    "how to learn programming python coding software",
    "travel destinations vacation holiday recommendations",
    "relationship advice girlfriend boyfriend partner",
    "help with math homework algebra calculus",
    "world history ancient civilization culture",
    "political news government election candidate",
    "music recommendations playlist songs artist",
    "shopping discount online deals product",
    "gaming video games strategy tips tricks",
    "book recommendations literature novel reading",
    "social media followers likes content creator",
    "car repair mechanic oil change engine",
    "home improvement construction renovation design",
]

# ── Symptom detection patterns with regex ────────────────────────────────────
SYMPTOM_PATTERNS: Dict[str, List[str]] = {
    'chest_pain': [
        r'chest\s+(pain|ache|tightn|pressure|discomfort|heaviness|squeezing|burning|hurt)',
        r'pain\s+in\s+(my\s+)?chest',
        r'chest\s+hurt',
        r'precordial\s+(pain|discomfort)',
    ],
    'shortness_of_breath': [
        r'short\w*\s+of\s+breath',
        r'breath\w*\s+difficult\w*',
        r'difficult\w*\s+breath\w*',
        r"can'?t\s+breath",
        r'\bdyspnea\b',
        r'\bgasping\b',
        r'\borthopnea\b',
        r'sob\b',
    ],
    'palpitations': [
        r'palpit\w+',
        r'heart\s+(?:is\s+|was\s+|feels?\s+|beating\s+)?(racing|pounding|fluttering|skipping|jumping|fast|rapid)',
        r'rapid\s+(heart|pulse|beat)',
        r'fast\s+(heart|pulse)',
        r'\btachycardia\b',
        r'heart\s+beat\w*\s+(fast|irregular|rapid)',
    ],
    'high_blood_pressure': [
        r'high\s+blood\s+pressure',
        r'\bhypertension\b',
        r'elevated\s+(blood\s+)?pressure',
        r'blood\s+pressure\s+(is\s+)?(high|elevated|\d{3})',
        r'systolic\s+(is\s+)?(high|\d{3})',
    ],
    'high_cholesterol': [
        r'high\s+cholesterol',
        r'elevated\s+cholesterol',
        r'hypercholesterol\w+',
        r'ldl\s+(is\s+)?(high|elevated)',
        r'bad\s+cholesterol',
        r'\bhyperlipidemia\b',
    ],
    'diabetes': [
        r'\bdiabet\w+\b',
        r'blood\s+sugar\s+(is\s+)?(high|elevated)',
        r'insulin\s+dependent',
        r'glucose\s+(is\s+)?(high|elevated)',
        r'\bhyperglycemia\b',
    ],
    'irregular_heartbeat': [
        r'irregular\s+(heart\w*|pulse|beat|rhythm)',
        r'\barrhythmia\b',
        r'atrial\s+fibrill\w+',
        r'missed?\s+beat',
        r'skipping\s+beat',
        r'\bflutter\b',
        r'heart\s+(block|rhythm\s+problem)',
    ],
    'fatigue': [
        r'\bfatigue\b',
        r'\bexhausted\b|\bexhaustion\b',
        r'very\s+tired|extremely\s+tired|always\s+tired',
        r'no\s+energy|low\s+energy',
        r'constant\s+tiredness',
        r'\bweakness\b',
        r'easily\s+tired',
    ],
    'dizziness': [
        r'\bdizzy\b|\bdizziness\b',
        r'\blightheaded\w*\b',
        r'\bvertigo\b',
        r'spinning\s+sensation',
        r'\bfaint\w*\b',
        r'\bpre-?syncope\b|\bsyncope\b',
    ],
    'swelling': [
        r'swoll?en?\s+(ankle|leg|feet|foot|lower\s+extremit)',
        r'\bedema\b',
        r'puffy\s+(ankle|leg|feet|face)',
        r'leg\s+swelling',
        r'fluid\s+retention',
    ],
    'smoking': [
        r'\bsmok\w+\b',
        r'\bcigarette\b|\btobacco\b',
        r'pack(s)?\s+(a|per)\s+day',
        r'\bnicotine\b',
    ],
    'family_history': [
        r'family\s+(history|hx)',
        r'(father|mother|parent|sibling|brother|sister|grandparent)\s+(had|has|with)',
        r'genetic\s+(risk|predisposition|condition)',
        r'\bhereditary\b',
        r'runs?\s+in\s+(the\s+)?family',
    ],
    'obesity': [
        r'\bobes\w+\b',
        r'\boverweight\b',
        r'bmi\s+(is\s+)?\d{2}',
        r'excess\s+weight',
        r'morbidly\s+(obese|heavy)',
    ],
    'prior_heart_disease': [
        r'previous\s+(heart\s+attack|mi|cardiac\s+event|angioplasty)',
        r'history\s+of\s+(heart|cardiac|coronary)',
        r'had\s+(a\s+)?(heart\s+attack|mi|stent|bypass)',
        r'\bprevious\s+stent\b',
        r'\bprior\s+(mi|cad|chf)\b',
    ],
}

# ── Risk weights per symptom ──────────────────────────────────────────────────
RISK_WEIGHTS: Dict[str, float] = {
    'chest_pain':          0.30,
    'shortness_of_breath': 0.22,
    'palpitations':        0.15,
    'high_blood_pressure': 0.18,
    'high_cholesterol':    0.15,
    'diabetes':            0.12,
    'irregular_heartbeat': 0.18,
    'fatigue':             0.06,
    'dizziness':           0.08,
    'swelling':            0.12,
    'smoking':             0.12,
    'family_history':      0.10,
    'obesity':             0.08,
    'prior_heart_disease': 0.35,
}


class ChatbotService:
    """
    Heart health chatbot with multi-layer NLP and optional Gemini AI.

    Intent classification pipeline:
      Layer 1 — Fast keyword gate (O(1) lookup)
      Layer 2 — TF-IDF cosine similarity (semantic, no model download)
      Layer 3 — Google Gemini AI response (optional, requires GEMINI_API_KEY)
    """

    # Minimum TF-IDF similarity scores to classify as medical / heart-related
    MEDICAL_SIM_THRESHOLD = 0.10
    HEART_SIM_THRESHOLD   = 0.12

    def __init__(self):
        self.sessions: Dict[str, List[Dict]] = {}
        self._build_tfidf()
        self._init_gemini()
        logger.info("ChatbotService initialised — TF-IDF corpus: %d medical, %d heart, %d non-medical",
                    len(_MEDICAL_CORPUS), len(_HEART_CORPUS), len(_NON_MEDICAL_CORPUS))

    # ─────────────────────── Initialisation ──────────────────────────────────

    def _build_tfidf(self) -> None:
        """Fit TF-IDF vectorizer on the reference corpus."""
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 3),
            max_features=10000,
            sublinear_tf=True,
            min_df=1,
        )
        all_corpus = _MEDICAL_CORPUS + _HEART_CORPUS + _NON_MEDICAL_CORPUS
        self.tfidf_matrix = self.vectorizer.fit_transform(all_corpus)
        self._n_med   = len(_MEDICAL_CORPUS)
        self._n_heart = len(_HEART_CORPUS)

    def _init_gemini(self) -> None:
        """Initialise Google Gemini AI (optional — set GEMINI_API_KEY in .env)."""
        self.gemini = None
        api_key = os.getenv('GEMINI_API_KEY', '').strip()
        if not api_key:
            logger.info("GEMINI_API_KEY not set — using template-based responses")
            return
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            self.gemini = genai.GenerativeModel(
                model_name='gemini-1.5-flash',
                system_instruction=(
                    "You are PulseX Heart Health AI — a medical information assistant specialising "
                    "in cardiovascular health. Be empathetic, clear, and patient-friendly. "
                    "Always recommend consulting a licensed physician for diagnosis or treatment. "
                    "Include a brief medical disclaimer in every response. "
                    "Respond in under 350 words using bullet points where appropriate."
                ),
            )
            logger.info("Gemini AI initialised successfully")
        except Exception as e:
            logger.warning("Gemini init failed (continuing without it): %s", e)

    # ─────────────────────── Text Preprocessing ──────────────────────────────

    def preprocess(self, text: str) -> str:
        """
        Clean and normalise user input:
        - Lowercase + strip
        - Expand medical abbreviations (BP → blood pressure)
        - Collapse extra whitespace
        - Remove non-ASCII noise
        """
        text = text.lower().strip()
        for pattern, expansion in ABBREV_MAP.items():
            text = re.sub(pattern, expansion, text, flags=re.IGNORECASE)
        text = re.sub(r"[^\w\s\-\.\,\?\!\']", ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    # ─────────────────────── Intent Classification ───────────────────────────

    def _tfidf_scores(self, text: str) -> Tuple[float, float]:
        """Compute max cosine similarity to medical and heart reference corpora."""
        vec = self.vectorizer.transform([text])
        sims = cosine_similarity(vec, self.tfidf_matrix)[0]
        med_sim   = float(sims[:self._n_med].max())
        heart_sim = float(sims[self._n_med: self._n_med + self._n_heart].max())
        return med_sim, heart_sim

    def _keyword_medical(self, text: str) -> bool:
        """Fast keyword gate for medical intent (first pass)."""
        KEYWORDS = {
            'pain', 'ache', 'symptom', 'disease', 'illness', 'sick', 'hurt',
            'doctor', 'treatment', 'medicine', 'medication', 'health', 'medical',
            'diagnosis', 'blood', 'pressure', 'heart', 'chest', 'breathing',
            'dizzy', 'fever', 'cough', 'fatigue', 'tired', 'weak', 'nausea',
            'headache', 'pulse', 'artery', 'vein', 'stroke', 'cholesterol',
            'diabetes', 'insulin', 'glucose', 'cardiac', 'cardiovascular',
            'shortness', 'breath', 'palpitation', 'swelling', 'edema',
        }
        words = set(text.split())
        return bool(words & KEYWORDS)

    def _keyword_heart(self, text: str) -> bool:
        """Fast keyword gate for heart-domain check."""
        KEYWORDS = {
            'heart', 'cardiac', 'cardiovascular', 'chest', 'angina',
            'palpitation', 'arrhythmia', 'hypertension', 'blood pressure',
            'cholesterol', 'coronary', 'myocardial', 'infarction',
            'stroke', 'atherosclerosis', 'tachycardia', 'bradycardia',
            'valve', 'ecg', 'ekg', 'pulse', 'circulation', 'artery',
            'ventricle', 'atrium', 'aorta', 'fibrillation', 'stent',
            'bypass', 'pacemaker', 'defibrillator', 'ejection',
        }
        return any(kw in text for kw in KEYWORDS)

    def classify_intent(self, text: str) -> Tuple[bool, bool, float, float]:
        """
        Classify intent using keyword gate + TF-IDF semantic similarity.

        Returns:
            (is_medical, is_heart_related, med_score, heart_score)
        """
        kw_medical = self._keyword_medical(text)
        kw_heart   = self._keyword_heart(text)
        tfidf_med, tfidf_heart = self._tfidf_scores(text)

        is_medical = kw_medical or (tfidf_med   >= self.MEDICAL_SIM_THRESHOLD)
        is_heart   = kw_heart   or (tfidf_heart >= self.HEART_SIM_THRESHOLD)

        if is_heart:
            is_medical = True  # heart-related is always medical

        return is_medical, is_heart, tfidf_med, tfidf_heart

    # ─────────────────────── Symptom Extraction ──────────────────────────────

    def _has_negation(self, text: str, match_start: int, window: int = 6) -> bool:
        """Return True if a negation word appears within `window` tokens before the match."""
        preceding_words = text[:match_start].split()[-window:]
        return any(_NEGATION_RE.search(w) for w in preceding_words)

    def extract_symptoms(self, text: str) -> List[str]:
        """
        Extract heart-related symptoms using regex with negation handling.

        A symptom is only recorded if no negation pattern precedes it within
        a 6-word window (e.g. "no chest pain" → chest_pain NOT recorded).
        """
        found: List[str] = []
        for symptom_name, patterns in SYMPTOM_PATTERNS.items():
            for pat in patterns:
                m = re.search(pat, text, re.IGNORECASE)
                if m and not self._has_negation(text, m.start()):
                    found.append(symptom_name)
                    break  # one match per symptom category is sufficient
        return found

    # ─────────────────────── Risk Calculation ────────────────────────────────

    def calculate_risk(self, symptoms: List[str], user_data: Optional[Dict] = None) -> Dict:
        """Compute weighted risk score from detected symptoms and optional vitals."""
        score = 0.0
        contributors: List[Dict] = []

        for sym in symptoms:
            w = RISK_WEIGHTS.get(sym, 0.05)
            score += w
            contributors.append({
                'factor': sym.replace('_', ' ').title(),
                'weight': w,
                'contribution': f"{w * 100:.1f}%",
            })

        # Optional user vitals
        if user_data:
            if (user_data.get('age') or 0) > 55:
                score += 0.12
                contributors.append({'factor': 'Age > 55', 'weight': 0.12, 'contribution': '12.0%'})
            if (user_data.get('bmi') or 0) > 30:
                score += 0.08
                contributors.append({'factor': 'High BMI', 'weight': 0.08, 'contribution': '8.0%'})
            if user_data.get('diabetes'):
                score += 0.10
                contributors.append({'factor': 'Diabetes (profile)', 'weight': 0.10, 'contribution': '10.0%'})
            if user_data.get('smoker'):
                score += 0.12
                contributors.append({'factor': 'Smoker (profile)', 'weight': 0.12, 'contribution': '12.0%'})

        score = min(score, 1.0)

        if score >= 0.55:
            risk_level, risk_label = 'high',   'High Risk ⚠️'
        elif score >= 0.28:
            risk_level, risk_label = 'medium', 'Moderate Risk ⚡'
        else:
            risk_level, risk_label = 'low',    'Low Risk ✅'

        return {
            'risk_level':      risk_level,
            'risk_category':   risk_label,
            'risk_score':      round(score, 3),
            'risk_percentage': round(score * 100, 1),
            'contributors':    contributors,
        }

    # ─────────────────────── Recommendations ─────────────────────────────────

    def generate_recommendations(self, risk: Dict, symptoms: List[str]) -> List[str]:
        """Generate personalised, symptom-aware cardiovascular recommendations."""
        recs: List[str] = []
        level = risk['risk_level']

        if level == 'high':
            recs += [
                "🚨 URGENT: Please seek immediate medical attention or call emergency services",
                "📞 Contact your doctor NOW or go to the nearest emergency room",
                "⚠️ Do NOT ignore these symptoms — they may indicate a cardiac emergency",
                "💊 Continue all prescribed medications exactly as directed",
            ]
        elif level == 'medium':
            recs += [
                "📅 Schedule an appointment with your cardiologist or GP within 24–48 hours",
                "📊 Request a heart panel: ECG, echocardiogram, lipid profile, troponin",
                "📝 Log your symptoms — include timing, severity, and triggers",
                "🏥 Do not wait for symptoms to worsen before seeking care",
            ]
        else:
            recs += [
                "✅ Your current symptom profile suggests low cardiac risk",
                "💚 Maintain regular annual cardiovascular screening check-ups",
                "🏃 Continue healthy lifestyle habits — diet, exercise, sleep",
            ]

        # Symptom-specific additions
        if 'chest_pain' in symptoms:
            recs.append("⚠️ Chest pain ALWAYS requires professional evaluation — do not delay")
        if 'high_blood_pressure' in symptoms:
            recs.append("🍎 DASH diet: reduce sodium to <2 g/day, increase fruits and vegetables")
        if 'high_cholesterol' in symptoms:
            recs.append("🥗 Heart-healthy diet: reduce saturated fat, increase fibre and omega-3s")
        if 'smoking' in symptoms:
            recs.append("🚭 Quit smoking immediately — it more than doubles your cardiac risk")
        if 'irregular_heartbeat' in symptoms or 'palpitations' in symptoms:
            recs.append("📱 Wear a continuous heart-rate monitor; share data with your cardiologist")
        if 'swelling' in symptoms:
            recs.append("💧 Leg swelling may indicate heart failure — elevate feet and restrict fluids")
        if 'diabetes' in symptoms:
            recs.append("🩺 Strict glycaemic control (HbA1c <7%) significantly reduces cardiac risk")
        if 'shortness_of_breath' in symptoms:
            recs.append("🌬️ Breathlessness at rest or at night needs same-day medical evaluation")
        if 'prior_heart_disease' in symptoms:
            recs.append("🏥 Prior cardiac event: ensure you are on secondary-prevention therapy (statin, aspirin, ACE-inhibitor)")

        recs += [
            "😴 Prioritise 7–9 hours of quality sleep per night",
            "🧘 Manage stress through mindfulness, breathing exercises, or yoga",
            "🏃‍♂️ Aim for 150 minutes of moderate aerobic activity per week",
            "📱 Use PulseX monitoring tools to track your vitals daily",
        ]
        return recs

    # ─────────────────────── Response Formatting ─────────────────────────────

    def format_response(self, risk: Dict, symptoms: List[str], recs: List[str]) -> str:
        """Build a clean, structured Markdown response."""
        parts = ["# 🫀 PulseX Heart Health Assessment\n"]
        parts.append(f"## Risk Level: {risk['risk_category']}")
        parts.append(f"**Estimated Risk Score:** {risk['risk_percentage']}%\n")

        if symptoms:
            parts.append("## Detected Symptoms / Risk Factors")
            for s in symptoms:
                parts.append(f"- {s.replace('_', ' ').title()}")
            parts.append("")

        if risk['contributors']:
            parts.append("## Risk Contribution Breakdown")
            for c in risk['contributors']:
                parts.append(f"- {c['factor']}: **{c['contribution']}**")
            parts.append("")

        parts.append("## Personalised Recommendations")
        for r in recs:
            parts.append(r)

        parts.append(
            "\n---\n"
            "⚕️ *Medical Disclaimer: This assessment is for informational purposes only "
            "and is NOT a substitute for professional medical advice, diagnosis, or treatment. "
            "Always consult a qualified healthcare provider.*"
        )
        return "\n".join(parts)

    # ─────────────────────── Gemini AI Response ──────────────────────────────

    async def _gemini_response(self, user_message: str, symptoms: List[str], risk: Dict) -> Optional[str]:
        """
        Generate a personalised response using Google Gemini AI.
        Falls back to None silently so the template response is used instead.
        """
        if self.gemini is None:
            return None
        symptom_str = ', '.join(s.replace('_', ' ') for s in symptoms) or 'none identified'
        prompt = (
            f'Patient message: "{user_message}"\n'
            f"Detected cardiac symptoms: {symptom_str}\n"
            f"Risk assessment: {risk['risk_category']} (score: {risk['risk_percentage']}%)\n\n"
            "Provide a clear, empathetic, and medically accurate cardiovascular health response. "
            "Include specific actionable advice and note clearly when emergency care is needed."
        )
        try:
            import asyncio
            resp = await asyncio.to_thread(self.gemini.generate_content, prompt)
            return resp.text
        except Exception as e:
            logger.warning("Gemini response failed (using template): %s", e)
            return None

    # ─────────────────────── Session Management ──────────────────────────────

    def _get_session(self, session_id: Optional[str]) -> Tuple[str, List]:
        """Retrieve or create a conversation session."""
        if not session_id or session_id not in self.sessions:
            session_id = str(uuid.uuid4())
            self.sessions[session_id] = []
        return session_id, self.sessions[session_id]

    # ─────────────────────── Main Pipeline ───────────────────────────────────

    async def process_message(
        self,
        message: str,
        user_data: Optional[Dict] = None,
        session_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Full 7-step chatbot pipeline:
          1. Preprocess (abbreviation expansion, normalise)
          2. Classify intent (keyword gate + TF-IDF semantic)
          3. Domain guard (must be heart-related)
          4. Extract symptoms (regex + negation handling)
          5. Calculate risk score
          6. Generate recommendations
          7. Format response (Gemini if available, otherwise template)
        """
        session_id, history = self._get_session(session_id)
        ts = datetime.now().isoformat()

        try:
            # Step 1 — Preprocess
            clean = self.preprocess(message)
            logger.info("Preprocessed: %.100s", clean)

            # Step 2 — Classify intent
            is_medical, is_heart, med_score, heart_score = self.classify_intent(clean)
            logger.info("Intent — medical:%s(%.3f), heart:%s(%.3f)", is_medical, med_score, is_heart, heart_score)

            # ── Not medical ───────────────────────────────────────────────────
            if not is_medical:
                resp = (
                    "I'm here to help with your heart health concerns! 💚\n\n"
                    "I specialise in cardiovascular health and can assist with:\n"
                    "- Heart-related symptoms and concerns\n"
                    "- Blood pressure and cholesterol information\n"
                    "- Heart disease risk assessment\n"
                    "- General heart health advice\n\n"
                    "Could you please share your heart health question or symptoms?"
                )
                history.append({'role': 'user', 'message': message, 'type': 'non_medical', 'ts': ts})
                return {
                    'success': True, 'response': resp, 'type': 'non_medical',
                    'session_id': session_id, 'requires_clarification': True,
                }

            # ── Medical but not heart-related ─────────────────────────────────
            if not is_heart:
                resp = (
                    "I appreciate your question! However, I specialise specifically in "
                    "cardiovascular (heart) health. 🫀\n\n"
                    "For non-cardiac concerns I recommend:\n"
                    "- Consulting your primary care physician\n"
                    "- Visiting a relevant specialist\n"
                    "- Using a general medical information resource\n\n"
                    "If you have any heart-related concerns, I am ready to help!"
                )
                history.append({'role': 'user', 'message': message, 'type': 'non_heart', 'ts': ts})
                return {
                    'success': True, 'response': resp, 'type': 'non_heart_medical',
                    'session_id': session_id, 'requires_clarification': True,
                }

            # Step 3 — Extract symptoms
            symptoms = self.extract_symptoms(clean)

            # ── Heart-related but no specific symptoms extracted ───────────────
            if not symptoms:
                resp = (
                    "I understand you have heart health concerns. To give you a more "
                    "accurate assessment, could you describe your symptoms in more detail?\n\n"
                    "For example, are you experiencing:\n"
                    "- Chest pain or tightness?\n"
                    "- Shortness of breath (at rest or on exertion)?\n"
                    "- Irregular heartbeat or palpitations?\n"
                    "- Fatigue, dizziness, or swollen legs?\n"
                    "- High blood pressure or high cholesterol?\n\n"
                    "Please share as much detail as you are comfortable with."
                )
                history.append({'role': 'user', 'message': message, 'type': 'needs_info', 'ts': ts})
                return {
                    'success': True, 'response': resp, 'type': 'needs_more_info',
                    'session_id': session_id, 'requires_clarification': True,
                }

            # Step 4 — Calculate risk
            risk = self.calculate_risk(symptoms, user_data)

            # Step 5 — Recommendations
            recs = self.generate_recommendations(risk, symptoms)

            # Step 6 — Format (Gemini first, fallback to template)
            gemini_text = await self._gemini_response(message, symptoms, risk)
            if gemini_text:
                formatted = (
                    f"# 🫀 PulseX Heart Health Assessment\n\n"
                    f"## Risk Level: {risk['risk_category']}\n"
                    f"**Risk Score:** {risk['risk_percentage']}%\n\n"
                    f"{gemini_text}\n\n"
                    "---\n"
                    "⚕️ *Medical Disclaimer: For informational purposes only. "
                    "Always consult a qualified healthcare provider.*"
                )
            else:
                formatted = self.format_response(risk, symptoms, recs)

            # Step 7 — Update session history
            history.append({
                'role': 'user', 'message': message,
                'symptoms': symptoms, 'risk_level': risk['risk_level'], 'ts': ts,
            })
            history.append({
                'role': 'assistant', 'risk_level': risk['risk_level'],
                'gemini_used': gemini_text is not None, 'ts': ts,
            })

            return {
                'success':               True,
                'response':              formatted,
                'type':                  'risk_assessment',
                'risk_level':            risk['risk_level'],
                'risk_score':            risk['risk_score'],
                'risk_percentage':       risk['risk_percentage'],
                'symptoms':              symptoms,
                'recommendations':       recs,
                'session_id':            session_id,
                'gemini_used':           gemini_text is not None,
                'requires_clarification': False,
            }

        except Exception as e:
            logger.error("Error processing message: %s", e, exc_info=True)
            return {
                'success':    False,
                'response':   (
                    "I apologise — an error occurred while processing your message. "
                    "Please rephrase your question or contact support if the issue persists."
                ),
                'type':       'error',
                'error':      str(e),
                'session_id': session_id,
            }
