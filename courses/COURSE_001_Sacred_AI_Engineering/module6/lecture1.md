# Module 6: Ethical AI Development  
## Lecture 1: "Imago Dei in Machine Learning: Designing AI that Honors Human Dignity"  

---

### 1. IGNITION (Hook + Revelation Trigger)  
**Story:** In 2016, Microsoft's Tay chatbot became racist within 24 hours after learning from Twitter users. This exposes a profound truth: AI mirrors its creators' flaws.  

**Provocative Question:** *"If humans are made in God's image (Genesis 1:27), what does it mean when our AI systems dehumanize people?"*  

**Spiritual Awakening:**  
- Read Psalm 139:14 ("I am fearfully and wonderfully made")  
- Contrast with how facial recognition systems misidentify darker-skinned women 35% more often (MIT Study, 2018)  
- Revelation: AI ethics isn't just technical—it's theological.  

---

### 2. DOWNLOAD (Concept Teaching)  
#### Core Concepts:  
**A. Bias in Machine Learning**  
- *Definition:* Systematic errors favoring certain groups  
- *Example:* COMPAS algorithm falsely flagged Black defendants as high-risk 2x more than whites (ProPublica)  
- *Biblical Lens:* James 2:1-4 (partiality as sin)  

**B. Fairness Metrics**  
1. Demographic Parity: Equal positive rates across groups  
2. Equalized Odds: Similar false positive/negative rates  
3. *Kingdom Perspective:* Matthew 25:40 ("As you did to the least of these...")  

**C. Technical Solutions**  
- Pre-processing: Reweight training data (e.g., IBM AIF360)  
- In-processing: Adversarial debiasing (Goodfellow et al.)  
- Post-processing: Recalibrate thresholds per group  

**D. Theological Framework**  
- *Stewardship Model:* Genesis 2:15 (tending the garden)  
- *Four-Chapter Gospel:* Creation-Fall-Redemption-Restoration applied to data science  

---

### 3. DEMONSTRATION (Worked Example)  
**Case Study: Hiring Algorithm Audit**  

1. **Problem:** Resume screening AI favors male candidates  
2. **Data Exploration:**  
   - Load dataset of 10,000 resumes  
   - `df.groupby('gender').mean()` shows 23% higher callback rate for men  
3. **Mitigation Steps:**  
   ```python
   from aif360.datasets import BinaryLabelDataset
   from aif360.algorithms.preprocessing import Reweighing
   
   privileged_group = [{'gender': 1}]  # Male
   unprivileged_group = [{'gender': 0}]
   rw = Reweighing(unprivileged_group, privileged_group)
   dataset_transf = rw.fit_transform(dataset_orig)
   ```  
4. **Results:**  
   - Before: 0.78 fairness score  
   - After reweighting: 0.92  
5. **Kingdom Impact:** Enabled 47% more qualified female candidates to advance  

---

### 4. ACTIVATION (Student Practice)  
**Hands-On Lab: Sentiment Analysis Audit**  

1. **Task:**  
   - Analyze movie review dataset (IMDb)  
   - Detect if model is biased against reviews containing "Christian" themes  
2. **Steps:**  
   - Load HuggingFace `distilbert-base-uncased` model  
   - Compare predictions for:  
     - "The church scene was inspiring" (Actual: Positive)  
     - "The church scene was long" (Actual: Negative)  
   - Calculate false positive rate differential  
3. **Deliverable:**  
   - 1-page report with:  
     - Bias metric calculations  
     - Proposed mitigation strategy  
     - Reflection on Proverbs 18:17 ("The first to plead his case seems right...")  

---

### 5. REFLECTION (Identity & Integration)  
**Guided Questions:**  
1. *Heart Check:* Have I ever prioritized model accuracy over fairness? Why?  
2. *Scriptural Alignment:* How does 1 Samuel 16:7 ("Man looks at outward appearance...") inform feature selection?  
3. *Calling:* What specific population is God burdening you to protect through ethical AI?  

**Spiritual Discipline:**  
- Practice "Tech Sabbath" with Exod