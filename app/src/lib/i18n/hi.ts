// Hindi translations for the KoylaNiti UI.
// Keys are the English source strings (key-as-source-language); lookup falls back
// to the key itself when a translation is missing, so English always works.
// Register: formal Hindi (आप), appropriate for a government platform.

export const hi: Record<string, string> = {
  // ── Header / nav ─────────────────────────────────────────────
  Map: "मानचित्र",
  Cases: "मामले",
  Complaints: "शिकायतें",
  "Field Reports": "क्षेत्र रिपोर्ट",
  Contractors: "ठेकेदार",
  "My Mine": "मेरी खदान",
  Documents: "दस्तावेज़",
  Assignments: "कार्य",
  Alerts: "सूचनाएँ",
  "Log out": "लॉग आउट",

  // ── Login ────────────────────────────────────────────────────
  "SIH26024 — Smart Governance & Compliance Monitoring":
    "SIH26024 — स्मार्ट शासन एवं अनुपालन निगरानी",
  Username: "उपयोगकर्ता नाम",
  Password: "पासवर्ड",
  "Sign in": "साइन इन करें",
  "Signing in...": "साइन इन हो रहा है...",
  "Demo accounts: admin, dgms_east, manager3, inspector1 — password":
    "डेमो खाते: admin, dgms_east, manager3, inspector1 — पासवर्ड",
  "Report a concern anonymously": "गुमनाम रूप से चिंता दर्ज करें",
  "Invalid username or password.": "उपयोगकर्ता नाम या पासवर्ड गलत है।",
  "Login failed. Try again.": "लॉगिन विफल रहा। पुनः प्रयास करें।",

  // ── Shared / common ─────────────────────────────────────────
  Mine: "खदान",
  "Select a mine": "एक खदान चुनें",
  "Select a mine.": "एक खदान चुनें।",
  "compliance score": "अनुपालन स्कोर",
  "Score breakdown": "स्कोर विवरण",
  "Open findings": "खुले निष्कर्ष",
  "Open findings ({count})": "खुले निष्कर्ष ({count})",
  "Linked findings ({count})": "संबद्ध निष्कर्ष ({count})",
  "No open findings.": "कोई खुला निष्कर्ष नहीं।",
  "Open cases": "खुले मामले",
  "No open cases.": "कोई खुला मामला नहीं।",
  Pass: "पास",
  Fail: "असफल",
  opened: "खोला गया",
  expires: "समाप्त होता है",
  "Expires ": "समाप्त ",
  weight: "भारांक",

  // ── Domain labels ────────────────────────────────────────────
  "Statutory Documents": "सांविधिक दस्तावेज़",
  "Safety / Field Inspection": "सुरक्षा / क्षेत्र निरीक्षण",
  "Environmental / Satellite": "पर्यावरण / उपग्रह",
  "Operational / Other": "परिचालन / अन्य",

  // ── Gov dashboard ────────────────────────────────────────────
  "Total mines": "कुल खदानें",
  "Red mines": "लाल खदानें",
  "Yellow mines": "पीली खदानें",
  "Avg. score": "औसत स्कोर",
  "Mine locations": "खदान स्थान",
  "Cases needing action": "कार्रवाई की आवश्यकता वाले मामले",
  "View all cases": "सभी मामले देखें",
  "No cases need action right now.": "अभी किसी मामले पर कार्रवाई की आवश्यकता नहीं है।",
  "All mines": "सभी खदानें",

  // ── Cases list ───────────────────────────────────────────────
  All: "सभी",
  "No cases match this filter.": "इस फ़िल्टर से कोई मामला मेल नहीं खाता।",

  // ── Case detail ──────────────────────────────────────────────
  "Originated from public complaint": "सार्वजनिक शिकायत से उत्पन्न",
  "View complaint": "शिकायत देखें",
  "AI case brief": "AI मामला सारांश",
  "Inspection evidence": "निरीक्षण प्रमाण",
  "No GPS": "कोई GPS नहीं",
  Actions: "कार्रवाइयाँ",
  "Assign to inspector": "निरीक्षक को सौंपें",
  "Select an inspector": "एक निरीक्षक चुनें",
  "Due date (SLA)": "नियत तिथि (SLA)",
  "Escalation target": "एस्केलेशन लक्ष्य",
  "e.g. State DGMS Office": "उदा. राज्य DGMS कार्यालय",
  "Assign case": "मामला सौंपें",
  "Waiting for the assigned inspector to submit checklist evidence.":
    "नियुक्त निरीक्षक द्वारा चेकलिस्ट प्रमाण प्रस्तुत करने की प्रतीक्षा है।",
  " Due ": " नियत ",
  " Escalation: ": " एस्केलेशन: ",
  "Verify evidence": "प्रमाण सत्यापित करें",
  "Closure reason": "समापन का कारण",
  "Evidence verified, remediation complete.": "प्रमाण सत्यापित, सुधार पूर्ण।",
  "Close case": "मामला बंद करें",
  "Closed ": "बंद ",

  // ── Mine detail ──────────────────────────────────────────────
  "This mine has an open case:": "इस खदान का एक खुला मामला है:",
  "Open case": "खुला मामला",
  "No documents uploaded.": "कोई दस्तावेज़ अपलोड नहीं किया गया।",
  "No permit number extracted": "कोई परमिट संख्या नहीं निकाली गई",
  "Satellite comparison": "उपग्रह तुलना",
  Before: "पहले",
  After: "बाद",
  "NDVI vegetation loss:": "NDVI वनस्पति हानि:",

  // ── Manager ──────────────────────────────────────────────────
  "No mine is assigned to this account.": "इस खाते को कोई खदान आवंटित नहीं है।",
  "Upload document": "दस्तावेज़ अपलोड करें",
  "No documents on file.": "फ़ाइल पर कोई दस्तावेज़ नहीं है।",
  "No expiry extracted": "कोई समाप्ति तिथि नहीं निकाली गई",
  "Findings to remediate": "सुधार हेतु निष्कर्ष",
  Remediation: "सुधारात्मक कार्रवाई",
  "Mark remediation evidence as submitted once corrective action has been taken. A DGMS officer will verify before the case is closed.":
    "सुधारात्मक कार्रवाई पूर्ण होने पर सुधार प्रमाण को प्रस्तुत के रूप में चिह्नित करें। मामला बंद करने से पहले DGMS अधिकारी इसे सत्यापित करेंगे।",
  "Submit remediation evidence": "सुधार प्रमाण प्रस्तुत करें",
  "Evidence submitted — awaiting DGMS verification.": "प्रमाण प्रस्तुत — DGMS सत्यापन की प्रतीक्षा।",
  "Verified — awaiting closure.": "सत्यापित — समापन की प्रतीक्षा।",
  "Case closed.": "मामला बंद कर दिया गया है।",
  "Waiting for DGMS to assign this case to an inspector.":
    "DGMS द्वारा इस मामले को निरीक्षक को सौंपे जाने की प्रतीक्षा है।",

  // ── Document upload ──────────────────────────────────────────
  "Upload a compliance document": "अनुपालन दस्तावेज़ अपलोड करें",
  "Document type": "दस्तावेज़ का प्रकार",
  "Select type": "प्रकार चुनें",
  "Document text": "दस्तावेज़ पाठ",
  "Paste or type the document’s key text (permit number, issue date, expiry date). This stands in for OCR — AI will extract the structured fields from what you enter here.":
    "दस्तावेज़ का मुख्य पाठ (परमिट संख्या, जारी तिथि, समाप्ति तिथि) चिपकाएँ या लिखें। यह OCR का विकल्प है — AI आपके द्वारा दर्ज किए गए पाठ से संरचित फ़ील्ड निकालेगा।",
  "Attach file (optional)": "फ़ाइल संलग्न करें (वैकल्पिक)",
  "Environmental Clearance No. ... Valid until ...": "पर्यावरण स्वीकृति सं. ... तक वैध ...",
  "Uploading...": "अपलोड हो रहा है...",
  "Environmental Clearance": "पर्यावरण स्वीकृति",
  "Forest Clearance": "वन स्वीकृति",
  "Mining Plan Approval": "खनन योजना अनुमोदन",
  "Consent to Operate": "संचालन सहमति",
  "Safety Certificate": "सुरक्षा प्रमाणपत्र",
  Other: "अन्य",

  // ── Inspector ────────────────────────────────────────────────
  "My assignments": "मेरे कार्य",
  "File a report": "रिपोर्ट दर्ज करें",
  "No assignments waiting on you.": "आपके लिए कोई कार्य लंबित नहीं है।",
  "Past assignments": "पिछले कार्य",
  "File a field report": "क्षेत्र रिपोर्ट दर्ज करें",
  "Not tied to an existing assignment.": "किसी मौजूदा कार्य से संबद्ध नहीं।",
  "Simulate offline (no network)": "ऑफ़लाइन अनुकरण (नेटवर्क नहीं)",
  "Pending sync: ": "लंबित सिंक: ",
  "Reconnect & sync": "पुनः कनेक्ट करें और सिंक करें",
  "Report details": "रिपोर्ट विवरण",
  "Field report type": "क्षेत्र रिपोर्ट का प्रकार",
  Checklist: "चेकलिस्ट",
  "Location & evidence": "स्थान एवं प्रमाण",
  "Capture GPS location": "GPS स्थान कैप्चर करें",
  Photo: "फ़ोटो",
  Notes: "नोट्स",
  "Submitting...": "प्रस्तुत हो रहा है...",
  "Save offline": "ऑफ़लाइन सहेजें",
  "Submit inspection": "निरीक्षण प्रस्तुत करें",
  "Geolocation not supported on this device.": "इस डिवाइस पर जियोलोकेशन समर्थित नहीं है।",
  "Could not get location. Enter it manually below.": "स्थान प्राप्त नहीं हो सका। नीचे मैन्युअल रूप से दर्ज करें।",
  "Saved offline. It will upload once you reconnect and sync.":
    "ऑफ़लाइन सहेजा गया। पुनः कनेक्ट और सिंक करने पर यह अपलोड हो जाएगा।",
  "Synced {count} inspection(s).": "{count} निरीक्षण सिंक किए गए।",
  "Ventilation / gas monitoring functioning": "वेंटिलेशन / गैस निगरानी कार्यरत है",
  "Fire-fighting / emergency equipment available": "अग्निशमन / आपातकालीन उपकरण उपलब्ध हैं",
  "Workers wearing required PPE": "श्रमिक आवश्यक PPE पहने हुए हैं",
  "Safety signage and barricading in place": "सुरक्षा साइनेज और बैरिकेडिंग स्थापित है",
  "Compliance Observation": "अनुपालन अवलोकन",
  "Safety Incident": "सुरक्षा घटना",
  "Environmental Observation": "पर्यावरण अवलोकन",
  "Operational Exception": "परिचालन अपवाद",

  // ── Public complaint ─────────────────────────────────────────
  "Report a concern": "चिंता दर्ज करें",
  "No login required. No name, contact detail, or any other identifying information is ever recorded with your complaint.":
    "लॉगिन की आवश्यकता नहीं है। आपकी शिकायत के साथ कभी भी नाम, संपर्क विवरण या कोई अन्य पहचान संबंधी जानकारी दर्ज नहीं की जाती।",
  "Select the mine your complaint concerns": "वह खदान चुनें जिससे आपकी शिकायत संबंधित है",
  Category: "श्रेणी",
  "Select a category": "एक श्रेणी चुनें",
  "What happened?": "क्या हुआ?",
  "Describe your concern in as much detail as you can.": "अपनी चिंता का यथासंभव विस्तार से वर्णन करें।",
  "Photo (optional)": "फ़ोटो (वैकल्पिक)",
  Website: "वेबसाइट",
  "Submit complaint": "शिकायत प्रस्तुत करें",
  "Complaint received.": "शिकायत प्राप्त हो गई है।",
  "Your complaint ID is": "आपकी शिकायत ID है",
  "Save this ID somewhere safe — it is the only way to check your complaint’s status later, at /complaint/status. No identifying information about you has been recorded.":
    "यह ID किसी सुरक्षित स्थान पर सहेजें — बाद में /complaint/status पर अपनी शिकायत की स्थिति जाँचने का यही एकमात्र तरीका है। आपके बारे में कोई पहचान संबंधी जानकारी दर्ज नहीं की गई है।",
  Safety: "सुरक्षा",
  Environmental: "पर्यावरण",
  "Labour/Worker": "श्रम/श्रमिक",
  "Corruption/Malpractice": "भ्रष्टाचार/कदाचार",
  "Check complaint status": "शिकायत की स्थिति जाँचें",
  "Enter the complaint ID you were given at submission.": "प्रस्तुत करते समय आपको दी गई शिकायत ID दर्ज करें।",
  "Complaint ID": "शिकायत ID",
  Check: "जाँचें",
  "No complaint found with that ID.": "उस ID से कोई शिकायत नहीं मिली।",
  "Submitted ": "प्रस्तुत ",
  "File a new complaint": "नई शिकायत दर्ज करें",

  // ── Complaint statuses ───────────────────────────────────────
  "Received, not yet reviewed": "प्राप्त, अभी समीक्षा नहीं हुई",
  "Under review": "समीक्षा जारी",
  "Escalated for field verification": "क्षेत्र सत्यापन हेतु एस्केलेटेड",
  "Reviewed, no further action": "समीक्षित, आगे कोई कार्रवाई नहीं",
  "UNDER REVIEW": "समीक्षा जारी",
  UNDER_REVIEW: "समीक्षा जारी",
  ESCALATED: "एस्केलेटेड",
  DISMISSED: "खारिज",
  NEW: "नया",

  // ── Complaints (gov) ─────────────────────────────────────────
  "Public Complaints": "सार्वजनिक शिकायतें",
  "Anonymously submitted concerns, awaiting triage.": "गुमनाम रूप से प्रस्तुत चिंताएँ, ट्राइएज की प्रतीक्षा में।",
  "No complaints match this filter.": "इस फ़िल्टर से कोई शिकायत मेल नहीं खाती।",
  "submitted anonymously, no identity on file": "गुमनाम रूप से प्रस्तुत, कोई पहचान दर्ज नहीं",
  submitted: "प्रस्तुत",
  "Escalated to case": "मामले में एस्केलेटेड",
  "AI Summary": "AI सारांश",
  "Summary pending...": "सारांश लंबित...",
  "Full complaint text": "पूर्ण शिकायत पाठ",
  "Complaint evidence": "शिकायत प्रमाण",
  "Review notes": "समीक्षा नोट्स",
  Triage: "ट्राइएज",
  "Escalate for field verification": "क्षेत्र सत्यापन हेतु एस्केलेट करें",
  "Why this warrants an inspection...": "यह निरीक्षण के योग्य क्यों है...",
  "Escalate to case": "मामले में एस्केलेट करें",
  Dismiss: "खारिज करें",
  "Reason for dismissal...": "खारिज करने का कारण...",
  "Dismiss complaint": "शिकायत खारिज करें",

  // ── Field reports (gov) ──────────────────────────────────────
  "Field reports": "क्षेत्र रिपोर्ट",
  "Reports filed by inspectors that aren’t tied to an existing case assignment.":
    "ऐसी रिपोर्टें जो निरीक्षकों द्वारा किसी मौजूदा मामले के कार्य से संबद्ध नहीं हैं।",
  "No standalone field reports yet.": "अभी कोई स्वतंत्र क्षेत्र रिपोर्ट नहीं है।",
  "Mark reviewed": "समीक्षित चिह्नित करें",

  // ── Contractors ──────────────────────────────────────────────
  "No contractors on file.": "कोई ठेकेदार दर्ज नहीं है।",
  "Related findings": "संबद्ध निष्कर्ष",
  "Open actions": "खुली कार्रवाइयाँ",
  "No findings linked yet.": "अभी कोई निष्कर्ष संबद्ध नहीं है।",

  // ── Audit ────────────────────────────────────────────────────
  "Audit Chain Integrity": "ऑडिट श्रृंखला अखंडता",
  "Chain verified": "श्रृंखला सत्यापित",
  "Integrity break detected": "अखंडता भंग पाई गई",
  "All {count} audit event(s) recomputed cleanly - each row's hash still matches its recorded content and the previous row's hash.":
    "सभी {count} ऑडिट घटनाओं की पुनर्गणना सफल रही - प्रत्येक पंक्ति का हैश उसकी दर्ज सामग्री और पिछली पंक्ति के हैश से अभी भी मेल खाता है।",
  "A mismatch was found at audit event #{id}. This event's stored hash no longer matches its content, or the chain to the previous event is broken - the underlying data has been altered or removed since it was written.":
    "ऑडिट घटना #{id} पर विसंगति पाई गई। इस घटना का संग्रहीत हैश अब उसकी सामग्री से मेल नहीं खाता, या पिछली घटना से श्रृंखला टूट गई है - लिखे जाने के बाद अंतर्निहित डेटा बदला या हटाया गया है।",
  "Every audit event’s hash is SHA-256 of its own content plus the previous event’s hash, computed at write time. Recomputing the whole chain and comparing it against what was stored is how tampering gets detected here - the app never updates or deletes an audit row itself. This detects tampering; it doesn’t prevent a privileged database user from editing rows directly.":
    "प्रत्येक ऑडिट घटना का हैश उसकी स्वयं की सामग्री और पिछली घटना के हैश का SHA-256 होता है, जो लेखन के समय गणना किया जाता है। पूरी श्रृंखला की पुनर्गणना करके उसे संग्रहीत मान से तुलना करना ही यहाँ छेड़छाड़ का पता लगाने का तरीका है - ऐप स्वयं कभी किसी ऑडिट पंक्ति को अपडेट या हटाता नहीं है। यह छेड़छाड़ का पता लगाता है; यह किसी विशेषाधिकार प्राप्त डेटाबेस उपयोगकर्ता को पंक्तियों को सीधे संपादित करने से नहीं रोकता।",

  // ── Notifications ────────────────────────────────────────────
  "No alerts.": "कोई सूचना नहीं।",
  "Mark read": "पढ़ा हुआ चिह्नित करें",

  // ── Evidence graph ───────────────────────────────────────────
  "Compliance Evidence Graph": "अनुपालन प्रमाण ग्राफ",
  Control: "नियंत्रण",
  Evidence: "प्रमाण",
  Observation: "अवलोकन",
  Risk: "जोखिम",
  Action: "कार्रवाई",
  Closure: "समापन",
  Verification: "सत्यापन",
  Audit: "ऑडिट",
  "1. Regulation / KoylaNiti Control": "1. विनियमन / KoylaNiti नियंत्रण",
  "No linked control.": "कोई संबद्ध नियंत्रण नहीं।",
  "2. Evidence / Document": "2. प्रमाण / दस्तावेज़",
  "No document-sourced evidence linked to this case.": "इस मामले से कोई दस्तावेज़-आधारित प्रमाण संबद्ध नहीं है।",
  "3. Field Observation": "3. क्षेत्र अवलोकन",
  "No field inspection submitted yet.": "अभी कोई क्षेत्र निरीक्षण प्रस्तुत नहीं किया गया है।",
  "pending sync": "सिंक लंबित",
  "4. Risk Score Contribution": "4. जोखिम स्कोर योगदान",
  "{count} finding(s) linked, contributing {points} point(s) of deduction":
    "{count} निष्कर्ष संबद्ध, {points} अंकों की कटौती में योगदान",
  "case severity": "मामले की गंभीरता",
  "5. Corrective Action": "5. सुधारात्मक कार्रवाई",
  status: "स्थिति",
  "assigned to": "को सौंपा गया",
  "user #": "उपयोगकर्ता #",
  "6. Closure Evidence": "6. समापन प्रमाण",
  "Closed.": "बंद।",
  "Not closed yet.": "अभी बंद नहीं हुआ।",
  "7. Authorized Verification": "7. अधिकृत सत्यापन",
  "Verified by": "द्वारा सत्यापित",
  on: "को",
  "Not verified yet.": "अभी सत्यापित नहीं हुआ।",
  "8. Audit Timeline": "8. ऑडिट समयरेखा",
  "No audit events yet.": "अभी कोई ऑडिट घटना नहीं है।",
  "Verify audit chain integrity": "ऑडिट श्रृंखला की अखंडता सत्यापित करें",

  // ── Risk panel ───────────────────────────────────────────────
  "Why is this high risk?": "यह उच्च जोखिम क्यों है?",
  "No open findings contributing to risk right now.":
    "अभी जोखिम में योगदान देने वाला कोई खुला निष्कर्ष नहीं है।",
  "Prototype risk assumptions — demonstration only.": "प्रोटोटाइप जोखिम धारणाएँ — केवल प्रदर्शन हेतु।",
  "AI/ML assists prioritisation; it does not decide legal compliance.":
    "AI/ML प्राथमिकता निर्धारण में सहायता करता है; यह कानूनी अनुपालन का निर्णय नहीं करता।",
  "{count} CRITICAL finding(s) currently open": "{count} गंभीर निष्कर्ष वर्तमान में खुले",

  // ── Error / misc ─────────────────────────────────────────────
  "Something went wrong": "कुछ गड़बड़ हो गई",
  "Try again": "पुनः प्रयास करें",
  "Something went wrong.": "कुछ गड़बड़ हो गई।",
  "Request failed ({status})": "अनुरोध विफल ({status})",
  "Select an inspector.": "एक निरीक्षक चुनें।",
  "Verified and resolved.": "सत्यापित और समाधित।",
  "Submission failed.": "प्रस्तुत करना विफल रहा।",

  // ── Map ──────────────────────────────────────────────────────
  "Score:": "स्कोर:",
  "View details": "विवरण देखें",
  "Loading map...": "मानचित्र लोड हो रहा है...",

  // ── Band / severity / status badges ─────────────────────────
  Unscored: "बिना स्कोर",
  GREEN: "हरा",
  YELLOW: "पीला",
  RED: "लाल",
  LOW: "कम",
  MEDIUM: "मध्यम",
  HIGH: "उच्च",
  CRITICAL: "गंभीर",
  DETECTED: "पता चला",
  TRIAGED: "ट्राइएज्ड",
  ASSIGNED: "सौंपा गया",
  "INSPECTION REMEDIATION": "निरीक्षण/सुधार",
  "EVIDENCE SUBMITTED": "प्रमाण प्रस्तुत",
  VERIFIED: "सत्यापित",
  CLOSED: "बंद",
  "VERIFICATION PENDING": "सत्यापन लंबित",
  OVERDUE: "अतिदेय",
};
