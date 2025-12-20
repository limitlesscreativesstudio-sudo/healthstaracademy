import { Question } from '@/types/examPrep';

export const cnaQuestions: Question[] = [
  // ========== PATIENT RIGHTS & ETHICAL RESPONSIBILITIES (12 questions) ==========
  {
    id: 1,
    category: 'patient-rights',
    scenario: "Mrs. Johnson, an 82-year-old resident, tells you she doesn't want to take her morning medication today.",
    stem: "What is the BEST action for the CNA to take?",
    options: {
      A: "Tell her she must take the medication because the doctor ordered it",
      B: "Crush the medication and hide it in her food",
      C: "Respect her decision and report it to the nurse",
      D: "Skip documenting her refusal to avoid getting her in trouble"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "Residents have the right to refuse treatment, including medications. The CNA must respect this decision while ensuring proper reporting to the nurse for documentation and follow-up care planning.",
      incorrectA: "Forcing or coercing a resident to take medication violates their right to refuse treatment.",
      incorrectB: "Hiding medication in food without consent is deceptive and violates the resident's rights and trust.",
      incorrectD: "All refusals must be documented; failure to document is a violation of care standards."
    },
    cdphReference: "Title 22, Section 72527 - Resident Rights",
    keywords: ['patient rights', 'medication refusal', 'respect', 'autonomy'],
    difficulty: 'easy'
  },
  {
    id: 2,
    category: 'patient-rights',
    scenario: "You overhear two CNAs in the break room discussing a resident's HIV diagnosis.",
    stem: "What should you do in this situation?",
    options: {
      A: "Join the conversation to learn more about the resident's condition",
      B: "Remind them that discussing resident information in public areas violates confidentiality",
      C: "Ignore it since you're not participating in the conversation",
      D: "Tell the resident what you heard"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "CNAs have a duty to protect resident confidentiality and should remind colleagues when violations occur. This helps maintain HIPAA compliance and protects resident privacy.",
      incorrectA: "Joining the conversation would make you complicit in the privacy violation.",
      incorrectC: "Witnessing a violation and not addressing it makes you partly responsible for allowing it to continue.",
      incorrectD: "This could cause unnecessary distress to the resident without resolving the underlying issue."
    },
    cdphReference: "HIPAA Privacy Rule; Title 22, Section 72527(a)(9)",
    keywords: ['confidentiality', 'HIPAA', 'privacy', 'professional conduct'],
    difficulty: 'medium'
  },
  {
    id: 3,
    category: 'patient-rights',
    scenario: "Mr. Williams wants to wear his own clothes instead of a hospital gown.",
    stem: "How should the CNA respond to this request?",
    options: {
      A: "Tell him facility rules require hospital gowns",
      B: "Allow him to wear his own clothes as this is his right",
      C: "Report him to the nurse for being difficult",
      D: "Compromise by letting him wear his clothes only on weekends"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Residents have the right to wear their own clothing. This supports dignity, personal identity, and autonomy as outlined in resident rights.",
      incorrectA: "Facilities cannot require hospital gowns unless there's a medical necessity.",
      incorrectC: "Exercising personal rights is not being 'difficult' - this attitude violates resident-centered care.",
      incorrectD: "This arbitrary restriction has no basis and still violates the resident's rights."
    },
    cdphReference: "Title 22, Section 72527(a)(6) - Personal possessions",
    keywords: ['dignity', 'personal choice', 'clothing', 'autonomy'],
    difficulty: 'easy'
  },
  {
    id: 4,
    category: 'patient-rights',
    scenario: "A resident's family member asks you for details about another resident they saw in the hallway.",
    stem: "What is the appropriate response?",
    options: {
      A: "Share basic information since the family member seems concerned",
      B: "Politely explain that you cannot share information about other residents",
      C: "Direct them to that resident's room so they can ask directly",
      D: "Tell them to ask the administrator"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "HIPAA regulations prohibit sharing any resident information with unauthorized individuals. The polite refusal protects confidentiality while maintaining professional relationships.",
      incorrectA: "Even 'basic' information is protected under HIPAA.",
      incorrectC: "This could lead to unwanted contact and still implies acknowledgment of the resident.",
      incorrectD: "While redirecting to administration isn't wrong, directly explaining confidentiality is more appropriate."
    },
    cdphReference: "HIPAA Privacy Rule",
    keywords: ['confidentiality', 'HIPAA', 'family', 'information sharing'],
    difficulty: 'easy'
  },
  {
    id: 5,
    category: 'patient-rights',
    scenario: "Mrs. Chen expresses her wish to participate in making decisions about her daily care routine.",
    stem: "Which response by the CNA best supports person-centered care?",
    options: {
      A: "Explain that healthcare professionals know what's best for her",
      B: "Tell her the schedule is set and cannot be changed",
      C: "Ask her about her preferences and incorporate them into her care plan",
      D: "Suggest she discuss it with her family instead"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "Person-centered care prioritizes the resident's preferences, values, and participation in their own care. Asking about and incorporating preferences demonstrates respect for autonomy.",
      incorrectA: "This paternalistic approach ignores the resident's right to participate in care decisions.",
      incorrectB: "Rigid schedules that ignore resident preferences violate person-centered care principles.",
      incorrectD: "The resident has the right to be directly involved in their care decisions."
    },
    cdphReference: "Title 22, Section 72527 - Person-centered care requirements",
    keywords: ['person-centered care', 'autonomy', 'preferences', 'participation'],
    difficulty: 'medium'
  },
  {
    id: 6,
    category: 'patient-rights',
    scenario: "A resident's adult daughter demands to see her mother's medical records without the mother's consent.",
    stem: "What should the CNA do?",
    options: {
      A: "Show her the records since she's family",
      B: "Explain that records cannot be released without the resident's authorization",
      C: "Make copies and give them to her discreetly",
      D: "Tell her the records are confidential but describe the contents verbally"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Medical records cannot be released without proper authorization from the resident (or their legal healthcare proxy). Family relationship alone does not authorize access.",
      incorrectA: "Being family does not automatically grant access to medical records.",
      incorrectC: "This is a serious HIPAA violation that could result in legal consequences.",
      incorrectD: "Verbal disclosure of record contents is still a privacy violation."
    },
    cdphReference: "HIPAA Privacy Rule - Access to Medical Records",
    keywords: ['medical records', 'authorization', 'family', 'HIPAA'],
    difficulty: 'medium'
  },
  {
    id: 7,
    category: 'patient-rights',
    scenario: "You notice that a resident is being excluded from activities by other residents due to her cultural background.",
    stem: "What action should the CNA take?",
    options: {
      A: "Mind your own business as this is between residents",
      B: "Tell the excluded resident to try harder to fit in",
      C: "Report the situation to the nurse and support the resident",
      D: "Confront the other residents aggressively"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "All residents have the right to be free from discrimination and to participate in activities. Reporting ensures appropriate intervention while supporting the resident shows empathy.",
      incorrectA: "CNAs have a duty to protect residents from discrimination and social harm.",
      incorrectB: "This blames the victim and fails to address the discrimination.",
      incorrectD: "Aggressive confrontation could escalate the situation and is unprofessional."
    },
    cdphReference: "Title 22, Section 72527(a)(1) - Freedom from discrimination",
    keywords: ['discrimination', 'cultural sensitivity', 'resident rights', 'inclusion'],
    difficulty: 'medium'
  },
  {
    id: 8,
    category: 'patient-rights',
    scenario: "A resident asks you to mail a personal letter for him. Your supervisor says personal errands aren't allowed.",
    stem: "How should you handle this situation?",
    options: {
      A: "Refuse the request and tell the resident it's not your job",
      B: "Explain the policy and help him find an alternative way to mail his letter",
      C: "Mail it secretly so your supervisor doesn't find out",
      D: "Throw away the letter since you can't mail it"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "While following facility policies, the CNA should still assist residents in meeting their needs. Helping find alternatives shows problem-solving while respecting both the resident and facility rules.",
      incorrectA: "This dismissive response doesn't help the resident meet a reasonable need.",
      incorrectC: "Going against supervisor instructions creates trust issues and could lead to discipline.",
      incorrectD: "Destroying personal property is theft and a serious violation."
    },
    cdphReference: "Title 22, Section 72527(a)(6) - Personal rights",
    keywords: ['personal needs', 'problem-solving', 'facility policy', 'resident assistance'],
    difficulty: 'easy'
  },
  {
    id: 9,
    category: 'patient-rights',
    scenario: "A resident tells you she wants to file a complaint about her care but is afraid of retaliation.",
    stem: "What is the BEST response?",
    options: {
      A: "Tell her it's probably not worth the trouble",
      B: "Assure her that retaliation is prohibited and help her access the complaint process",
      C: "Promise to fix the problem yourself so she doesn't need to complain",
      D: "Suggest she wait until she's discharged to file the complaint"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Residents have the right to file grievances without fear of retaliation. CNAs should support this right and help residents navigate the complaint process.",
      incorrectA: "This discourages the resident from exercising her rights and may allow problems to continue.",
      incorrectC: "Some issues require formal reporting and may be beyond the CNA's scope to resolve.",
      incorrectD: "Delaying complaints may prevent timely resolution and could affect other residents."
    },
    cdphReference: "Title 22, Section 72527(a)(10) - Right to file grievances",
    keywords: ['grievances', 'complaints', 'retaliation', 'resident rights'],
    difficulty: 'medium'
  },
  {
    id: 10,
    category: 'patient-rights',
    scenario: "A resident's roommate is watching TV loudly late at night, disturbing the other resident's sleep.",
    stem: "What should the CNA do?",
    options: {
      A: "Tell the resident who is trying to sleep to use earplugs",
      B: "Turn off the TV without asking since it's late",
      C: "Mediate a solution that respects both residents' rights",
      D: "Report both residents for not getting along"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "Both residents have rights - one to entertainment and the other to rest. The CNA should help find a compromise, such as using headphones or adjusting the volume.",
      incorrectA: "This only addresses one resident's needs and ignores the issue.",
      incorrectB: "Residents have the right to make choices about entertainment; unilateral action violates this.",
      incorrectD: "This is not a disciplinary matter but a normal roommate situation requiring mediation."
    },
    cdphReference: "Title 22, Section 72527 - Resident accommodations",
    keywords: ['roommate', 'conflict resolution', 'compromise', 'resident rights'],
    difficulty: 'medium'
  },
  {
    id: 11,
    category: 'patient-rights',
    scenario: "A resident with dementia keeps trying to leave the facility. Staff have been told to keep him inside.",
    stem: "Which approach BEST balances safety with resident rights?",
    options: {
      A: "Lock the resident in his room",
      B: "Use physical restraints to prevent him from leaving",
      C: "Use redirection techniques and engage him in activities",
      D: "Ignore him when he tries to leave"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "Redirection and engagement are person-centered approaches that address the underlying need (often boredom or anxiety) while maintaining safety without restricting rights.",
      incorrectA: "Locking a resident in their room is false imprisonment and a serious rights violation.",
      incorrectB: "Physical restraints require physician orders and are a last resort; they violate the right to be free from restraints.",
      incorrectD: "Ignoring wandering creates serious safety risks."
    },
    cdphReference: "Title 22, Section 72527(a)(5) - Freedom from restraints",
    keywords: ['dementia', 'wandering', 'redirection', 'restraint-free care'],
    difficulty: 'hard'
  },
  {
    id: 12,
    category: 'patient-rights',
    scenario: "A resident's family is visiting during your scheduled personal care time for that resident.",
    stem: "What is the BEST approach?",
    options: {
      A: "Ask the family to leave immediately so you can complete your tasks",
      B: "Skip the personal care for today since family is visiting",
      C: "Ask the resident their preference and adjust your schedule if possible",
      D: "Perform the personal care with the family present"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "The resident has the right to receive visitors AND the right to privacy during care. Asking their preference respects autonomy and allows for flexible scheduling.",
      incorrectA: "This prioritizes tasks over the resident's right to visitors and family time.",
      incorrectB: "Necessary care should not be skipped; it can be rescheduled.",
      incorrectD: "This violates privacy unless the resident specifically consents."
    },
    cdphReference: "Title 22, Section 72527(a)(7) - Right to visitors",
    keywords: ['family visits', 'privacy', 'flexibility', 'scheduling'],
    difficulty: 'easy'
  },

  // ========== INFECTION CONTROL & STANDARD PRECAUTIONS (15 questions) ==========
  {
    id: 13,
    category: 'infection-control',
    scenario: "You are about to enter a resident's room that has a Contact Precautions sign on the door.",
    stem: "Which PPE should you put on BEFORE entering the room?",
    options: {
      A: "Only gloves",
      B: "Gown and gloves",
      C: "N95 respirator and gloves",
      D: "Face shield only"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Contact Precautions require gown and gloves to prevent transmission of organisms spread by direct or indirect contact with the patient or their environment.",
      incorrectA: "Gloves alone don't protect clothing from contamination during contact precautions.",
      incorrectC: "N95 respirators are for Airborne Precautions, not Contact Precautions.",
      incorrectD: "Face shields protect against splashes, not contact transmission."
    },
    cdphReference: "CDC Standard Precautions Guidelines",
    keywords: ['contact precautions', 'PPE', 'gown', 'gloves', 'isolation'],
    difficulty: 'easy'
  },
  {
    id: 14,
    category: 'infection-control',
    scenario: "You are performing hand hygiene before providing care to a resident.",
    stem: "When using alcohol-based hand rub, how long should you rub your hands together?",
    options: {
      A: "5 seconds",
      B: "At least 20 seconds or until dry",
      C: "1 minute",
      D: "10 seconds"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Alcohol-based hand rubs should be applied to all surfaces of the hands and rubbed together for at least 20 seconds or until the hands are completely dry, whichever is longer.",
      incorrectA: "Five seconds is insufficient for proper disinfection.",
      incorrectC: "One minute is longer than necessary; hands should be dry well before then.",
      incorrectD: "Ten seconds may not allow sufficient contact time for the alcohol to work."
    },
    cdphReference: "CDC Hand Hygiene Guidelines",
    keywords: ['hand hygiene', 'hand sanitizer', 'alcohol-based hand rub', 'infection prevention'],
    difficulty: 'easy'
  },
  {
    id: 15,
    category: 'infection-control',
    scenario: "While assisting a resident with oral care, you accidentally get splashed with saliva.",
    stem: "This incident highlights the importance of which infection control practice?",
    options: {
      A: "Using sterile technique for all procedures",
      B: "Wearing appropriate PPE including eye protection when splashing is possible",
      C: "Only performing oral care when the resident is calm",
      D: "Using a stronger mouthwash"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Standard Precautions require anticipating potential exposure to body fluids and wearing appropriate PPE, including eye protection when splashing is likely.",
      incorrectA: "Oral care uses clean technique, not sterile technique.",
      incorrectC: "While resident cooperation helps, PPE is the primary protection.",
      incorrectD: "The type of mouthwash doesn't affect splash exposure risk."
    },
    cdphReference: "OSHA Bloodborne Pathogen Standard",
    keywords: ['PPE', 'eye protection', 'body fluids', 'splash', 'standard precautions'],
    difficulty: 'medium'
  },
  {
    id: 16,
    category: 'infection-control',
    scenario: "You are caring for a resident who has been diagnosed with active tuberculosis (TB).",
    stem: "Which type of isolation precautions should be in place?",
    options: {
      A: "Contact Precautions",
      B: "Droplet Precautions",
      C: "Airborne Precautions",
      D: "Protective Isolation"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "Tuberculosis is spread through airborne transmission via tiny droplet nuclei that can remain suspended in the air. Airborne Precautions require a negative pressure room and N95 respirators.",
      incorrectA: "Contact Precautions are for organisms spread by touch, not airborne particles.",
      incorrectB: "Droplet Precautions are for larger droplets that fall quickly; TB particles remain airborne.",
      incorrectD: "Protective Isolation protects the patient from infections, not the staff."
    },
    cdphReference: "CDC Airborne Precautions Guidelines; TB Prevention Guidelines",
    keywords: ['tuberculosis', 'TB', 'airborne precautions', 'N95', 'negative pressure'],
    difficulty: 'medium'
  },
  {
    id: 17,
    category: 'infection-control',
    scenario: "After removing your gloves following patient care, you notice a small tear in one glove.",
    stem: "What should you do immediately?",
    options: {
      A: "Continue with your next task since the care is already done",
      B: "Wash your hands thoroughly and report the incident",
      C: "Apply hand sanitizer and move on",
      D: "Put on new gloves over your hands without washing"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "A torn glove represents a potential exposure. Immediate hand washing removes any contamination, and reporting allows for proper documentation and follow-up if needed.",
      incorrectA: "Potential exposure must be addressed and documented.",
      incorrectC: "Hand washing is preferred when potential contamination has occurred.",
      incorrectD: "Hands must be cleaned before putting on new gloves."
    },
    cdphReference: "OSHA Bloodborne Pathogen Standard; Exposure Control",
    keywords: ['glove tear', 'exposure', 'hand washing', 'incident reporting'],
    difficulty: 'medium'
  },
  {
    id: 18,
    category: 'infection-control',
    scenario: "You are about to assist with a sterile dressing change. You notice the sterile package is damaged.",
    stem: "What action should you take?",
    options: {
      A: "Use the supplies since they're still inside the package",
      B: "Obtain a new sterile package and discard the damaged one",
      C: "Ask the nurse if it's okay to use",
      D: "Apply extra antiseptic to compensate for possible contamination"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "A damaged package compromises sterility. The supplies must be considered contaminated and replaced with a new sterile package.",
      incorrectA: "Damaged packaging means sterility cannot be guaranteed.",
      incorrectC: "This is a basic infection control principle; the answer is clear without needing approval.",
      incorrectD: "Antiseptic cannot restore sterility to contaminated supplies."
    },
    cdphReference: "Sterile Technique Guidelines",
    keywords: ['sterile technique', 'contamination', 'sterile field', 'infection control'],
    difficulty: 'easy'
  },
  {
    id: 19,
    category: 'infection-control',
    scenario: "A new CNA asks you when hand washing with soap and water is preferred over hand sanitizer.",
    stem: "What is the CORRECT answer?",
    options: {
      A: "Hand sanitizer is always preferred for convenience",
      B: "When hands are visibly soiled or after caring for patients with C. diff",
      C: "Only before eating lunch",
      D: "Hand washing is outdated; sanitizer is always better"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Soap and water is required when hands are visibly dirty, after using the restroom, and specifically for Clostridioides difficile (C. diff) which has spores resistant to alcohol.",
      incorrectA: "Convenience should not override proper infection control practices.",
      incorrectC: "Hand hygiene is required throughout the workday, not just before meals.",
      incorrectD: "Hand washing remains essential for specific situations."
    },
    cdphReference: "CDC Hand Hygiene in Healthcare Settings",
    keywords: ['hand washing', 'hand sanitizer', 'C. diff', 'Clostridioides difficile'],
    difficulty: 'medium'
  },
  {
    id: 20,
    category: 'infection-control',
    scenario: "You need to dispose of a used sharp needle after giving a diabetic resident their insulin (under nurse supervision).",
    stem: "Where should the needle be disposed of?",
    options: {
      A: "In the regular trash can",
      B: "In a designated sharps container",
      C: "Recap it first, then place in sharps container",
      D: "Give it to the nurse to dispose of"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Used needles must be immediately placed in puncture-resistant sharps containers. These containers are red or labeled and prevent needlestick injuries.",
      incorrectA: "Sharps in regular trash create serious injury risks for housekeeping staff.",
      incorrectC: "Recapping needles increases the risk of needlestick injury and is prohibited.",
      incorrectD: "Sharps should be disposed of immediately by the person who used them."
    },
    cdphReference: "OSHA Bloodborne Pathogen Standard",
    keywords: ['sharps disposal', 'needlestick prevention', 'sharps container', 'safety'],
    difficulty: 'easy'
  },
  {
    id: 21,
    category: 'infection-control',
    scenario: "A resident on Droplet Precautions needs to be transported to the radiology department.",
    stem: "What precautions should be taken during transport?",
    options: {
      A: "The resident should wear an N95 respirator",
      B: "The resident should wear a surgical mask",
      C: "Only the CNA needs to wear a mask",
      D: "No precautions are needed during transport"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "During transport, the resident should wear a surgical mask to contain droplets they may produce. This protects others in common areas.",
      incorrectA: "N95 respirators are for airborne precautions and are worn by staff, not typically patients.",
      incorrectC: "The source (resident) should be masked to contain droplets.",
      incorrectD: "Precautions continue during transport to protect other residents and staff."
    },
    cdphReference: "CDC Droplet Precautions Guidelines",
    keywords: ['droplet precautions', 'transport', 'surgical mask', 'infection control'],
    difficulty: 'medium'
  },
  {
    id: 22,
    category: 'infection-control',
    scenario: "You are preparing to perform perineal care for a female resident.",
    stem: "In which direction should you clean?",
    options: {
      A: "Back to front",
      B: "Front to back",
      C: "Side to side",
      D: "Any direction is acceptable"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Cleaning front to back (from urinary meatus toward rectum) prevents fecal bacteria from contaminating the urinary tract and causing UTIs.",
      incorrectA: "Back to front introduces rectal bacteria to the urinary area, causing infection.",
      incorrectC: "Side to side doesn't properly prevent contamination.",
      incorrectD: "Direction matters significantly for infection prevention."
    },
    cdphReference: "Perineal Care Procedure Guidelines",
    keywords: ['perineal care', 'UTI prevention', 'hygiene', 'female care'],
    difficulty: 'easy'
  },
  {
    id: 23,
    category: 'infection-control',
    scenario: "You enter a resident's room and see that the biohazard bag is almost full.",
    stem: "What is the appropriate action?",
    options: {
      A: "Push the contents down to make more room",
      B: "Seal the bag when it's 2/3 to 3/4 full and replace it",
      C: "Wait until the bag is completely full before replacing",
      D: "Transfer contents to a regular trash bag"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Biohazard bags should be sealed and replaced when 2/3 to 3/4 full to prevent overflow and ensure safe handling.",
      incorrectA: "Pushing down contents increases exposure risk and can puncture the bag.",
      incorrectC: "Overfilling makes bags difficult and unsafe to handle.",
      incorrectD: "Biohazard waste must remain in designated biohazard containers."
    },
    cdphReference: "Biohazard Waste Management Guidelines",
    keywords: ['biohazard', 'waste disposal', 'infection control', 'safety'],
    difficulty: 'easy'
  },
  {
    id: 24,
    category: 'infection-control',
    scenario: "A resident coughs directly in your face while you're providing care without a mask.",
    stem: "This situation could have been prevented by:",
    options: {
      A: "Standing farther away from the resident",
      B: "Wearing a mask when providing close care, especially to residents with respiratory symptoms",
      C: "Asking the resident to hold their breath",
      D: "Completing tasks faster"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Standard Precautions recommend wearing masks when close contact may result in exposure to respiratory secretions. This protects the CNA from infection.",
      incorrectA: "Standing farther away isn't practical when providing close personal care.",
      incorrectC: "Residents, especially those who are ill, cannot control coughing.",
      incorrectD: "Rushing increases errors and doesn't prevent exposure."
    },
    cdphReference: "CDC Standard Precautions",
    keywords: ['respiratory exposure', 'mask', 'standard precautions', 'protection'],
    difficulty: 'easy'
  },
  {
    id: 25,
    category: 'infection-control',
    scenario: "You notice a coworker preparing to provide care without performing hand hygiene first.",
    stem: "What should you do?",
    options: {
      A: "Mind your own business",
      B: "Report them to the administrator immediately",
      C: "Politely remind them about hand hygiene",
      D: "Make a note to tell the nurse later"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "A collegial reminder supports infection control and helps maintain good practices. Immediate feedback is more effective than delayed reporting for minor issues.",
      incorrectA: "Ignoring infection control violations puts residents at risk.",
      incorrectB: "Immediate formal reporting for a first minor offense isn't proportionate; a reminder is appropriate.",
      incorrectD: "Delayed reporting doesn't prevent the immediate risk."
    },
    cdphReference: "Infection Control Program Requirements",
    keywords: ['hand hygiene', 'teamwork', 'infection control', 'communication'],
    difficulty: 'easy'
  },
  {
    id: 26,
    category: 'infection-control',
    scenario: "You are preparing to measure a resident's blood pressure. The blood pressure cuff is soiled.",
    stem: "What should you do before using the cuff?",
    options: {
      A: "Use it anyway since time is limited",
      B: "Wipe it with a paper towel",
      C: "Clean and disinfect the cuff according to facility policy",
      D: "Ask another CNA to use their cuff"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "Equipment should be cleaned between patients to prevent cross-contamination. Following facility policy ensures proper disinfection.",
      incorrectA: "Using soiled equipment can transmit infections between residents.",
      incorrectB: "A paper towel doesn't disinfect the equipment.",
      incorrectD: "Another CNA's cuff may also need cleaning; the issue isn't about which cuff but proper cleaning."
    },
    cdphReference: "Equipment Cleaning and Disinfection Guidelines",
    keywords: ['equipment cleaning', 'disinfection', 'cross-contamination', 'blood pressure'],
    difficulty: 'easy'
  },
  {
    id: 27,
    category: 'infection-control',
    scenario: "A resident has MRSA (Methicillin-resistant Staphylococcus aureus) colonization in a wound.",
    stem: "Which type of precautions should be used?",
    options: {
      A: "Airborne Precautions",
      B: "Droplet Precautions",
      C: "Contact Precautions",
      D: "Standard Precautions only"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "MRSA is transmitted through direct contact with infected wounds or contaminated surfaces. Contact Precautions (gown and gloves) prevent spread.",
      incorrectA: "MRSA is not transmitted through the air.",
      incorrectB: "MRSA is not transmitted through respiratory droplets.",
      incorrectD: "MRSA requires Contact Precautions in addition to Standard Precautions."
    },
    cdphReference: "CDC MDRO Guidelines; Contact Precautions",
    keywords: ['MRSA', 'contact precautions', 'drug-resistant organisms', 'isolation'],
    difficulty: 'medium'
  },

  // ========== SAFETY & EMERGENCY PROCEDURES (14 questions) ==========
  {
    id: 28,
    category: 'safety-emergency',
    scenario: "You discover a fire in the utility room of your unit.",
    stem: "Using the RACE protocol, what should you do FIRST?",
    options: {
      A: "Attempt to put out the fire",
      B: "Activate the fire alarm",
      C: "Rescue anyone in immediate danger",
      D: "Close doors and windows"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "RACE stands for Rescue, Alarm, Contain, Extinguish. The first priority is always to rescue anyone in immediate danger from the fire.",
      incorrectA: "Extinguishing is the last step in RACE, only if safe to do so.",
      incorrectB: "Activating the alarm (A) comes after rescue (R).",
      incorrectD: "Containing the fire (C) comes third after rescue and alarm."
    },
    cdphReference: "Fire Safety Protocol - RACE",
    keywords: ['fire safety', 'RACE', 'emergency', 'rescue'],
    difficulty: 'easy'
  },
  {
    id: 29,
    category: 'safety-emergency',
    scenario: "You are operating a fire extinguisher to put out a small fire in a trash can.",
    stem: "Using the PASS technique, what does the 'A' stand for?",
    options: {
      A: "Activate",
      B: "Aim at the base of the fire",
      C: "Apply pressure",
      D: "Advance toward the fire"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "PASS stands for Pull the pin, Aim at the base of the fire, Squeeze the handle, and Sweep side to side. Aiming at the base attacks the fuel source.",
      incorrectA: "There is no 'Activate' step in PASS.",
      incorrectC: "There is no 'Apply pressure' step in PASS.",
      incorrectD: "There is no 'Advance' step in PASS."
    },
    cdphReference: "Fire Extinguisher Training - PASS Method",
    keywords: ['fire extinguisher', 'PASS', 'fire safety', 'emergency'],
    difficulty: 'easy'
  },
  {
    id: 30,
    category: 'safety-emergency',
    scenario: "A resident who uses a wheelchair is trying to reach something on a high shelf.",
    stem: "To prevent a fall, the CNA should:",
    options: {
      A: "Let the resident try, as it promotes independence",
      B: "Get the item for the resident or provide a safe reaching device",
      C: "Move the wheelchair closer to the shelf",
      D: "Suggest the resident stand up to reach it"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "The CNA should assist by getting the item or providing safe tools. This prevents falls while still helping the resident meet their goal.",
      incorrectA: "Reaching from a wheelchair creates a serious fall risk.",
      incorrectC: "This doesn't address the unsafe reaching behavior.",
      incorrectD: "If the resident uses a wheelchair, standing may not be safe."
    },
    cdphReference: "Fall Prevention Guidelines",
    keywords: ['fall prevention', 'wheelchair safety', 'assistance', 'reaching'],
    difficulty: 'easy'
  },
  {
    id: 31,
    category: 'safety-emergency',
    scenario: "A resident is choking on food and cannot speak, cough, or breathe.",
    stem: "What action should the CNA take immediately?",
    options: {
      A: "Perform back blows only",
      B: "Call for help and perform abdominal thrusts (Heimlich maneuver)",
      C: "Give the resident water to wash down the food",
      D: "Wait to see if the resident can clear it themselves"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "A complete airway obstruction requires immediate intervention with abdominal thrusts while calling for help. This is a life-threatening emergency.",
      incorrectA: "Back blows alone (for conscious adults) are combined with abdominal thrusts in current guidelines.",
      incorrectC: "Giving fluids to someone with an obstructed airway can worsen the blockage.",
      incorrectD: "If they cannot cough, speak, or breathe, they cannot clear it themselves."
    },
    cdphReference: "American Red Cross First Aid Guidelines",
    keywords: ['choking', 'Heimlich maneuver', 'airway obstruction', 'emergency'],
    difficulty: 'easy'
  },
  {
    id: 32,
    category: 'safety-emergency',
    scenario: "You notice that a resident's side rails are up on both sides of the bed.",
    stem: "This may be considered a restraint if:",
    options: {
      A: "The resident requests them for comfort",
      B: "They restrict the resident's freedom of movement",
      C: "They are ordered by the physician",
      D: "The resident can lower them independently"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Any device that restricts freedom of movement can be considered a restraint. Full side rails on both sides that the resident cannot lower constitute restraint.",
      incorrectA: "Even if requested, full bilateral side rails may still be classified as restraints.",
      incorrectC: "Physician orders don't change the classification; they may authorize restraint use with proper criteria.",
      incorrectD: "If the resident can lower them independently, they are not considered restraints."
    },
    cdphReference: "CMS Restraint and Seclusion Guidelines",
    keywords: ['restraints', 'side rails', 'freedom of movement', 'patient rights'],
    difficulty: 'medium'
  },
  {
    id: 33,
    category: 'safety-emergency',
    scenario: "During a power outage, the emergency generator lights come on but the elevator stops working.",
    stem: "What should the CNA do for residents who need to be evacuated from upper floors?",
    options: {
      A: "Wait for the elevator to be repaired",
      B: "Follow the facility evacuation plan for using stairwells",
      C: "Have residents jump from windows",
      D: "Move residents to the elevator lobby to wait"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Facility evacuation plans include procedures for using stairwells and specialized equipment for residents who cannot walk. Following the plan ensures safe evacuation.",
      incorrectA: "In emergencies, you cannot wait for repairs.",
      incorrectC: "This would cause serious harm or death.",
      incorrectD: "Gathering near a non-working elevator doesn't help evacuation."
    },
    cdphReference: "Emergency Evacuation Procedures",
    keywords: ['evacuation', 'emergency', 'power outage', 'stairwell'],
    difficulty: 'medium'
  },
  {
    id: 34,
    category: 'safety-emergency',
    scenario: "A resident fell in the hallway and is lying on the floor. They appear conscious but confused.",
    stem: "What is the FIRST action the CNA should take?",
    options: {
      A: "Help them stand up immediately",
      B: "Stay with the resident, call for help, and avoid moving them",
      C: "Go get a wheelchair to move them",
      D: "Document the fall first"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "After a fall, the resident should not be moved until assessed for injuries. The CNA should stay with them for safety and call for the nurse to assess.",
      incorrectA: "Moving them before assessment could worsen injuries like fractures.",
      incorrectC: "Leaving the resident alone is unsafe; assessment must come before moving.",
      incorrectD: "Documentation comes after immediate care and assessment."
    },
    cdphReference: "Fall Response Protocol",
    keywords: ['fall response', 'assessment', 'emergency', 'injury prevention'],
    difficulty: 'easy'
  },
  {
    id: 35,
    category: 'safety-emergency',
    scenario: "You are walking a resident to the dining room when they begin to feel dizzy and weak.",
    stem: "What should you do FIRST?",
    options: {
      A: "Tell them to walk faster to get to a chair",
      B: "Lower the resident to the nearest safe surface (chair or floor) and call for help",
      C: "Leave them to get a wheelchair",
      D: "Give them something to drink"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "When a resident feels faint, immediately lower them to prevent a fall-related injury. Stay with them and call for assistance.",
      incorrectA: "Rushing increases fall risk when someone is already dizzy.",
      incorrectC: "Never leave a dizzy resident alone.",
      incorrectD: "Assessment is needed first; the resident may have restrictions on oral intake."
    },
    cdphReference: "Fall Prevention and Response",
    keywords: ['dizziness', 'fall prevention', 'emergency response', 'safety'],
    difficulty: 'easy'
  },
  {
    id: 36,
    category: 'safety-emergency',
    scenario: "A tornado warning has been issued for your area.",
    stem: "Where should residents be moved for safety?",
    options: {
      A: "Near windows to see the storm",
      B: "To interior rooms on the lowest floor, away from windows",
      C: "Outside to the parking lot",
      D: "To the top floor for better visibility"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "During tornadoes, interior rooms on the lowest floor provide the most protection from flying debris. Windows are dangerous.",
      incorrectA: "Windows can shatter and cause serious injuries.",
      incorrectC: "Being outside during a tornado is extremely dangerous.",
      incorrectD: "Upper floors are more exposed to tornado damage."
    },
    cdphReference: "Severe Weather Emergency Procedures",
    keywords: ['tornado', 'severe weather', 'evacuation', 'safety'],
    difficulty: 'easy'
  },
  {
    id: 37,
    category: 'safety-emergency',
    scenario: "A resident's call light has been going on frequently. You notice they seem anxious and keep calling about minor things.",
    stem: "What is the BEST approach to this situation?",
    options: {
      A: "Disconnect the call light so they stop bothering you",
      B: "Ignore some calls since they're not real emergencies",
      C: "Investigate the underlying cause of anxiety and provide reassurance",
      D: "Tell them to only use the call light for emergencies"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "Frequent call light use often indicates unmet emotional or physical needs. Investigating and addressing the root cause provides person-centered care.",
      incorrectA: "Disconnecting call lights is never acceptable; it's a safety violation.",
      incorrectB: "All calls should be answered; you can't predict which might be urgent.",
      incorrectD: "This may make the resident afraid to call when there's a real emergency."
    },
    cdphReference: "Person-Centered Care; Safety Standards",
    keywords: ['call light', 'anxiety', 'person-centered care', 'safety'],
    difficulty: 'medium'
  },
  {
    id: 38,
    category: 'safety-emergency',
    scenario: "You notice a wet spill in the hallway near the elevator.",
    stem: "What should you do immediately?",
    options: {
      A: "Walk around it carefully and continue with your tasks",
      B: "Post a caution sign, block the area if possible, and clean it up or report it immediately",
      C: "Yell a warning to people passing by",
      D: "Wait for housekeeping to find it"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Wet floors are serious fall hazards. Immediate action includes warning others (caution sign/barrier) and either cleaning it or reporting for immediate cleanup.",
      incorrectA: "Leaving the spill creates a hazard for others.",
      incorrectC: "Yelling is unprofessional and not an effective warning system.",
      incorrectD: "Waiting could lead to a fall injury."
    },
    cdphReference: "Environmental Safety Standards",
    keywords: ['wet floor', 'fall hazard', 'environmental safety', 'spill'],
    difficulty: 'easy'
  },
  {
    id: 39,
    category: 'safety-emergency',
    scenario: "A confused resident is trying to climb out of bed repeatedly despite being at high risk for falls.",
    stem: "Which intervention is MOST appropriate?",
    options: {
      A: "Apply a vest restraint to keep them in bed",
      B: "Use a bed alarm and increase monitoring frequency",
      C: "Raise all four side rails",
      D: "Sedate the resident with medication"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Bed alarms alert staff when the resident attempts to get up, allowing intervention. Increased monitoring addresses the behavior without restraint.",
      incorrectA: "Restraints require physician orders and strict criteria; they're not first-line interventions.",
      incorrectC: "Four raised side rails are considered restraints.",
      incorrectD: "CNAs cannot administer sedatives; chemical restraint requires specific orders and criteria."
    },
    cdphReference: "Fall Prevention; Restraint Reduction Guidelines",
    keywords: ['fall prevention', 'bed alarm', 'restraint alternatives', 'confused resident'],
    difficulty: 'medium'
  },
  {
    id: 40,
    category: 'safety-emergency',
    scenario: "You receive a bomb threat phone call at the nurses' station.",
    stem: "What should you do during the call?",
    options: {
      A: "Hang up immediately and call 911",
      B: "Keep the caller talking, note details, and signal for help",
      C: "Tell the caller you don't believe them",
      D: "Immediately evacuate the building"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "During a bomb threat call, try to keep the caller talking to gather information (location, time, description) while signaling a coworker to call authorities.",
      incorrectA: "Hanging up loses opportunity to gather information that could help locate the threat.",
      incorrectC: "Challenging the caller could antagonize them.",
      incorrectD: "Evacuation decisions are made by authorities after assessment."
    },
    cdphReference: "Bomb Threat Response Procedures",
    keywords: ['bomb threat', 'emergency', 'security', 'phone threat'],
    difficulty: 'hard'
  },
  {
    id: 41,
    category: 'safety-emergency',
    scenario: "A resident is receiving oxygen therapy and their family member takes out a lighter to light a candle for a birthday celebration.",
    stem: "What should the CNA do immediately?",
    options: {
      A: "Let them light the candle since it's a special occasion",
      B: "Immediately stop them and explain that open flames are prohibited near oxygen",
      C: "Leave the room to avoid the situation",
      D: "Suggest they light the candle quickly"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Oxygen supports combustion, making fires spread faster and burn hotter. Open flames are strictly prohibited near oxygen therapy. Immediate intervention is required.",
      incorrectA: "Special occasions don't override safety rules.",
      incorrectC: "CNAs must intervene in dangerous situations.",
      incorrectD: "There is no safe way to use open flames near oxygen."
    },
    cdphReference: "Oxygen Safety Guidelines",
    keywords: ['oxygen safety', 'fire hazard', 'open flame', 'oxygen therapy'],
    difficulty: 'easy'
  },

  // ========== BASIC NURSING SKILLS (16 questions) ==========
  {
    id: 42,
    category: 'basic-nursing',
    scenario: "You're assisting Mr. Chen, who has left-sided weakness from a stroke, to transfer from bed to wheelchair.",
    stem: "What is the FIRST action you should take?",
    options: {
      A: "Lock the wheelchair brakes",
      B: "Position the wheelchair at a 45-degree angle to the bed",
      C: "Assess Mr. Chen's ability to assist with the transfer",
      D: "Apply a gait belt around Mr. Chen's waist"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "Always assess the resident's capabilities first (CDPH emphasizes initial assessment). This determines how much assistance is needed and ensures safety.",
      incorrectA: "Locking brakes is important but comes AFTER assessment.",
      incorrectB: "Positioning wheelchair is important but comes AFTER assessment.",
      incorrectD: "Gait belt application comes AFTER assessment and determination of need."
    },
    cdphReference: "Title 22, Section 72527 - Requires assessment before any procedure",
    keywords: ['transfer', 'assessment', 'stroke', 'wheelchair', 'left-sided weakness'],
    difficulty: 'medium'
  },
  {
    id: 43,
    category: 'basic-nursing',
    scenario: "You are helping a resident who has weakness on the right side to put on a button-down shirt.",
    stem: "Which arm should be dressed FIRST?",
    options: {
      A: "The left (stronger) arm first",
      B: "The right (weaker) arm first",
      C: "Either arm is acceptable",
      D: "Start with the dominant hand"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "When dressing, the affected (weaker) extremity is dressed first because it has less range of motion. When undressing, the stronger side is removed first.",
      incorrectA: "Dressing the stronger arm first makes it harder to maneuver the garment onto the weaker arm.",
      incorrectC: "Proper technique requires dressing the weaker side first.",
      incorrectD: "Dominance doesn't determine dressing order; weakness does."
    },
    cdphReference: "Dressing Assistance Procedures",
    keywords: ['dressing', 'affected side', 'weakness', 'ADL assistance'],
    difficulty: 'easy'
  },
  {
    id: 44,
    category: 'basic-nursing',
    scenario: "A resident is ordered to have intake and output (I&O) measured.",
    stem: "Which item should be included in the intake measurement?",
    options: {
      A: "Solid food only",
      B: "All fluids taken by mouth, IV fluids, and tube feedings",
      C: "Only water and juice",
      D: "Only IV fluids"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Intake includes ALL sources of fluid: oral intake (beverages, soups, ice chips, gelatin), IV fluids, and tube feeding formula.",
      incorrectA: "Solid food is not measured for I&O; only fluids count.",
      incorrectC: "All oral fluids count, not just water and juice.",
      incorrectD: "Oral and enteral fluids must also be counted."
    },
    cdphReference: "Intake and Output Documentation Guidelines",
    keywords: ['intake and output', 'I&O', 'fluid measurement', 'documentation'],
    difficulty: 'easy'
  },
  {
    id: 45,
    category: 'basic-nursing',
    scenario: "You are about to perform mouth care on an unconscious resident.",
    stem: "How should you position the resident?",
    options: {
      A: "Flat on their back",
      B: "On their side with the head slightly lowered",
      C: "Sitting upright",
      D: "Prone (face down)"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Side-lying position with head slightly lowered allows fluids to drain from the mouth, preventing aspiration. Unconscious residents cannot protect their airway.",
      incorrectA: "Flat positioning increases aspiration risk.",
      incorrectC: "Unconscious residents cannot maintain a sitting position.",
      incorrectD: "Prone position prevents access to the mouth."
    },
    cdphReference: "Oral Care Procedures for Unconscious Patients",
    keywords: ['oral care', 'unconscious', 'positioning', 'aspiration prevention'],
    difficulty: 'medium'
  },
  {
    id: 46,
    category: 'basic-nursing',
    scenario: "You notice a resident's urinary drainage bag is hanging on the side rail above the level of the bladder.",
    stem: "What should you do?",
    options: {
      A: "Leave it since someone else placed it there",
      B: "Lower the bag below the level of the bladder",
      C: "Empty the bag immediately",
      D: "Clamp the tubing"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Urinary drainage bags must always be kept below bladder level to prevent backflow of urine into the bladder, which can cause infection.",
      incorrectA: "Incorrect positioning must be corrected regardless of who placed it.",
      incorrectC: "Emptying doesn't address the positioning problem.",
      incorrectD: "Clamping prevents drainage and isn't the solution."
    },
    cdphReference: "Catheter Care Guidelines",
    keywords: ['urinary catheter', 'drainage bag', 'infection prevention', 'positioning'],
    difficulty: 'easy'
  },
  {
    id: 47,
    category: 'basic-nursing',
    scenario: "You are assisting a resident to use a bedpan.",
    stem: "Which action is CORRECT?",
    options: {
      A: "Place the bedpan flat end toward the resident's back",
      B: "Leave the room to give privacy and don't check on them",
      C: "Position the bedpan with curved end toward the back and raise the head of the bed slightly",
      D: "Keep the bed flat at all times"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "The curved/rounded end goes toward the back. Raising the head of bed slightly (if allowed) positions the pelvis correctly and mimics natural elimination position.",
      incorrectA: "The flat end should face forward, toward the resident's feet.",
      incorrectB: "Privacy is important but residents should have the call light and be checked on periodically.",
      incorrectD: "Slight elevation assists with elimination if not contraindicated."
    },
    cdphReference: "Bedpan Assistance Procedure",
    keywords: ['bedpan', 'elimination', 'positioning', 'toileting'],
    difficulty: 'easy'
  },
  {
    id: 48,
    category: 'basic-nursing',
    scenario: "You need to apply elastic stockings (TED hose) to a resident.",
    stem: "When is the BEST time to apply them?",
    options: {
      A: "Right after the resident has been walking",
      B: "In the morning before the resident gets out of bed",
      C: "In the evening before bedtime",
      D: "After the resident has been sitting for an hour"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "TED hose should be applied in the morning before getting up, when legs have had the least amount of dependent swelling (blood/fluid pooling).",
      incorrectA: "After walking, there's increased circulation and possible swelling.",
      incorrectC: "Evening application is less effective as legs may be swollen.",
      incorrectD: "Sitting causes blood to pool in legs, making stockings harder to apply and less effective."
    },
    cdphReference: "Anti-Embolism Stocking Application",
    keywords: ['TED hose', 'elastic stockings', 'DVT prevention', 'circulation'],
    difficulty: 'easy'
  },
  {
    id: 49,
    category: 'basic-nursing',
    scenario: "A resident has a new order for a clear liquid diet.",
    stem: "Which food item is allowed on a clear liquid diet?",
    options: {
      A: "Cream of wheat",
      B: "Milk",
      C: "Gelatin (Jell-O)",
      D: "Orange juice with pulp"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "Clear liquids are transparent and leave minimal residue. Gelatin, broth, clear juices (apple, grape), tea, and coffee are examples.",
      incorrectA: "Cream of wheat is a solid food, not a clear liquid.",
      incorrectB: "Milk is a full liquid, not a clear liquid.",
      incorrectD: "Juice with pulp is not clear; only strained juices qualify."
    },
    cdphReference: "Dietary Modifications Guidelines",
    keywords: ['clear liquid diet', 'diet types', 'nutrition', 'food service'],
    difficulty: 'easy'
  },
  {
    id: 50,
    category: 'basic-nursing',
    scenario: "You are making an occupied bed with the resident lying in it.",
    stem: "Where should you stand while making the bed?",
    options: {
      A: "At the foot of the bed",
      B: "On one side, then move to the other side",
      C: "Wherever is most comfortable for you",
      D: "At the head of the bed only"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Make half the bed from one side, then move to the other side to complete the bed. This allows proper body mechanics and complete bed making without overreaching.",
      incorrectA: "Working from the foot doesn't allow proper access to the entire bed.",
      incorrectC: "Proper technique requires systematic side-to-side approach.",
      incorrectD: "Working only from the head prevents complete bed making."
    },
    cdphReference: "Bed Making Procedures",
    keywords: ['occupied bed', 'bed making', 'body mechanics', 'comfort'],
    difficulty: 'easy'
  },
  {
    id: 51,
    category: 'basic-nursing',
    scenario: "You are emptying a resident's urinary drainage bag and measuring the output.",
    stem: "Where should you record this measurement?",
    options: {
      A: "On a sticky note at the bedside",
      B: "Tell the nurse verbally only",
      C: "On the resident's intake and output record",
      D: "In your personal notebook"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "Output must be documented on the official I&O record, which becomes part of the medical record and allows the healthcare team to monitor fluid balance.",
      incorrectA: "Sticky notes are not official documentation and can be lost.",
      incorrectB: "Verbal-only reporting is not sufficient; written documentation is required.",
      incorrectD: "Personal notebooks are not part of official medical records."
    },
    cdphReference: "Documentation Standards",
    keywords: ['output', 'documentation', 'I&O', 'medical record'],
    difficulty: 'easy'
  },
  {
    id: 52,
    category: 'basic-nursing',
    scenario: "You are assisting a resident with denture care.",
    stem: "How should dentures be handled during cleaning?",
    options: {
      A: "Hold them firmly over a hard surface",
      B: "Hold them over a basin of water or towel to prevent breakage if dropped",
      C: "Clean them while they remain in the resident's mouth",
      D: "Use hot water for thorough cleaning"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Dentures are fragile and expensive. Holding them over water or a soft surface (towel) cushions any accidental drops.",
      incorrectA: "Hard surfaces will break dentures if dropped.",
      incorrectC: "Dentures should be removed for proper cleaning.",
      incorrectD: "Hot water can warp dentures; use cool or lukewarm water."
    },
    cdphReference: "Denture Care Procedures",
    keywords: ['denture care', 'oral care', 'handling', 'cleaning'],
    difficulty: 'easy'
  },
  {
    id: 53,
    category: 'basic-nursing',
    scenario: "A resident with dysphagia (difficulty swallowing) is scheduled to receive medications.",
    stem: "What is the MOST important consideration?",
    options: {
      A: "Give medications with plenty of thin liquids",
      B: "Follow the care plan for modified diet consistency and positioning",
      C: "Crush all medications and mix with pudding",
      D: "Have the resident swallow quickly to avoid choking"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Dysphagia care plans specify texture modifications and positioning (often upright) to prevent aspiration. Not all medications can be crushed.",
      incorrectA: "Thin liquids may be restricted for residents with dysphagia.",
      incorrectC: "Some medications cannot be crushed (extended-release, enteric-coated); nurse must authorize.",
      incorrectD: "Rushing increases choking risk."
    },
    cdphReference: "Dysphagia Management Guidelines",
    keywords: ['dysphagia', 'swallowing difficulty', 'aspiration precautions', 'medications'],
    difficulty: 'medium'
  },
  {
    id: 54,
    category: 'basic-nursing',
    scenario: "You are providing a bed bath to a resident.",
    stem: "In what order should you wash the resident's body?",
    options: {
      A: "Back, arms, chest, legs, perineal area, face",
      B: "Face, arms, chest, abdomen, legs, back, perineal area",
      C: "Perineal area first, then work upward",
      D: "Any order is acceptable"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Bathing proceeds from cleanest to dirtiest areas: face, upper body, extremities, back, and perineal area last to prevent contamination.",
      incorrectA: "Starting with the back skips cleaner areas.",
      incorrectC: "Washing perineal area first would spread contamination to cleaner areas.",
      incorrectD: "Proper sequence prevents cross-contamination."
    },
    cdphReference: "Bathing Procedures",
    keywords: ['bed bath', 'bathing sequence', 'hygiene', 'clean to dirty'],
    difficulty: 'easy'
  },
  {
    id: 55,
    category: 'basic-nursing',
    scenario: "A resident is on fluid restrictions of 1500 mL per day.",
    stem: "What does this mean for the CNA?",
    options: {
      A: "Give the resident as much fluid as they want to drink",
      B: "Limit fluid intake to 1500 mL across all shifts according to facility protocol",
      C: "Only restrict water intake, not other beverages",
      D: "This order only applies during mealtimes"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Fluid restrictions limit total intake (usually divided across shifts). The CNA must track all fluids and coordinate with the care team.",
      incorrectA: "This would exceed the restriction and could harm the resident.",
      incorrectC: "All fluids count toward the restriction.",
      incorrectD: "The restriction applies to all fluid intake, not just meals."
    },
    cdphReference: "Fluid Management Guidelines",
    keywords: ['fluid restriction', 'intake tracking', 'dietary orders', 'hydration'],
    difficulty: 'medium'
  },
  {
    id: 56,
    category: 'basic-nursing',
    scenario: "You are helping a resident get out of bed for the first time after surgery.",
    stem: "What is the CORRECT procedure?",
    options: {
      A: "Help them stand up quickly to avoid dizziness",
      B: "Have them sit on the edge of the bed (dangle) before standing",
      C: "Transfer directly from lying to standing",
      D: "Wait until they ask to get up"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Dangling allows the body to adjust to the upright position, prevents orthostatic hypotension, and allows assessment of dizziness before standing.",
      incorrectA: "Quick position changes increase dizziness and fall risk.",
      incorrectC: "Skipping the dangling step increases risk of orthostatic hypotension.",
      incorrectD: "Post-surgical mobility orders should be followed for recovery."
    },
    cdphReference: "Post-Operative Ambulation Guidelines",
    keywords: ['post-surgical', 'dangling', 'orthostatic hypotension', 'early ambulation'],
    difficulty: 'easy'
  },
  {
    id: 57,
    category: 'basic-nursing',
    scenario: "A resident who is receiving tube feedings begins to cough and turn red during the feeding.",
    stem: "What should the CNA do FIRST?",
    options: {
      A: "Speed up the feeding to finish quickly",
      B: "Stop the feeding immediately and call for the nurse",
      C: "Lower the head of the bed",
      D: "Continue the feeding and document the coughing"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Coughing during tube feeding may indicate aspiration or tube displacement. Stop immediately and alert the nurse for assessment.",
      incorrectA: "Continuing or speeding up increases aspiration risk.",
      incorrectC: "Lowering the head would increase aspiration risk.",
      incorrectD: "Continued feeding during distress is dangerous."
    },
    cdphReference: "Tube Feeding Safety Procedures",
    keywords: ['tube feeding', 'aspiration', 'emergency response', 'enteral nutrition'],
    difficulty: 'easy'
  },

  // ========== PERSONAL CARE SKILLS (13 questions) ==========
  {
    id: 58,
    category: 'personal-care',
    scenario: "You are helping a resident with their morning shower.",
    stem: "What should you check BEFORE having the resident get into the shower?",
    options: {
      A: "The color of the shower curtain",
      B: "The water temperature with a thermometer or your wrist",
      C: "Whether the TV is on in the room",
      D: "The time of the next meal"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Water temperature should be checked to prevent scalding. Use a thermometer (ideal: 105-110°F) or test with your inner wrist before the resident enters.",
      incorrectA: "Shower curtain color doesn't affect safety.",
      incorrectC: "TV status is unrelated to shower safety.",
      incorrectD: "While scheduling matters, safety checks are the priority before showering."
    },
    cdphReference: "Bathing Safety Guidelines",
    keywords: ['shower', 'water temperature', 'safety', 'scalding prevention'],
    difficulty: 'easy'
  },
  {
    id: 59,
    category: 'personal-care',
    scenario: "A resident with diabetes asks you to cut their toenails.",
    stem: "What is the appropriate response?",
    options: {
      A: "Cut the nails carefully with sharp scissors",
      B: "Explain that nail care for diabetics must be done by a licensed professional",
      C: "Cut the nails but file the edges",
      D: "Only cut the nails if they appear healthy"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Diabetic residents have poor circulation and healing. CNAs should NOT cut diabetic toenails due to infection and injury risks. This requires podiatry or nursing care.",
      incorrectA: "CNAs should not cut diabetic toenails regardless of tool used.",
      incorrectC: "Filing doesn't change the rule; diabetic foot care requires professionals.",
      incorrectD: "Appearance doesn't change the policy; all diabetic nail care is specialized."
    },
    cdphReference: "Diabetic Foot Care Guidelines",
    keywords: ['diabetes', 'nail care', 'foot care', 'scope of practice'],
    difficulty: 'medium'
  },
  {
    id: 60,
    category: 'personal-care',
    scenario: "You are helping a resident with long hair who has been on bed rest.",
    stem: "How should you care for their hair to prevent matting?",
    options: {
      A: "Brush vigorously from roots to ends",
      B: "Section and brush starting from the ends, working up to prevent tangles",
      C: "Suggest cutting it short",
      D: "Avoid brushing since it might hurt"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Brushing from ends to roots prevents pulling and pain. Sectioning makes the process manageable and prevents matting.",
      incorrectA: "Root-to-end brushing pulls on tangles and causes pain.",
      incorrectC: "Cutting hair requires resident consent and isn't the first solution.",
      incorrectD: "Avoiding brushing leads to severe matting, which is harder to manage."
    },
    cdphReference: "Hair Care Procedures",
    keywords: ['hair care', 'grooming', 'tangles', 'bed rest'],
    difficulty: 'easy'
  },
  {
    id: 61,
    category: 'personal-care',
    scenario: "A male resident needs help shaving. He normally uses an electric razor.",
    stem: "What should the CNA do FIRST before shaving?",
    options: {
      A: "Start shaving immediately to save time",
      B: "Check the care plan and ensure the razor is clean and functioning",
      C: "Switch to a safety razor for a closer shave",
      D: "Apply shaving cream to the face"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Check the care plan for any restrictions (e.g., blood thinners may require electric razors), then ensure equipment is clean and safe before use.",
      incorrectA: "Assessment and preparation must come before the procedure.",
      incorrectC: "Don't change shaving methods without checking the care plan; safety razors may be contraindicated.",
      incorrectD: "Electric razors don't require shaving cream."
    },
    cdphReference: "Shaving Assistance Procedures",
    keywords: ['shaving', 'grooming', 'care plan', 'electric razor'],
    difficulty: 'easy'
  },
  {
    id: 62,
    category: 'personal-care',
    scenario: "You notice a resident's skin is dry and flaky.",
    stem: "What is the BEST intervention?",
    options: {
      A: "Apply lotion after bathing and report to the nurse",
      B: "Scrub harder during bathing to remove the flakes",
      C: "Use very hot water to soften the skin",
      D: "Ignore it as it's just part of aging"
    },
    correctAnswer: 'A',
    explanation: {
      correct: "Lotion applied after bathing helps lock in moisture. Reporting allows the nurse to assess for underlying causes and adjust the care plan.",
      incorrectB: "Scrubbing can damage fragile skin.",
      incorrectC: "Hot water further dries out the skin.",
      incorrectD: "Skin changes should always be assessed and addressed."
    },
    cdphReference: "Skin Care Guidelines",
    keywords: ['dry skin', 'skin care', 'lotion', 'observation'],
    difficulty: 'easy'
  },
  {
    id: 63,
    category: 'personal-care',
    scenario: "A resident refuses to take a bath, saying they took one yesterday.",
    stem: "What is the BEST response?",
    options: {
      A: "Tell them bathing is mandatory and insist they bathe",
      B: "Respect their choice, offer alternatives like a sponge bath, and document",
      C: "Ignore them and proceed with the bath",
      D: "Tell the family to convince them"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Residents have the right to refuse care. Offer alternatives, document the refusal, and report to the nurse. Never force personal care.",
      incorrectA: "Residents cannot be forced to bathe.",
      incorrectC: "Proceeding without consent is a violation of rights.",
      incorrectD: "Family involvement is appropriate but doesn't override the resident's decision."
    },
    cdphReference: "Resident Rights; Bathing Care",
    keywords: ['refusal of care', 'resident rights', 'alternatives', 'documentation'],
    difficulty: 'easy'
  },
  {
    id: 64,
    category: 'personal-care',
    scenario: "You are helping a resident apply makeup as part of their grooming routine.",
    stem: "Why is this type of assistance important?",
    options: {
      A: "It's required by the facility",
      B: "It promotes dignity, self-esteem, and normalcy",
      C: "It makes your job easier",
      D: "It's only for special occasions"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Personal grooming preferences support dignity and quality of life. Helping with makeup respects individual identity and promotes emotional well-being.",
      incorrectA: "It's person-centered care, not a facility requirement.",
      incorrectC: "The focus is on resident benefit, not staff convenience.",
      incorrectD: "Daily personal care preferences should be honored routinely."
    },
    cdphReference: "Person-Centered Care; Dignity in Care",
    keywords: ['grooming', 'dignity', 'self-esteem', 'personal preferences'],
    difficulty: 'easy'
  },
  {
    id: 65,
    category: 'personal-care',
    scenario: "A resident with Parkinson's disease is having difficulty dressing due to tremors.",
    stem: "Which intervention would be MOST helpful?",
    options: {
      A: "Dress the resident completely without their participation",
      B: "Provide clothing with elastic waists and Velcro closures, and allow extra time",
      C: "Tell them to try harder to control their shaking",
      D: "Only provide robes since they're easier"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Adaptive clothing accommodates physical limitations while promoting independence. Extra time reduces frustration and allows participation.",
      incorrectA: "This removes the resident's independence unnecessarily.",
      incorrectC: "Tremors cannot be controlled by trying harder; this is insensitive.",
      incorrectD: "Residents have the right to wear regular clothing."
    },
    cdphReference: "Adaptive Clothing; Parkinson's Care",
    keywords: ['Parkinson\'s disease', 'adaptive clothing', 'independence', 'tremors'],
    difficulty: 'medium'
  },
  {
    id: 66,
    category: 'personal-care',
    scenario: "You notice a resident has body odor even though they bathed yesterday.",
    stem: "What should you do?",
    options: {
      A: "Ignore it to avoid embarrassing them",
      B: "Make a joke about it to lighten the mood",
      C: "Offer to help with freshening up and check for causes like soiled clothing",
      D: "Tell other staff members about it"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "Address hygiene needs discreetly with dignity. Check for causes (soiled clothes, incontinence) and offer assistance while respecting the resident's feelings.",
      incorrectA: "Ignoring hygiene needs doesn't serve the resident.",
      incorrectB: "Jokes about personal hygiene are unprofessional and hurtful.",
      incorrectD: "Discussing this with others violates dignity and privacy."
    },
    cdphReference: "Dignity in Personal Care",
    keywords: ['body odor', 'hygiene', 'dignity', 'incontinence'],
    difficulty: 'easy'
  },
  {
    id: 67,
    category: 'personal-care',
    scenario: "A resident wears glasses and hearing aids.",
    stem: "How should you help maintain these devices?",
    options: {
      A: "Clean them only when visibly dirty",
      B: "Clean glasses with tissues and store hearing aids in a drawer",
      C: "Clean glasses with proper lens cleaner and store hearing aids in their case with batteries removed if not used overnight",
      D: "Leave device care to the family"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "Proper cleaning preserves function. Glasses need appropriate cleaners; hearing aids need dry storage with batteries removed to prevent corrosion.",
      incorrectA: "Regular cleaning maintains function and hygiene.",
      incorrectB: "Tissues can scratch lenses; drawers aren't safe for hearing aids.",
      incorrectD: "CNAs are responsible for assisting with assistive device care."
    },
    cdphReference: "Assistive Device Care",
    keywords: ['glasses', 'hearing aids', 'assistive devices', 'maintenance'],
    difficulty: 'easy'
  },
  {
    id: 68,
    category: 'personal-care',
    scenario: "A resident wants to get dressed in clothes that don't match and seem inappropriate for the weather.",
    stem: "What should the CNA do?",
    options: {
      A: "Choose appropriate clothes for them",
      B: "Allow their choice but gently suggest adding a layer for warmth if needed",
      C: "Report it as a sign of confusion",
      D: "Tell them their outfit looks ridiculous"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Residents have the right to choose their clothing. Offer suggestions for safety (warmth) while respecting their choice. Style preferences are personal.",
      incorrectA: "This removes the resident's autonomy.",
      incorrectC: "Clothing choice alone isn't a sign of confusion; observe other behaviors.",
      incorrectD: "This is disrespectful and unprofessional."
    },
    cdphReference: "Resident Rights; Person-Centered Care",
    keywords: ['clothing choice', 'autonomy', 'dignity', 'weather appropriate'],
    difficulty: 'medium'
  },
  {
    id: 69,
    category: 'personal-care',
    scenario: "While assisting with a shower, the resident says the water is too cold.",
    stem: "What should you do?",
    options: {
      A: "Tell them the water is fine and continue",
      B: "Adjust the temperature according to their preference while ensuring it's safe",
      C: "End the shower immediately",
      D: "Add hot water without testing it first"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Comfort is important in bathing. Adjust water to the resident's preference while ensuring it remains safe (not too hot). The resident's perception matters.",
      incorrectA: "Dismissing comfort complaints ignores person-centered care.",
      incorrectC: "A temperature adjustment may be all that's needed.",
      incorrectD: "Always test water temperature to prevent scalding."
    },
    cdphReference: "Bathing Procedures; Safety",
    keywords: ['water temperature', 'comfort', 'bathing', 'safety'],
    difficulty: 'easy'
  },
  {
    id: 70,
    category: 'personal-care',
    scenario: "A resident from a different culture refuses to let you provide perineal care.",
    stem: "What is the BEST approach?",
    options: {
      A: "Tell them it must be done regardless of their feelings",
      B: "Ask about their concerns, offer same-gender caregiver if possible, and respect cultural needs",
      C: "Skip the care and don't document it",
      D: "Report them for being uncooperative"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Cultural sensitivity means understanding and accommodating preferences. Same-gender caregivers may be acceptable. Communication and respect build trust.",
      incorrectA: "Forcing care violates rights and cultural sensitivity.",
      incorrectC: "Care needs must be addressed; skipping and hiding it is negligent.",
      incorrectD: "Cultural preferences are not 'uncooperative' behavior."
    },
    cdphReference: "Cultural Competency; Resident Rights",
    keywords: ['cultural sensitivity', 'perineal care', 'preferences', 'respect'],
    difficulty: 'medium'
  },

  // ========== VITAL SIGNS & MEASUREMENTS (12 questions) ==========
  {
    id: 71,
    category: 'vital-signs',
    scenario: "You are about to take an oral temperature on a resident.",
    stem: "How long should the resident wait after drinking hot coffee before taking an oral temperature?",
    options: {
      A: "5 minutes",
      B: "15-20 minutes",
      C: "No waiting is necessary",
      D: "1 hour"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Hot or cold food/drinks affect oral temperature readings. Wait 15-20 minutes for the mouth to return to normal temperature.",
      incorrectA: "5 minutes isn't long enough for the mouth to normalize.",
      incorrectC: "Recent oral intake definitely affects temperature readings.",
      incorrectD: "1 hour is unnecessarily long."
    },
    cdphReference: "Temperature Measurement Guidelines",
    keywords: ['oral temperature', 'vital signs', 'accuracy', 'thermometer'],
    difficulty: 'easy'
  },
  {
    id: 72,
    category: 'vital-signs',
    scenario: "You count a resident's pulse for 30 seconds and count 36 beats.",
    stem: "What is the pulse rate per minute?",
    options: {
      A: "36 beats per minute",
      B: "72 beats per minute",
      C: "18 beats per minute",
      D: "60 beats per minute"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "If counting for 30 seconds, multiply by 2 to get the rate per minute: 36 × 2 = 72 beats per minute.",
      incorrectA: "This doesn't account for the full minute.",
      incorrectC: "This would be dividing instead of multiplying.",
      incorrectD: "The calculation doesn't yield 60."
    },
    cdphReference: "Pulse Measurement",
    keywords: ['pulse', 'vital signs', 'calculation', 'heart rate'],
    difficulty: 'easy'
  },
  {
    id: 73,
    category: 'vital-signs',
    scenario: "You notice a resident's pulse is irregular while taking it.",
    stem: "How should you measure an irregular pulse?",
    options: {
      A: "Count for 15 seconds and multiply by 4",
      B: "Count for a full 60 seconds",
      C: "Stop and estimate based on the first few beats",
      D: "Count for 30 seconds and multiply by 2"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Irregular pulses require a full 60-second count for accuracy because the rate varies from beat to beat.",
      incorrectA: "15 seconds is too short for irregular rhythms.",
      incorrectC: "Estimation doesn't provide accurate data.",
      incorrectD: "30 seconds may miss irregularities in the second half."
    },
    cdphReference: "Pulse Assessment Guidelines",
    keywords: ['irregular pulse', 'vital signs', 'arrhythmia', 'assessment'],
    difficulty: 'easy'
  },
  {
    id: 74,
    category: 'vital-signs',
    scenario: "You are taking a blood pressure reading and the first sound you hear is at 140 mmHg and the last sound is at 86 mmHg.",
    stem: "What is the blood pressure reading?",
    options: {
      A: "86/140",
      B: "140/86",
      C: "140 + 86 = 226",
      D: "140 - 86 = 54"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Blood pressure is recorded as systolic (first sound)/diastolic (last sound). The reading is 140/86 mmHg.",
      incorrectA: "This reverses the order; systolic is always written first.",
      incorrectC: "Blood pressure is not calculated by addition.",
      incorrectD: "Blood pressure is not calculated by subtraction."
    },
    cdphReference: "Blood Pressure Measurement",
    keywords: ['blood pressure', 'systolic', 'diastolic', 'vital signs'],
    difficulty: 'easy'
  },
  {
    id: 75,
    category: 'vital-signs',
    scenario: "A resident's blood pressure reading is 180/110 mmHg.",
    stem: "What should the CNA do?",
    options: {
      A: "Record it and take another reading after the resident rests for a while",
      B: "Report it to the nurse immediately as this is hypertensive",
      C: "Tell the resident to take their blood pressure medication",
      D: "Ignore it if the resident feels fine"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "A reading of 180/110 is severely elevated (hypertensive urgency). The nurse must be notified immediately for assessment and intervention.",
      incorrectA: "This reading requires immediate reporting, not just documentation.",
      incorrectC: "CNAs cannot advise on medications; the nurse must assess and intervene.",
      incorrectD: "High blood pressure can cause damage even when the resident feels fine."
    },
    cdphReference: "Abnormal Vital Signs Reporting",
    keywords: ['hypertension', 'vital signs', 'reporting', 'blood pressure'],
    difficulty: 'medium'
  },
  {
    id: 76,
    category: 'vital-signs',
    scenario: "You are measuring a resident's respirations.",
    stem: "What is the BEST way to count respirations without the resident changing their breathing pattern?",
    options: {
      A: "Tell the resident you're counting their breathing",
      B: "Count respirations while appearing to count the pulse",
      C: "Count only when the resident is asleep",
      D: "Ask the resident to breathe normally"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "When residents know their breathing is being observed, they may unconsciously change their pattern. Counting while appearing to take the pulse provides accurate results.",
      incorrectA: "Awareness changes breathing patterns.",
      incorrectC: "This isn't practical and sleep breathing differs from awake breathing.",
      incorrectD: "Simply asking doesn't prevent conscious alteration."
    },
    cdphReference: "Respiration Measurement Techniques",
    keywords: ['respirations', 'vital signs', 'accuracy', 'observation'],
    difficulty: 'easy'
  },
  {
    id: 77,
    category: 'vital-signs',
    scenario: "You are assigned to weigh a resident. They are wearing heavy shoes and a jacket.",
    stem: "What should you do?",
    options: {
      A: "Weigh them as they are and note the clothing",
      B: "Ask them to remove heavy clothing and shoes for accurate weight",
      C: "Estimate and subtract 5 pounds for clothing",
      D: "Weigh them and add extra weight"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "For accurate weights, residents should wear similar clothing each time (ideally light clothing) and remove heavy items like shoes and jackets.",
      incorrectA: "Heavy clothing skews the reading and makes comparisons inaccurate.",
      incorrectC: "Estimation is not an accurate method.",
      incorrectD: "Adding weight makes no sense; accuracy is the goal."
    },
    cdphReference: "Weight Measurement Guidelines",
    keywords: ['weight', 'measurement', 'accuracy', 'vital signs'],
    difficulty: 'easy'
  },
  {
    id: 78,
    category: 'vital-signs',
    scenario: "A resident has an IV in their right arm and a recent mastectomy on the left side.",
    stem: "Where should you take the blood pressure?",
    options: {
      A: "Right arm (the IV arm)",
      B: "Left arm (the mastectomy side)",
      C: "Neither arm; use the thigh or report to the nurse",
      D: "Either arm is acceptable"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "Blood pressure should not be taken on an arm with an IV (can affect flow) or on the mastectomy side (risk of lymphedema). Report to nurse for alternative site.",
      incorrectA: "IV sites are contraindicated for BP cuffs.",
      incorrectB: "Mastectomy side is contraindicated due to lymphedema risk.",
      incorrectD: "Both arms have contraindications."
    },
    cdphReference: "Blood Pressure Contraindications",
    keywords: ['blood pressure', 'IV', 'mastectomy', 'contraindications'],
    difficulty: 'medium'
  },
  {
    id: 79,
    category: 'vital-signs',
    scenario: "You are taking a rectal temperature on an infant.",
    stem: "How far should the thermometer be inserted?",
    options: {
      A: "2 inches",
      B: "1/2 inch",
      C: "1 inch",
      D: "Until resistance is felt"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "For infants, rectal thermometer insertion should only be about 1/2 inch to prevent injury to the delicate rectal tissue.",
      incorrectA: "2 inches is too deep and could cause injury.",
      incorrectC: "1 inch is too deep for an infant.",
      incorrectD: "Feeling resistance would mean insertion is too deep."
    },
    cdphReference: "Pediatric Temperature Measurement",
    keywords: ['rectal temperature', 'infant', 'safety', 'measurement'],
    difficulty: 'medium'
  },
  {
    id: 80,
    category: 'vital-signs',
    scenario: "A resident's oxygen saturation reading shows 88%.",
    stem: "What should the CNA do?",
    options: {
      A: "Document it and continue with other tasks",
      B: "Report it to the nurse immediately as this is below normal",
      C: "Adjust the resident's oxygen without telling the nurse",
      D: "Wait and recheck in an hour"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Normal oxygen saturation is 95-100%. A reading of 88% indicates hypoxemia and requires immediate nursing assessment.",
      incorrectA: "Low oxygen levels need immediate attention, not just documentation.",
      incorrectC: "CNAs cannot adjust oxygen settings without orders.",
      incorrectD: "Waiting could result in harm; this needs immediate assessment."
    },
    cdphReference: "Oxygen Saturation Monitoring",
    keywords: ['oxygen saturation', 'SpO2', 'hypoxemia', 'vital signs'],
    difficulty: 'easy'
  },
  {
    id: 81,
    category: 'vital-signs',
    scenario: "You are measuring a resident's height. They are unable to stand.",
    stem: "What method can be used to estimate height?",
    options: {
      A: "Guess based on appearance",
      B: "Ask the resident how tall they used to be",
      C: "Measure arm span or use bed measurement with appropriate technique",
      D: "Skip height measurement entirely"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "Arm span approximates height. Bed measurements or segmental measurements can also be used with proper technique for non-ambulatory residents.",
      incorrectA: "Guessing is not accurate or acceptable.",
      incorrectB: "Height changes with age; recalled height may be inaccurate.",
      incorrectD: "Height is needed for accurate medication dosing and nutritional assessment."
    },
    cdphReference: "Height Measurement Alternatives",
    keywords: ['height', 'measurement', 'non-ambulatory', 'estimation'],
    difficulty: 'medium'
  },
  {
    id: 82,
    category: 'vital-signs',
    scenario: "You are taking a resident's radial pulse.",
    stem: "Which fingers should you use to palpate the pulse?",
    options: {
      A: "Thumb",
      B: "Index and middle fingers",
      C: "Pinky finger",
      D: "All five fingers"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "The index and middle fingers are used to palpate pulses because they are sensitive but don't have strong pulses of their own that could be confused.",
      incorrectA: "The thumb has its own pulse that can be mistaken for the patient's pulse.",
      incorrectC: "The pinky lacks sensitivity for accurate pulse detection.",
      incorrectD: "Using all fingers doesn't isolate the pulse properly."
    },
    cdphReference: "Pulse Assessment Technique",
    keywords: ['radial pulse', 'palpation', 'technique', 'vital signs'],
    difficulty: 'easy'
  },

  // ========== NUTRITION & HYDRATION (11 questions) ==========
  {
    id: 83,
    category: 'nutrition-hydration',
    scenario: "You are assisting a resident who has difficulty swallowing to eat lunch.",
    stem: "What is the MOST important safety measure?",
    options: {
      A: "Have the resident lie flat to make swallowing easier",
      B: "Feed quickly so food doesn't get cold",
      C: "Ensure the resident is sitting upright (at least 90 degrees) during and after eating",
      D: "Give only liquids since they're easier to swallow"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "Upright positioning (90 degrees) uses gravity to assist swallowing and reduces aspiration risk. The resident should remain upright for 30-60 minutes after eating.",
      incorrectA: "Lying flat increases aspiration risk significantly.",
      incorrectB: "Rushing increases choking risk.",
      incorrectD: "Thin liquids may actually be harder for dysphagia patients; thickened liquids are often required."
    },
    cdphReference: "Feeding Assistance Guidelines; Aspiration Precautions",
    keywords: ['dysphagia', 'positioning', 'aspiration prevention', 'feeding'],
    difficulty: 'easy'
  },
  {
    id: 84,
    category: 'nutrition-hydration',
    scenario: "A resident on a diabetic diet asks for extra dessert after dinner.",
    stem: "What should the CNA do?",
    options: {
      A: "Give it to them since it's their choice",
      B: "Explain the dietary restriction and offer a diabetic-friendly alternative",
      C: "Tell them no and walk away",
      D: "Sneak them the dessert so no one knows"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Respect the resident's autonomy while providing education about their dietary needs. Offering alternatives shows care while promoting health.",
      incorrectA: "Diabetic diets are medically necessary; extra sugar can be harmful.",
      incorrectC: "This is dismissive and doesn't offer alternatives or explanation.",
      incorrectD: "Sneaking food violates the care plan and endangers the resident."
    },
    cdphReference: "Therapeutic Diet Management",
    keywords: ['diabetic diet', 'dietary restrictions', 'alternatives', 'resident choice'],
    difficulty: 'easy'
  },
  {
    id: 85,
    category: 'nutrition-hydration',
    scenario: "You notice a resident has eaten very little of their meal for the past three days.",
    stem: "What is the appropriate action?",
    options: {
      A: "Assume they're just not hungry and don't report it",
      B: "Force them to eat more at the next meal",
      C: "Document intake and report to the nurse for assessment",
      D: "Replace their meals with snacks only"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "Decreased appetite can indicate illness, depression, or other issues. Documentation provides data, and nurse notification ensures proper assessment.",
      incorrectA: "Poor intake over multiple days is a significant observation to report.",
      incorrectB: "Forcing food is never appropriate.",
      incorrectD: "Diet changes require assessment and orders, not independent CNA decisions."
    },
    cdphReference: "Nutritional Assessment and Reporting",
    keywords: ['poor appetite', 'documentation', 'reporting', 'nutrition'],
    difficulty: 'easy'
  },
  {
    id: 86,
    category: 'nutrition-hydration',
    scenario: "A resident who is visually impaired is receiving their meal tray.",
    stem: "How can you help them identify the food on their plate?",
    options: {
      A: "Just tell them to eat what's in front of them",
      B: "Feed them so they don't have to worry about finding food",
      C: "Use the clock method to describe food locations",
      D: "Mix all the food together so they can find it easily"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "The clock method describes food positions as if the plate were a clock face (e.g., 'meat at 6 o'clock, vegetables at 3 o'clock'). This promotes independence.",
      incorrectA: "This doesn't help the resident find or identify foods.",
      incorrectB: "If they can feed themselves with orientation, promote independence.",
      incorrectD: "Mixing food removes food textures and presentation; many residents find this unappealing."
    },
    cdphReference: "Feeding Assistance for Visually Impaired",
    keywords: ['visual impairment', 'clock method', 'independence', 'feeding'],
    difficulty: 'easy'
  },
  {
    id: 87,
    category: 'nutrition-hydration',
    scenario: "A resident is on a fluid restriction due to congestive heart failure.",
    stem: "Which items should be counted toward their fluid intake?",
    options: {
      A: "Only water",
      B: "All liquids including water, juice, soup, gelatin, and ice cream",
      C: "Only beverages served in cups",
      D: "Nothing that comes from the dietary department"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "All items that are liquid at room temperature count: water, juice, coffee, soup, gelatin, ice cream, popsicles, ice chips, etc.",
      incorrectA: "All fluids count, not just water.",
      incorrectC: "Food items that become liquid (gelatin, ice cream) also count.",
      incorrectD: "Many dietary items contain significant fluid."
    },
    cdphReference: "Fluid Intake Documentation",
    keywords: ['fluid restriction', 'intake', 'CHF', 'fluid balance'],
    difficulty: 'medium'
  },
  {
    id: 88,
    category: 'nutrition-hydration',
    scenario: "You are feeding a resident who has had a stroke affecting the right side of their face.",
    stem: "On which side of the mouth should you place food?",
    options: {
      A: "The right (affected) side",
      B: "The left (unaffected) side",
      C: "Alternate between both sides",
      D: "The middle of the mouth"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Food should be placed on the unaffected side where there is sensation and muscle control. This reduces choking and helps with chewing and swallowing.",
      incorrectA: "The affected side has reduced sensation and control, increasing choking risk.",
      incorrectC: "Avoid the affected side consistently.",
      incorrectD: "Direct placement on the unaffected side is more effective."
    },
    cdphReference: "Stroke Care and Feeding Assistance",
    keywords: ['stroke', 'feeding', 'affected side', 'unaffected side'],
    difficulty: 'medium'
  },
  {
    id: 89,
    category: 'nutrition-hydration',
    scenario: "A resident with dementia doesn't recognize food on their tray.",
    stem: "What can the CNA do to encourage eating?",
    options: {
      A: "Tell them they must eat or they'll be in trouble",
      B: "Use hand-over-hand technique and provide cues about eating",
      C: "Take the tray away since they don't want it",
      D: "Force-feed them to ensure adequate nutrition"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Hand-over-hand guidance (guiding their hand to food and mouth) and verbal cues can remind dementia patients of the eating process.",
      incorrectA: "Threats are never appropriate.",
      incorrectC: "Giving up without trying techniques removes nutrition opportunity.",
      incorrectD: "Force-feeding is never acceptable."
    },
    cdphReference: "Dementia Care; Feeding Assistance",
    keywords: ['dementia', 'feeding', 'hand-over-hand', 'cues'],
    difficulty: 'medium'
  },
  {
    id: 90,
    category: 'nutrition-hydration',
    scenario: "A resident refuses to drink water but you know they need to stay hydrated.",
    stem: "What is an appropriate intervention?",
    options: {
      A: "Add water secretly to their food",
      B: "Offer other fluids like juice, milk, or gelatin that they might prefer",
      C: "Tell them they have no choice and must drink water",
      D: "Document the refusal and do nothing else"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Offering alternatives respects preferences while meeting hydration needs. Many fluids contribute to hydration, not just water.",
      incorrectA: "Adding things secretly to food is deceptive.",
      incorrectC: "Forcing is never appropriate; offering alternatives is.",
      incorrectD: "Intervention should be attempted before accepting refusal."
    },
    cdphReference: "Hydration Promotion",
    keywords: ['hydration', 'fluid alternatives', 'preferences', 'refusal'],
    difficulty: 'easy'
  },
  {
    id: 91,
    category: 'nutrition-hydration',
    scenario: "A resident has thick, ropy secretions and difficulty swallowing thin liquids.",
    stem: "What type of liquid consistency would likely be ordered?",
    options: {
      A: "Thin liquids only",
      B: "Honey-thick or nectar-thick liquids",
      C: "Hot liquids only",
      D: "No liquids at all"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Thickened liquids (nectar, honey, or pudding-thick) move more slowly, giving more time for the swallow response and reducing aspiration risk.",
      incorrectA: "Thin liquids are often the most difficult for dysphagia patients.",
      incorrectC: "Temperature doesn't address the swallowing issue.",
      incorrectD: "Hydration is essential; liquids are provided in appropriate consistency."
    },
    cdphReference: "Dysphagia Diet Modifications",
    keywords: ['thickened liquids', 'dysphagia', 'aspiration', 'swallowing'],
    difficulty: 'medium'
  },
  {
    id: 92,
    category: 'nutrition-hydration',
    scenario: "A resident with a poor appetite says meals are too big and overwhelming.",
    stem: "What can the CNA suggest to the nurse?",
    options: {
      A: "Skip meals entirely",
      B: "Request smaller, more frequent meals or snacks",
      C: "Tell the resident to just eat faster",
      D: "Reduce fluid intake to leave room for food"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Smaller, more frequent meals can be less overwhelming and may result in better overall intake. This is a common intervention for poor appetite.",
      incorrectA: "Skipping meals reduces nutrition further.",
      incorrectC: "Speed doesn't address the feeling of being overwhelmed.",
      incorrectD: "Reducing fluids creates dehydration risk and doesn't solve the appetite issue."
    },
    cdphReference: "Nutrition Care Planning",
    keywords: ['poor appetite', 'small meals', 'nutrition', 'care planning'],
    difficulty: 'easy'
  },
  {
    id: 93,
    category: 'nutrition-hydration',
    scenario: "A resident has new dentures and is having difficulty eating.",
    stem: "What should the CNA do?",
    options: {
      A: "Tell them to take the dentures out while eating",
      B: "Offer softer foods and smaller bites while they adjust, and report to the nurse",
      C: "Feed them pureed foods only",
      D: "Suggest they don't eat until dentures feel better"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "New dentures require an adjustment period. Softer foods and smaller bites help. The nurse should be informed to monitor fit and nutrition.",
      incorrectA: "This defeats the purpose of dentures for eating.",
      incorrectC: "Pureed food may not be necessary; softer textures often suffice.",
      incorrectD: "Nutrition must be maintained during the adjustment period."
    },
    cdphReference: "Denture Care and Nutrition",
    keywords: ['dentures', 'eating difficulty', 'soft foods', 'adjustment'],
    difficulty: 'easy'
  },

  // ========== ELIMINATION & TOILETING (10 questions) ==========
  {
    id: 94,
    category: 'elimination',
    scenario: "A resident tells you they haven't had a bowel movement in 4 days.",
    stem: "What is the appropriate action?",
    options: {
      A: "Give them a laxative from the medication room",
      B: "Tell them it's probably nothing to worry about",
      C: "Report this to the nurse and document it",
      D: "Increase their fiber intake on your own"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "Constipation should be reported to the nurse for assessment and intervention. Documentation tracks bowel patterns for the care team.",
      incorrectA: "CNAs cannot give medications.",
      incorrectB: "Four days without a bowel movement is significant and needs assessment.",
      incorrectD: "Diet changes require orders; CNAs can't independently change diets."
    },
    cdphReference: "Bowel Elimination Monitoring",
    keywords: ['constipation', 'bowel movement', 'reporting', 'elimination'],
    difficulty: 'easy'
  },
  {
    id: 95,
    category: 'elimination',
    scenario: "You are caring for a resident with an indwelling urinary catheter.",
    stem: "How often should the catheter tubing be checked?",
    options: {
      A: "Only when emptying the bag",
      B: "Once per shift",
      C: "Regularly throughout the shift for kinks, position, and drainage",
      D: "Only if the resident complains"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "Catheter tubing should be checked frequently for kinks, proper positioning, and free drainage to prevent complications like infection or bladder distension.",
      incorrectA: "More frequent checks are needed.",
      incorrectB: "Once per shift is not frequent enough.",
      incorrectD: "Proactive monitoring prevents problems; don't wait for complaints."
    },
    cdphReference: "Catheter Care Guidelines",
    keywords: ['catheter', 'tubing', 'monitoring', 'drainage'],
    difficulty: 'easy'
  },
  {
    id: 96,
    category: 'elimination',
    scenario: "A resident with incontinence is embarrassed about frequent accidents.",
    stem: "How should the CNA respond?",
    options: {
      A: "Tell them it happens to everyone their age",
      B: "Treat them with dignity, provide prompt changes, and avoid drawing attention to accidents",
      C: "Suggest they drink less so accidents happen less often",
      D: "Put them in diapers without discussing it"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Dignity is essential. Handle accidents matter-of-factly without embarrassment, provide prompt care, and maintain privacy. This builds trust.",
      incorrectA: "This normalizes something that distresses them without offering support.",
      incorrectC: "Reducing fluids causes dehydration; incontinence has other solutions.",
      incorrectD: "Products should be discussed respectfully, using terms like 'briefs' not 'diapers.'"
    },
    cdphReference: "Incontinence Care; Dignity in Care",
    keywords: ['incontinence', 'dignity', 'embarrassment', 'personal care'],
    difficulty: 'easy'
  },
  {
    id: 97,
    category: 'elimination',
    scenario: "You notice that a resident's urine in the drainage bag is dark amber and has a strong odor.",
    stem: "What should you do?",
    options: {
      A: "Ignore it since urine varies in color",
      B: "Report it to the nurse as it may indicate dehydration or infection",
      C: "Empty the bag more frequently",
      D: "Add water to the drainage bag to dilute it"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Dark, concentrated urine with strong odor can indicate dehydration or UTI. The nurse needs to assess and may order tests or interventions.",
      incorrectA: "Significant changes in urine characteristics should be reported.",
      incorrectC: "Emptying doesn't address the underlying issue.",
      incorrectD: "Never add anything to a drainage bag; this would contaminate the specimen."
    },
    cdphReference: "Urinary Output Assessment",
    keywords: ['urine', 'dark urine', 'dehydration', 'UTI', 'observation'],
    difficulty: 'easy'
  },
  {
    id: 98,
    category: 'elimination',
    scenario: "A resident on the toilet calls out that they feel dizzy.",
    stem: "What should you do FIRST?",
    options: {
      A: "Tell them to take deep breaths and finish quickly",
      B: "Stay with them, have them lean forward, and call for help",
      C: "Leave to get a wheelchair",
      D: "Help them stand up immediately"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Never leave a dizzy resident. Have them lean forward (increases blood flow to brain), stay with them for safety, and call for assistance.",
      incorrectA: "They need immediate attention, not encouragement to hurry.",
      incorrectC: "Never leave a dizzy resident alone; they could fall.",
      incorrectD: "Standing may cause them to faint and fall."
    },
    cdphReference: "Toileting Safety",
    keywords: ['dizziness', 'toileting', 'safety', 'fall prevention'],
    difficulty: 'medium'
  },
  {
    id: 99,
    category: 'elimination',
    scenario: "A resident has an ostomy. They ask you to help change the ostomy bag.",
    stem: "What should the CNA know about this task?",
    options: {
      A: "CNAs never help with ostomy care",
      B: "It requires special training and should be performed following the care plan",
      C: "Just use regular plastic bags",
      D: "Refuse because it's too complicated"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "With proper training, CNAs can assist with ostomy care. Each resident has specific products and techniques in their care plan.",
      incorrectA: "Trained CNAs can assist with ostomy care.",
      incorrectC: "Special ostomy bags are required; regular bags are not appropriate.",
      incorrectD: "Refusal to perform trained duties is not acceptable."
    },
    cdphReference: "Ostomy Care Assistance",
    keywords: ['ostomy', 'training', 'care plan', 'specialized care'],
    difficulty: 'medium'
  },
  {
    id: 100,
    category: 'elimination',
    scenario: "A resident is starting a toileting schedule to help with bladder training.",
    stem: "What is the purpose of a toileting schedule?",
    options: {
      A: "To make the CNA's job easier",
      B: "To reduce incontinence by training the bladder to void at regular intervals",
      C: "To restrict bathroom visits",
      D: "To document how often they go"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Bladder training helps retrain the bladder to hold urine longer by establishing predictable voiding times, reducing incontinence episodes.",
      incorrectA: "The focus is resident benefit, not staff convenience.",
      incorrectC: "The goal is to assist with voiding, not restrict it.",
      incorrectD: "Documentation is a part, but the purpose is improving continence."
    },
    cdphReference: "Bladder Training Programs",
    keywords: ['bladder training', 'toileting schedule', 'incontinence', 'continence'],
    difficulty: 'easy'
  },
  {
    id: 101,
    category: 'elimination',
    scenario: "You are collecting a stool specimen from a resident.",
    stem: "Where should the specimen be collected from?",
    options: {
      A: "The toilet water",
      B: "A clean, dry container or specimen 'hat'",
      C: "A bedpan that has been used for urine collection",
      D: "The resident's brief or pad"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Stool specimens must be collected in a clean, dry container to prevent contamination. Toilet 'hats' fit under the seat for easy collection.",
      incorrectA: "Toilet water contaminates the specimen.",
      incorrectC: "Urine contamination invalidates the specimen.",
      incorrectD: "Briefs/pads absorb and contaminate the specimen."
    },
    cdphReference: "Specimen Collection Procedures",
    keywords: ['stool specimen', 'collection', 'contamination', 'specimen hat'],
    difficulty: 'easy'
  },
  {
    id: 102,
    category: 'elimination',
    scenario: "A resident asks for a bedpan but says they're embarrassed about the smell.",
    stem: "How can the CNA help with this concern?",
    options: {
      A: "Tell them it's natural and everyone deals with it",
      B: "Provide privacy, prompt removal, and use room deodorizer if available",
      C: "Keep the bedpan in the room for several hours",
      D: "Tell them to hold it until later"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Promptly removing waste, providing privacy, ensuring good ventilation, and using deodorizer helps maintain dignity and comfort.",
      incorrectA: "This doesn't address the resident's concern.",
      incorrectC: "Leaving waste in the room worsens odor and is undignified.",
      incorrectD: "Telling residents to 'hold it' can cause harm."
    },
    cdphReference: "Dignity in Elimination Care",
    keywords: ['dignity', 'odor', 'bedpan', 'privacy'],
    difficulty: 'easy'
  },
  {
    id: 103,
    category: 'elimination',
    scenario: "A male resident is having difficulty urinating while lying in bed.",
    stem: "What position might help him urinate more easily?",
    options: {
      A: "Flat on his back",
      B: "Standing at bedside or sitting upright if allowed",
      C: "Lying on his left side",
      D: "Prone position"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "For males, standing or sitting upright is a more natural voiding position. If medically permitted, assist to stand at bedside with a urinal.",
      incorrectA: "Lying flat makes voiding more difficult.",
      incorrectC: "Side-lying doesn't facilitate male voiding.",
      incorrectD: "Prone position is not appropriate for urination."
    },
    cdphReference: "Assisting with Urination",
    keywords: ['urination', 'positioning', 'male resident', 'voiding'],
    difficulty: 'easy'
  },

  // ========== RANGE OF MOTION & MOBILITY (13 questions) ==========
  {
    id: 104,
    category: 'mobility',
    scenario: "You are performing passive range of motion (ROM) exercises on a resident's leg.",
    stem: "What is the MOST important safety consideration?",
    options: {
      A: "Move the joint as far as it will go to increase flexibility",
      B: "Support the extremity and move joints gently within the resident's comfortable range",
      C: "Complete the exercises as quickly as possible",
      D: "Only exercise joints that the resident can move on their own"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Proper support prevents injury, and movement should be within comfortable range. Stop if the resident experiences pain.",
      incorrectA: "Forcing movement beyond comfortable range causes injury.",
      incorrectC: "Rushing increases injury risk.",
      incorrectD: "Passive ROM is specifically for joints the resident cannot move independently."
    },
    cdphReference: "Range of Motion Exercise Guidelines",
    keywords: ['ROM', 'passive exercise', 'support', 'safety'],
    difficulty: 'easy'
  },
  {
    id: 105,
    category: 'mobility',
    scenario: "A resident with left-sided weakness from a stroke is learning to walk with a cane.",
    stem: "On which side should the cane be used?",
    options: {
      A: "The weak (left) side",
      B: "The strong (right) side",
      C: "Either side is acceptable",
      D: "The cane should be held in both hands"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "The cane is used on the strong (unaffected) side to provide support when stepping with the weak leg. This distributes weight properly.",
      incorrectA: "Using the cane on the weak side doesn't provide proper support.",
      incorrectC: "Proper technique requires the cane on the strong side.",
      incorrectD: "Canes are designed for single-hand use."
    },
    cdphReference: "Ambulation with Assistive Devices",
    keywords: ['cane', 'stroke', 'ambulation', 'weak side'],
    difficulty: 'medium'
  },
  {
    id: 106,
    category: 'mobility',
    scenario: "You are using a mechanical lift to transfer a resident from bed to wheelchair.",
    stem: "What should you do BEFORE beginning the transfer?",
    options: {
      A: "Start the lift immediately to save time",
      B: "Check the lift for proper function, inspect the sling, and ensure you have adequate help",
      C: "Have the resident help by holding onto the lift",
      D: "Position the wheelchair at the head of the bed"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Equipment checks, sling inspection, and having adequate staff ensure a safe transfer. Mechanical lifts require proper setup and training.",
      incorrectA: "Rushing without checks can lead to equipment failure or injury.",
      incorrectC: "Residents should keep arms inside the sling for safety.",
      incorrectD: "Wheelchair should be positioned next to the bed, not at the head."
    },
    cdphReference: "Mechanical Lift Safety",
    keywords: ['mechanical lift', 'Hoyer lift', 'safety', 'equipment check'],
    difficulty: 'easy'
  },
  {
    id: 107,
    category: 'mobility',
    scenario: "A resident who has been on bed rest is getting up for the first time in several days.",
    stem: "What complication should you watch for?",
    options: {
      A: "Increased appetite",
      B: "Orthostatic hypotension (sudden drop in blood pressure)",
      C: "Improved strength",
      D: "Better sleep"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "After bed rest, the cardiovascular system may not adjust quickly to position changes, causing dizziness, lightheadedness, or fainting when getting up.",
      incorrectA: "Appetite change isn't directly related to first mobilization.",
      incorrectC: "Bed rest causes weakness, not improved strength.",
      incorrectD: "Sleep quality isn't the concern during mobilization."
    },
    cdphReference: "Post-Bedrest Mobilization",
    keywords: ['orthostatic hypotension', 'bed rest', 'mobilization', 'blood pressure'],
    difficulty: 'medium'
  },
  {
    id: 108,
    category: 'mobility',
    scenario: "A resident is learning to use a walker after hip replacement surgery.",
    stem: "In what sequence should the resident move when walking?",
    options: {
      A: "Walker, operated leg, non-operated leg",
      B: "Walker, non-operated leg, operated leg",
      C: "Both legs together, then walker",
      D: "Walker only, dragging both legs"
    },
    correctAnswer: 'A',
    explanation: {
      correct: "After hip replacement, the sequence is Walker → Operated (weaker) leg → Non-operated (stronger) leg. This provides maximum support for the surgical leg.",
      incorrectB: "The operated leg should move before the non-operated leg for proper support.",
      incorrectC: "Moving both legs together with a walker is unsafe.",
      incorrectD: "Dragging legs is not proper walker technique."
    },
    cdphReference: "Post-Surgical Ambulation",
    keywords: ['walker', 'hip replacement', 'ambulation', 'sequence'],
    difficulty: 'medium'
  },
  {
    id: 109,
    category: 'mobility',
    scenario: "You are turning a resident in bed and they say their shoulder hurts when you move their arm.",
    stem: "What should you do?",
    options: {
      A: "Continue turning since you need to reposition them",
      B: "Stop the movement, reposition gently, and report the pain to the nurse",
      C: "Ignore the pain since turning is necessary",
      D: "Give them pain medication"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Pain during movement should prompt you to stop, find a more comfortable position, and report to the nurse for assessment. Continuing could cause injury.",
      incorrectA: "Pain indicates a problem that needs attention.",
      incorrectC: "Pain is a warning signal and should never be ignored.",
      incorrectD: "CNAs cannot administer medications."
    },
    cdphReference: "Pain Management; Repositioning",
    keywords: ['pain', 'repositioning', 'reporting', 'gentle handling'],
    difficulty: 'easy'
  },
  {
    id: 110,
    category: 'mobility',
    scenario: "A resident is at risk for contractures due to prolonged immobility.",
    stem: "What are contractures?",
    options: {
      A: "Infections in the joints",
      B: "Permanent shortening of muscles and tendons causing joint stiffness",
      C: "Swelling of the extremities",
      D: "Skin breakdown over bony prominences"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Contractures occur when muscles and tendons shorten from lack of movement, causing permanent joint stiffness. ROM exercises help prevent them.",
      incorrectA: "Contractures are not infections.",
      incorrectC: "Swelling is edema, not contractures.",
      incorrectD: "Skin breakdown is a pressure ulcer, not a contracture."
    },
    cdphReference: "Contracture Prevention",
    keywords: ['contractures', 'immobility', 'ROM', 'prevention'],
    difficulty: 'easy'
  },
  {
    id: 111,
    category: 'mobility',
    scenario: "You are assisting a resident to stand using a gait belt.",
    stem: "Where should the gait belt be positioned?",
    options: {
      A: "Around the chest",
      B: "Around the waist over clothing, snug but allowing two fingers underneath",
      C: "Around the hips",
      D: "Around the thighs"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "The gait belt is worn at the waist over clothing. It should be snug enough to provide support but allow two fingers to fit underneath.",
      incorrectA: "Chest position can restrict breathing and doesn't provide proper support.",
      incorrectC: "Hip position doesn't provide adequate support for transfers.",
      incorrectD: "Thigh position doesn't provide support for standing."
    },
    cdphReference: "Gait Belt Usage",
    keywords: ['gait belt', 'transfer', 'positioning', 'safety'],
    difficulty: 'easy'
  },
  {
    id: 112,
    category: 'mobility',
    scenario: "A resident begins to fall while you are walking with them in the hallway.",
    stem: "What is the correct action?",
    options: {
      A: "Try to hold them upright at all costs",
      B: "Guide them gently to the floor to prevent injury",
      C: "Let go and call for help",
      D: "Lean them against the wall"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "When a fall is inevitable, guide the person gently to the floor to prevent injury. Protect their head and your own body using proper technique.",
      incorrectA: "Trying to completely stop a fall can injure both you and the resident.",
      incorrectC: "Letting go could result in uncontrolled fall and injury.",
      incorrectD: "Leaning against a wall is unstable and could result in sliding fall."
    },
    cdphReference: "Fall Response During Ambulation",
    keywords: ['fall', 'guided fall', 'injury prevention', 'ambulation'],
    difficulty: 'medium'
  },
  {
    id: 113,
    category: 'mobility',
    scenario: "A resident uses a wheelchair. You notice the footrests are in the down position while they are trying to stand.",
    stem: "What is the safety concern?",
    options: {
      A: "No concern - footrests should be down",
      B: "The resident could trip on the footrests and fall",
      C: "It makes the wheelchair look messy",
      D: "Footrests could hit other furniture"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Footrests must be moved out of the way (up or swung aside) before standing to prevent tripping. This is a common cause of wheelchair-related falls.",
      incorrectA: "Down footrests are a tripping hazard when standing.",
      incorrectC: "Appearance is not the concern; safety is.",
      incorrectD: "Furniture isn't the main concern; resident safety is."
    },
    cdphReference: "Wheelchair Safety",
    keywords: ['wheelchair', 'footrests', 'fall prevention', 'safety'],
    difficulty: 'easy'
  },
  {
    id: 114,
    category: 'mobility',
    scenario: "A resident asks to walk to the dining room, but their care plan states they should be in a wheelchair for long distances.",
    stem: "What should the CNA do?",
    options: {
      A: "Let them walk since they requested it",
      B: "Follow the care plan but offer to let them walk part of the way if safe",
      C: "Force them into the wheelchair without explanation",
      D: "Report them for not following rules"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Follow the care plan while supporting independence. Offering to walk part of the way respects their wishes while maintaining safety guidelines.",
      incorrectA: "Ignoring the care plan could result in falls or exhaustion.",
      incorrectC: "Forcing without explanation violates rights and dignity.",
      incorrectD: "A reasonable request isn't a rule violation to report."
    },
    cdphReference: "Care Plan Compliance; Resident Preferences",
    keywords: ['care plan', 'walking', 'wheelchair', 'independence'],
    difficulty: 'medium'
  },
  {
    id: 115,
    category: 'mobility',
    scenario: "You are performing ROM exercises and the resident has an IV in their right arm.",
    stem: "What precaution should you take?",
    options: {
      A: "Skip ROM on the right arm entirely",
      B: "Be gentle and careful not to dislodge the IV or kink the tubing",
      C: "Remove the IV before exercises",
      D: "Only exercise the right arm"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "ROM can usually be performed with IV in place by being careful. Support the arm, avoid tension on the IV site, and keep tubing free of kinks.",
      incorrectA: "Skipping ROM on an extremity contributes to contractures; careful exercise is possible.",
      incorrectC: "CNAs cannot remove IVs.",
      incorrectD: "This makes no sense and ignores the rest of the body."
    },
    cdphReference: "ROM with Medical Devices",
    keywords: ['ROM', 'IV', 'precautions', 'gentle handling'],
    difficulty: 'medium'
  },
  {
    id: 116,
    category: 'mobility',
    scenario: "A resident with dementia keeps trying to get up without assistance and has already fallen once.",
    stem: "What is the BEST intervention?",
    options: {
      A: "Tie them to the chair",
      B: "Use bed/chair alarms and increase monitoring",
      C: "Sedate them to keep them still",
      D: "Ignore the behavior"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Alarms alert staff when the resident attempts to get up, allowing intervention. Increased monitoring and engagement reduce fall risk without restraints.",
      incorrectA: "Tying is a restraint and requires specific orders; it's a last resort.",
      incorrectC: "Chemical restraint is not appropriate and CNAs cannot administer medications.",
      incorrectD: "Ignoring puts the resident at continued fall risk."
    },
    cdphReference: "Dementia Care; Fall Prevention",
    keywords: ['dementia', 'fall prevention', 'alarms', 'monitoring'],
    difficulty: 'medium'
  },

  // ========== MENTAL HEALTH & SOCIAL NEEDS (10 questions) ==========
  {
    id: 117,
    category: 'mental-health',
    scenario: "A resident with dementia asks for her mother, who passed away years ago.",
    stem: "What is the BEST response?",
    options: {
      A: "Tell her that her mother died a long time ago",
      B: "Enter her reality gently by asking about her mother and redirecting",
      C: "Ignore her and walk away",
      D: "Tell her she's confused and her mother isn't coming"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Reality orientation can be distressing for dementia patients. Validation therapy and gentle redirection honor their feelings without causing grief.",
      incorrectA: "Repeatedly hearing about a loved one's death causes fresh grief each time.",
      incorrectC: "Ignoring abandons the resident emotionally.",
      incorrectD: "Telling someone they're confused is dismissive and hurtful."
    },
    cdphReference: "Dementia Care; Validation Therapy",
    keywords: ['dementia', 'validation', 'mother', 'redirection'],
    difficulty: 'medium'
  },
  {
    id: 118,
    category: 'mental-health',
    scenario: "A resident tells you they feel like a burden to their family and that everyone would be better off without them.",
    stem: "What should the CNA do?",
    options: {
      A: "Agree that families do get tired of caregiving",
      B: "Take the statement seriously, stay with the resident, and report immediately to the nurse",
      C: "Tell them not to be silly and cheer up",
      D: "Promise to keep it a secret since they confided in you"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Statements about being a burden or others being 'better off' can indicate suicidal ideation. Take it seriously, ensure safety, and report to the nurse immediately.",
      incorrectA: "This reinforces negative feelings and is inappropriate.",
      incorrectC: "Dismissing feelings doesn't address the underlying concern.",
      incorrectD: "Suicide risk requires reporting; you cannot keep this confidential."
    },
    cdphReference: "Suicide Prevention; Mental Health Reporting",
    keywords: ['suicide risk', 'depression', 'burden', 'reporting'],
    difficulty: 'hard'
  },
  {
    id: 119,
    category: 'mental-health',
    scenario: "A resident who recently lost their spouse has been withdrawn and not eating well.",
    stem: "What is the BEST way to support this resident?",
    options: {
      A: "Tell them to get over it since time heals all wounds",
      B: "Offer compassionate presence, listen, and encourage participation in activities",
      C: "Avoid the topic entirely and act like nothing happened",
      D: "Tell them about other residents who have lost spouses"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Grief requires compassionate support. Being present, listening, and gently encouraging activity helps without rushing the grieving process.",
      incorrectA: "This dismisses the natural grieving process.",
      incorrectC: "Avoiding the topic isolates the resident in their grief.",
      incorrectD: "Comparing grief experiences is unhelpful."
    },
    cdphReference: "Grief and Loss; Emotional Support",
    keywords: ['grief', 'loss', 'support', 'widow'],
    difficulty: 'easy'
  },
  {
    id: 120,
    category: 'mental-health',
    scenario: "A resident with anxiety becomes agitated when too many staff members enter the room at once.",
    stem: "What can the CNA do to help?",
    options: {
      A: "Tell them there's nothing to worry about",
      B: "Limit the number of staff in the room and use a calm, reassuring approach",
      C: "Leave immediately to avoid making it worse",
      D: "Turn on loud music to distract them"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Reducing stimulation and using a calm approach addresses the anxiety trigger. Environmental modifications help anxious residents feel safer.",
      incorrectA: "Dismissing anxiety doesn't help; it needs to be addressed.",
      incorrectC: "Abruptly leaving may increase anxiety.",
      incorrectD: "Loud noise increases stimulation and could worsen anxiety."
    },
    cdphReference: "Anxiety Management; Person-Centered Care",
    keywords: ['anxiety', 'calm', 'environment', 'stimulation'],
    difficulty: 'easy'
  },
  {
    id: 121,
    category: 'mental-health',
    scenario: "A resident with depression refuses to get out of bed or participate in activities.",
    stem: "What approach should the CNA take?",
    options: {
      A: "Force them out of bed for their own good",
      B: "Leave them alone since they obviously want privacy",
      C: "Gently encourage activity, respect their pace, and report to the nurse",
      D: "Tell them they're being lazy"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "Depression requires patience and gentle encouragement. Respect their feelings while promoting small steps, and keep the nurse informed for care planning.",
      incorrectA: "Forcing doesn't respect the resident and can worsen depression.",
      incorrectB: "Complete withdrawal worsens depression; gentle engagement helps.",
      incorrectD: "Labeling behavior as 'lazy' is dismissive and harmful."
    },
    cdphReference: "Depression Care; Mental Health",
    keywords: ['depression', 'encouragement', 'patience', 'reporting'],
    difficulty: 'medium'
  },
  {
    id: 122,
    category: 'mental-health',
    scenario: "A resident has been socially isolated since their roommate moved out.",
    stem: "What can the CNA do to help with the resident's social needs?",
    options: {
      A: "Tell them they'll get used to being alone",
      B: "Encourage participation in group activities and spend extra time with them when possible",
      C: "Immediately request a new roommate",
      D: "Keep the door closed so they can have privacy"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Social isolation affects mental and physical health. Encouraging activities and providing social interaction helps meet belonging needs.",
      incorrectA: "This doesn't address the isolation.",
      incorrectC: "Roommate assignments are administrative decisions, and may not be what's needed.",
      incorrectD: "Privacy may not be desired; isolation is the problem."
    },
    cdphReference: "Social Needs; Psychosocial Care",
    keywords: ['isolation', 'social needs', 'activities', 'companionship'],
    difficulty: 'easy'
  },
  {
    id: 123,
    category: 'mental-health',
    scenario: "A resident becomes agitated and starts yelling during care.",
    stem: "What is the FIRST thing the CNA should do?",
    options: {
      A: "Yell back to be heard",
      B: "Step back, remain calm, and speak in a low, soothing voice",
      C: "Immediately restrain the resident",
      D: "Leave the room and lock the door"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Calmness de-escalates agitation. Step back to give space, lower your voice, and use soothing tones. Matching agitation escalates the situation.",
      incorrectA: "Yelling escalates the situation.",
      incorrectC: "Restraints require orders and are not first-line interventions.",
      incorrectD: "Abandoning the resident or locking them in is unsafe and wrong."
    },
    cdphReference: "De-escalation Techniques",
    keywords: ['agitation', 'de-escalation', 'calm', 'crisis intervention'],
    difficulty: 'medium'
  },
  {
    id: 124,
    category: 'mental-health',
    scenario: "A resident with schizophrenia tells you they hear voices telling them to do things.",
    stem: "What is the appropriate response?",
    options: {
      A: "Tell them the voices aren't real",
      B: "Acknowledge their experience, stay calm, and report to the nurse",
      C: "Act scared and call security",
      D: "Pretend you hear the voices too"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Hallucinations are real experiences for the person. Acknowledge their distress without reinforcing the hallucination, and report for assessment.",
      incorrectA: "Telling them hallucinations aren't real doesn't help and dismisses their experience.",
      incorrectC: "Overreacting increases anxiety; most hallucinations aren't dangerous.",
      incorrectD: "Pretending to share hallucinations is unhelpful and dishonest."
    },
    cdphReference: "Mental Health; Hallucination Response",
    keywords: ['schizophrenia', 'hallucinations', 'voices', 'mental health'],
    difficulty: 'medium'
  },
  {
    id: 125,
    category: 'mental-health',
    scenario: "A resident frequently talks about the same topics over and over again.",
    stem: "How should the CNA respond?",
    options: {
      A: "Tell them they already told you that story",
      B: "Listen patiently and use the conversation to provide social connection",
      C: "Walk away when they start repeating",
      D: "Tell other CNAs to avoid that resident"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Repetition is common in cognitive changes and can also indicate comfort topics. Listening provides social connection and dignity.",
      incorrectA: "Pointing out repetition can embarrass or distress the resident.",
      incorrectC: "Walking away abandons social opportunity.",
      incorrectD: "All residents deserve care and social interaction."
    },
    cdphReference: "Communication with Cognitively Impaired Residents",
    keywords: ['repetition', 'conversation', 'patience', 'dignity'],
    difficulty: 'easy'
  },
  {
    id: 126,
    category: 'mental-health',
    scenario: "A new resident seems overwhelmed and mentions they miss their home.",
    stem: "What can the CNA do to help with this adjustment?",
    options: {
      A: "Tell them they'll forget about home soon",
      B: "Help personalize their space, listen to their feelings, and introduce them to others",
      C: "Avoid the topic of home so they don't get upset",
      D: "Tell them this facility is better than home"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Acknowledging feelings, helping create a familiar environment, and facilitating social connections all ease the transition to facility life.",
      incorrectA: "Dismisses legitimate feelings of loss.",
      incorrectC: "Avoidance doesn't help process feelings.",
      incorrectD: "Comparing unfavorably to home dismisses their attachment."
    },
    cdphReference: "New Resident Orientation; Psychosocial Care",
    keywords: ['adjustment', 'homesickness', 'transition', 'personalization'],
    difficulty: 'easy'
  },

  // ========== COMMUNICATION & DOCUMENTATION (12 questions) ==========
  {
    id: 127,
    category: 'communication',
    scenario: "You are documenting care you provided to a resident and realize you made an error in your notes.",
    stem: "What is the CORRECT way to correct the error?",
    options: {
      A: "Use white-out to cover the mistake",
      B: "Draw a single line through the error, write 'error,' initial, and date it",
      C: "Scribble over it so it can't be read",
      D: "Tear out the page and start fresh"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Medical records are legal documents. Errors are corrected with a single line (keeping original visible), marked 'error,' initialed, and dated.",
      incorrectA: "White-out is never used in medical records.",
      incorrectC: "Scribbling hides the original, which is not allowed.",
      incorrectD: "Removing pages is tampering with medical records."
    },
    cdphReference: "Documentation Standards",
    keywords: ['documentation', 'error correction', 'medical records', 'charting'],
    difficulty: 'easy'
  },
  {
    id: 128,
    category: 'communication',
    scenario: "A resident who speaks limited English needs assistance understanding the day's activities.",
    stem: "What is the BEST approach?",
    options: {
      A: "Speak louder so they can understand better",
      B: "Use simple words, gestures, pictures, or request an interpreter",
      C: "Skip explaining and just guide them physically",
      D: "Only speak to their English-speaking family member"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Communication barriers can be addressed with simple language, non-verbal cues, visual aids, and interpreter services when available.",
      incorrectA: "Speaking louder doesn't help with language barriers.",
      incorrectC: "Residents have the right to know about their care and activities.",
      incorrectD: "The resident should be communicated with directly when possible."
    },
    cdphReference: "Communication with Non-English Speakers",
    keywords: ['language barrier', 'interpreter', 'communication', 'gestures'],
    difficulty: 'easy'
  },
  {
    id: 129,
    category: 'communication',
    scenario: "You observe that a resident has developed a new red area on their heel.",
    stem: "What information should you include when reporting to the nurse?",
    options: {
      A: "Just tell them you saw something on the foot",
      B: "Describe location, size, color, and whether the skin is intact",
      C: "Diagnose it as a pressure ulcer stage 1",
      D: "Wait until it gets worse before reporting"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Objective, detailed observations help the nurse assess and plan care. Include location, appearance, size, and any other relevant details.",
      incorrectA: "Vague reports don't provide useful information.",
      incorrectC: "CNAs observe and report; diagnosis is nursing's role.",
      incorrectD: "Early reporting allows early intervention."
    },
    cdphReference: "Reporting Observations; SBAR Communication",
    keywords: ['reporting', 'observation', 'pressure ulcer', 'detailed'],
    difficulty: 'easy'
  },
  {
    id: 130,
    category: 'communication',
    scenario: "A resident's family member approaches you and criticizes the care you provided.",
    stem: "What is the BEST way to handle this situation?",
    options: {
      A: "Argue and defend yourself immediately",
      B: "Listen calmly, acknowledge their concerns, and involve your supervisor if needed",
      C: "Walk away without responding",
      D: "Tell them to file a formal complaint"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Listen without becoming defensive, acknowledge their feelings, and escalate to a supervisor if the issue requires it. Professional communication maintains relationships.",
      incorrectA: "Arguing escalates conflict and is unprofessional.",
      incorrectC: "Ignoring concerns damages trust and relationships.",
      incorrectD: "This may be perceived as dismissive; try to address concerns first."
    },
    cdphReference: "Family Communication; Conflict Resolution",
    keywords: ['family', 'criticism', 'conflict', 'professional communication'],
    difficulty: 'medium'
  },
  {
    id: 131,
    category: 'communication',
    scenario: "You need to communicate with a resident who has a hearing impairment.",
    stem: "What technique should you use?",
    options: {
      A: "Stand behind them and speak loudly",
      B: "Face the resident, speak clearly, and use gestures or written communication if needed",
      C: "Only use written notes for all communication",
      D: "Speak very slowly with exaggerated lip movements"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Face the resident (for lip reading), speak clearly at a moderate pace, reduce background noise, and use gestures or writing as supplements.",
      incorrectA: "Speaking from behind prevents lip reading.",
      incorrectC: "Many hearing-impaired residents can understand speech with proper technique.",
      incorrectD: "Exaggerated movements distort lip patterns and make lip reading harder."
    },
    cdphReference: "Communication with Hearing Impaired",
    keywords: ['hearing impaired', 'communication', 'lip reading', 'face'],
    difficulty: 'easy'
  },
  {
    id: 132,
    category: 'communication',
    scenario: "During end-of-shift report, a coworker tells you important information about a resident's condition.",
    stem: "What should you do with this information?",
    options: {
      A: "Trust your memory to recall it later",
      B: "Take notes and verify understanding through clarifying questions",
      C: "Nod and hope you remember the important parts",
      D: "Tell them to document it themselves"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Shift reports contain critical information. Taking notes and asking questions ensures accurate information transfer and continuity of care.",
      incorrectA: "Memory alone is unreliable for complex information.",
      incorrectC: "Hoping isn't a strategy; active listening and notes ensure understanding.",
      incorrectD: "Receiving verbal report is part of your responsibility."
    },
    cdphReference: "Shift Report; Hand-off Communication",
    keywords: ['shift report', 'hand-off', 'notes', 'communication'],
    difficulty: 'easy'
  },
  {
    id: 133,
    category: 'communication',
    scenario: "You are caring for a resident who uses a communication board because they cannot speak.",
    stem: "What is important to remember when using this device?",
    options: {
      A: "Speak for the resident to save time",
      B: "Give the resident time to point to symbols and be patient",
      C: "Only use the board for emergencies",
      D: "Have family members communicate for the resident"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Communication boards require patience. Allow time for the resident to express themselves and confirm understanding of their messages.",
      incorrectA: "The resident has the right to communicate their own thoughts.",
      incorrectC: "Communication boards are for all communication, not just emergencies.",
      incorrectD: "The resident should communicate directly when able."
    },
    cdphReference: "Augmentative Communication Devices",
    keywords: ['communication board', 'AAC', 'patience', 'non-verbal'],
    difficulty: 'easy'
  },
  {
    id: 134,
    category: 'communication',
    scenario: "You need to document that you gave a resident a bed bath.",
    stem: "Which documentation is CORRECT?",
    options: {
      A: "Resident had a good bath today",
      B: "Complete bed bath given. Skin inspected. No redness noted. Lotion applied to dry skin areas on arms.",
      C: "Bath done",
      D: "I gave them their bath and they seemed happy about it"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Documentation should be objective, specific, and include relevant observations. Note what was done and any important findings.",
      incorrectA: "'Good' is subjective and vague.",
      incorrectC: "Too brief; lacks important details.",
      incorrectD: "Avoid 'I' statements and subjective interpretations."
    },
    cdphReference: "Documentation Standards",
    keywords: ['documentation', 'objective', 'specific', 'charting'],
    difficulty: 'easy'
  },
  {
    id: 135,
    category: 'communication',
    scenario: "A resident tells you something personal about their life that has nothing to do with their care.",
    stem: "What should you do with this information?",
    options: {
      A: "Share it with coworkers since it was interesting",
      B: "Keep it confidential unless it affects their care or safety",
      C: "Tell their family members",
      D: "Post about it on social media without using their name"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Personal conversations are confidential. Only share information that is relevant to care with appropriate team members.",
      incorrectA: "Sharing personal information violates trust and confidentiality.",
      incorrectC: "Family doesn't need to know unless the resident shares it themselves.",
      incorrectD: "Social media posts about residents are serious HIPAA violations."
    },
    cdphReference: "Confidentiality; HIPAA",
    keywords: ['confidentiality', 'personal information', 'privacy', 'trust'],
    difficulty: 'easy'
  },
  {
    id: 136,
    category: 'communication',
    scenario: "A resident with vision impairment is in the dining room.",
    stem: "How should you approach and communicate with them?",
    options: {
      A: "Touch them on the shoulder first without speaking",
      B: "Announce your presence, identify yourself, and ask before providing assistance",
      C: "Speak loudly since they have vision problems",
      D: "Guide them physically without asking permission"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Announce yourself to avoid startling them, identify who you are, and always ask before providing assistance. Vision impairment doesn't affect hearing.",
      incorrectA: "Unexpected touch can startle; announce yourself first.",
      incorrectC: "Vision impairment doesn't mean they can't hear normally.",
      incorrectD: "Always ask before touching or guiding."
    },
    cdphReference: "Communication with Vision Impaired",
    keywords: ['vision impaired', 'announce', 'identify', 'approach'],
    difficulty: 'easy'
  },
  {
    id: 137,
    category: 'communication',
    scenario: "You overhear a resident telling another resident about their roommate's personal medical information.",
    stem: "What is the appropriate action?",
    options: {
      A: "Tell the resident they shouldn't share that information",
      B: "Report to the nurse; this may indicate staff have been sharing information inappropriately",
      C: "Join the conversation to set the record straight",
      D: "Ignore it since you didn't share the information"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "If a resident knows private information about another resident, investigate how they learned it. Staff may have inadvertently breached confidentiality.",
      incorrectA: "While you could redirect, the bigger issue is how they obtained the information.",
      incorrectC: "Joining adds to the privacy breach.",
      incorrectD: "This could indicate a system problem that needs addressing."
    },
    cdphReference: "HIPAA; Privacy Breaches",
    keywords: ['confidentiality', 'breach', 'HIPAA', 'reporting'],
    difficulty: 'medium'
  },
  {
    id: 138,
    category: 'communication',
    scenario: "A doctor asks you a question about a resident's condition that you're unsure how to answer.",
    stem: "What should you do?",
    options: {
      A: "Make up an answer to seem knowledgeable",
      B: "Tell the doctor you don't know and will get the nurse",
      C: "Ignore the question and walk away",
      D: "Say 'I'm just a CNA' and refuse to help"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Honesty is essential. If you don't know, say so and facilitate getting the information by notifying the nurse or directing the doctor to the right person.",
      incorrectA: "Never make up information; it could affect patient care.",
      incorrectC: "Ignoring a healthcare provider is unprofessional.",
      incorrectD: "Devaluing your role isn't helpful; redirect to the appropriate person professionally."
    },
    cdphReference: "Team Communication; Scope of Practice",
    keywords: ['doctor', 'honesty', 'team communication', 'scope'],
    difficulty: 'easy'
  },

  // ========== END-OF-LIFE CARE (8 questions) ==========
  {
    id: 139,
    category: 'end-of-life',
    scenario: "A resident on hospice care is experiencing labored breathing.",
    stem: "What is the MOST comforting intervention the CNA can provide?",
    options: {
      A: "Tell the family not to worry",
      B: "Position the resident comfortably (often elevated) and provide a calm, peaceful environment",
      C: "Leave the room since there's nothing medical you can do",
      D: "Try to get the resident to drink fluids"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Comfort care focuses on easing distress. Positioning (often elevated), reducing stimulation, and ensuring peace and dignity are primary hospice goals.",
      incorrectA: "This dismisses legitimate concerns.",
      incorrectC: "Comfort care is essential and within CNA scope.",
      incorrectD: "End-of-life care often limits food/fluids; forcing is inappropriate."
    },
    cdphReference: "End-of-Life Comfort Care",
    keywords: ['hospice', 'comfort care', 'positioning', 'breathing'],
    difficulty: 'medium'
  },
  {
    id: 140,
    category: 'end-of-life',
    scenario: "A dying resident's family is gathered around the bed and asks you to stay.",
    stem: "What is the BEST action?",
    options: {
      A: "Tell them you're too busy and can't stay",
      B: "Stay if your duties allow, providing quiet support and any needed care",
      C: "Tell them only nurses should be present",
      D: "Leave immediately to give them privacy"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Being present at end of life provides comfort to residents and families. If duties allow, stay and provide compassionate support.",
      incorrectA: "This seems uncaring during a critical moment.",
      incorrectC: "CNAs provide essential comfort care at end of life.",
      incorrectD: "If they asked you to stay, they want your presence."
    },
    cdphReference: "End-of-Life Care; Family Support",
    keywords: ['dying', 'family', 'presence', 'support'],
    difficulty: 'easy'
  },
  {
    id: 141,
    category: 'end-of-life',
    scenario: "A resident is actively dying and no longer responding to voices.",
    stem: "What should the CNA remember about caring for this resident?",
    options: {
      A: "You can speak freely since they can't hear",
      B: "Hearing is believed to be the last sense to go; continue speaking to them gently",
      C: "All care stops once the resident is unresponsive",
      D: "Physical care is no longer necessary"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Hearing is thought to persist until death. Continue speaking gently, providing comfort care, and treating the resident with dignity.",
      incorrectA: "Always assume the resident can hear; speak respectfully.",
      incorrectC: "Comfort care continues until death.",
      incorrectD: "Oral care, repositioning, and hygiene continue."
    },
    cdphReference: "Care of the Dying Resident",
    keywords: ['actively dying', 'hearing', 'dignity', 'last senses'],
    difficulty: 'easy'
  },
  {
    id: 142,
    category: 'end-of-life',
    scenario: "After a resident dies, the family asks if they can spend time with the body.",
    stem: "What should the CNA do?",
    options: {
      A: "Tell them they need to leave immediately",
      B: "Allow time for the family to say goodbye and provide privacy",
      C: "Start postmortem care immediately regardless of family presence",
      D: "Tell them to come back during visiting hours"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Families need time to grieve and say goodbye. Provide privacy, support, and compassion during this difficult time.",
      incorrectA: "Rushing families is insensitive.",
      incorrectC: "Postmortem care can wait until the family is ready.",
      incorrectD: "Normal visiting hours don't apply after a death."
    },
    cdphReference: "Postmortem Care; Family Support",
    keywords: ['death', 'family', 'grief', 'goodbye'],
    difficulty: 'easy'
  },
  {
    id: 143,
    category: 'end-of-life',
    scenario: "A resident with a terminal illness tells you they are afraid of dying.",
    stem: "What is the BEST response?",
    options: {
      A: "Tell them not to worry; everyone dies eventually",
      B: "Listen compassionately, acknowledge their feelings, and offer to get support such as a chaplain",
      C: "Change the subject to something more cheerful",
      D: "Tell them the doctors might find a cure"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Active listening and acknowledging feelings provide comfort. Offering spiritual support (chaplain) or counseling addresses their fear compassionately.",
      incorrectA: "This dismisses their legitimate fear.",
      incorrectC: "Avoiding the topic doesn't help them process their feelings.",
      incorrectD: "False hope is not helpful for terminal illness."
    },
    cdphReference: "Emotional Support; End-of-Life",
    keywords: ['fear of death', 'listening', 'spiritual care', 'terminal'],
    difficulty: 'medium'
  },
  {
    id: 144,
    category: 'end-of-life',
    scenario: "A resident has a DNR (Do Not Resuscitate) order. They stop breathing while you are in the room.",
    stem: "What should you do?",
    options: {
      A: "Begin CPR immediately regardless of the DNR",
      B: "Stay with the resident, provide comfort, and notify the nurse immediately",
      C: "Leave the room so you don't have to witness the death",
      D: "Call 911 for emergency response"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "DNR means no CPR or resuscitation. Provide comfort, maintain dignity, stay with the resident, and notify the nurse. Honor the advance directive.",
      incorrectA: "Starting CPR violates the DNR order.",
      incorrectC: "The resident should not be left alone.",
      incorrectD: "Emergency services are not called for expected, natural death with DNR."
    },
    cdphReference: "DNR Orders; Advance Directives",
    keywords: ['DNR', 'advance directive', 'death', 'no CPR'],
    difficulty: 'medium'
  },
  {
    id: 145,
    category: 'end-of-life',
    scenario: "You are performing postmortem care on a deceased resident.",
    stem: "What is an important aspect of this care?",
    options: {
      A: "Rush to complete it before rigor mortis sets in",
      B: "Treat the body with the same dignity and respect as when the person was alive",
      C: "Remove all personal items immediately and dispose of them",
      D: "Only trained specialists can provide postmortem care"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Postmortem care should be performed with dignity and respect. The body should be positioned naturally, cleaned, and prepared according to facility policy.",
      incorrectA: "While timing matters, rushing is not appropriate.",
      incorrectC: "Personal items should be handled according to policy and may go to family.",
      incorrectD: "CNAs can perform postmortem care with proper training."
    },
    cdphReference: "Postmortem Care Procedures",
    keywords: ['postmortem care', 'dignity', 'respect', 'body'],
    difficulty: 'easy'
  },
  {
    id: 146,
    category: 'end-of-life',
    scenario: "A family member is angry about their loved one's death and blames the staff.",
    stem: "How should the CNA respond?",
    options: {
      A: "Defend the staff and explain it wasn't anyone's fault",
      B: "Listen without becoming defensive; anger is part of grief",
      C: "Tell them to file a complaint if they're unhappy",
      D: "Argue about the quality of care provided"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Anger is a stage of grief. Listen without taking it personally, show empathy, and allow the family to express their feelings. Involve supervisors if needed.",
      incorrectA: "Defensive responses escalate conflict during grief.",
      incorrectC: "This response is dismissive during an emotional time.",
      incorrectD: "Arguing is unprofessional and unhelpful."
    },
    cdphReference: "Grief Support; Family Communication",
    keywords: ['grief', 'anger', 'family', 'listening'],
    difficulty: 'medium'
  },

  // ========== ABUSE, NEGLECT & REPORTING (10 questions) ==========
  {
    id: 147,
    category: 'abuse-neglect',
    scenario: "You notice a coworker speaking harshly to a resident and calling them names.",
    stem: "What is this behavior considered?",
    options: {
      A: "Just having a bad day",
      B: "Psychological/emotional abuse",
      C: "Tough love",
      D: "Appropriate discipline"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Name-calling, yelling, threats, and humiliation are forms of psychological abuse. All abuse must be reported.",
      incorrectA: "A 'bad day' doesn't excuse abusive behavior.",
      incorrectC: "'Tough love' is not acceptable in professional care settings.",
      incorrectD: "Residents are adults; discipline is not appropriate."
    },
    cdphReference: "Types of Abuse; Mandatory Reporting",
    keywords: ['abuse', 'emotional abuse', 'psychological abuse', 'reporting'],
    difficulty: 'easy'
  },
  {
    id: 148,
    category: 'abuse-neglect',
    scenario: "You observe unexplained bruises in various stages of healing on a resident who is non-verbal.",
    stem: "What should you do?",
    options: {
      A: "Assume the resident just bruises easily",
      B: "Document the findings and report immediately to your supervisor and nurse",
      C: "Wait to see if more bruises appear before reporting",
      D: "Ask the resident who hurt them"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Unexplained bruises, especially in various stages of healing, are potential signs of abuse. Document and report immediately per mandatory reporting requirements.",
      incorrectA: "Unexplained injuries require investigation, not assumptions.",
      incorrectC: "Waiting could allow continued abuse.",
      incorrectD: "If the resident is non-verbal, they cannot answer; report what you observed."
    },
    cdphReference: "Signs of Abuse; Mandatory Reporting",
    keywords: ['bruises', 'physical abuse', 'reporting', 'non-verbal'],
    difficulty: 'easy'
  },
  {
    id: 149,
    category: 'abuse-neglect',
    scenario: "A resident tells you that a family member is stealing their money when they visit.",
    stem: "What type of abuse does this represent?",
    options: {
      A: "Physical abuse",
      B: "Financial exploitation",
      C: "Emotional abuse",
      D: "Not abuse since it's family"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Financial exploitation includes theft, fraud, or misuse of funds or property. Family members can be perpetrators of abuse.",
      incorrectA: "This doesn't involve physical harm.",
      incorrectC: "While upsetting, the primary issue is financial.",
      incorrectD: "Family members can absolutely commit abuse; this must be reported."
    },
    cdphReference: "Financial Abuse; Types of Abuse",
    keywords: ['financial abuse', 'exploitation', 'theft', 'family'],
    difficulty: 'easy'
  },
  {
    id: 150,
    category: 'abuse-neglect',
    scenario: "A resident is found sitting in wet, soiled clothing for several hours because no one responded to their call light.",
    stem: "This is an example of:",
    options: {
      A: "An honest mistake",
      B: "Neglect",
      C: "The resident's fault for not speaking up more",
      D: "A staffing issue, not a care issue"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Failure to provide timely basic care needs constitutes neglect. Residents should not be left in soiled clothing for extended periods.",
      incorrectA: "Repeated or prolonged failure is neglect, not a mistake.",
      incorrectC: "Staff have the responsibility to respond; it's not the resident's fault.",
      incorrectD: "Regardless of staffing, this is still neglect of the resident."
    },
    cdphReference: "Neglect Definition; Reporting Requirements",
    keywords: ['neglect', 'incontinence care', 'call light', 'basic needs'],
    difficulty: 'easy'
  },
  {
    id: 151,
    category: 'abuse-neglect',
    scenario: "You suspect a resident is being abused but have no concrete proof.",
    stem: "Should you still report your suspicion?",
    options: {
      A: "No, wait until you have definite proof",
      B: "Yes, CNAs are mandatory reporters and must report suspected abuse",
      C: "Only if another staff member also suspects abuse",
      D: "Ask the suspected abuser directly first"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "CNAs are mandatory reporters. You must report suspicions of abuse, even without proof. Investigation determines if abuse occurred.",
      incorrectA: "Waiting for proof could allow continued abuse.",
      incorrectC: "You are individually responsible for reporting.",
      incorrectD: "Never confront a suspected abuser; report to proper authorities."
    },
    cdphReference: "Mandatory Reporting Requirements",
    keywords: ['mandatory reporter', 'suspected abuse', 'reporting', 'investigation'],
    difficulty: 'easy'
  },
  {
    id: 152,
    category: 'abuse-neglect',
    scenario: "A resident's family member asks you not to report that they saw their father with a black eye, saying they'll 'handle it within the family.'",
    stem: "What should you do?",
    options: {
      A: "Respect the family's wishes and not report",
      B: "Explain that you are a mandatory reporter and must report",
      C: "Let the family report it themselves",
      D: "Promise not to report if they sign a form"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Mandatory reporting cannot be waived by family request. Explain your legal obligation and report the observed injury.",
      incorrectA: "You cannot skip mandatory reporting regardless of wishes.",
      incorrectC: "Your reporting obligation is independent of family actions.",
      incorrectD: "No form can waive mandatory reporting requirements."
    },
    cdphReference: "Mandatory Reporting; Legal Obligations",
    keywords: ['mandatory reporting', 'family', 'legal obligation', 'black eye'],
    difficulty: 'medium'
  },
  {
    id: 153,
    category: 'abuse-neglect',
    scenario: "A coworker asks you to cover for them, saying they 'accidentally' hit a resident but didn't mean it.",
    stem: "What is the appropriate action?",
    options: {
      A: "Cover for them since it was an accident",
      B: "Refuse to cover and report the incident immediately",
      C: "Tell them to report it themselves",
      D: "Only report if the resident is injured"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Hitting a resident, accidentally or not, must be reported. You cannot cover for potential abuse and have a duty to report.",
      incorrectA: "Covering for potential abuse makes you complicit.",
      incorrectC: "You have an independent duty to report what you know.",
      incorrectD: "All physical incidents must be reported regardless of visible injury."
    },
    cdphReference: "Incident Reporting; Duty to Report",
    keywords: ['covering up', 'hitting', 'reporting', 'coworker'],
    difficulty: 'medium'
  },
  {
    id: 154,
    category: 'abuse-neglect',
    scenario: "A resident flinches or pulls away when a particular staff member approaches them.",
    stem: "What might this behavior indicate?",
    options: {
      A: "The resident is confused and doesn't recognize people",
      B: "Possible fear of that staff member; may indicate abuse",
      C: "Normal behavior for elderly residents",
      D: "The resident is just difficult"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Fear responses toward specific individuals can indicate abuse. This should be noted and reported for investigation.",
      incorrectA: "Targeted fear (toward one person) suggests more than confusion.",
      incorrectC: "Fear responses toward specific people are not 'normal aging.'",
      incorrectD: "Labeling residents as 'difficult' ignores potential abuse."
    },
    cdphReference: "Behavioral Signs of Abuse",
    keywords: ['fear', 'flinching', 'behavioral signs', 'abuse'],
    difficulty: 'medium'
  },
  {
    id: 155,
    category: 'abuse-neglect',
    scenario: "You report suspected abuse to your supervisor. They tell you not to worry about it and to forget what you saw.",
    stem: "What should you do?",
    options: {
      A: "Follow your supervisor's instructions and forget about it",
      B: "Report to a higher authority such as the administrator or the state hotline",
      C: "Wait and see if the abuse continues",
      D: "Confront the suspected abuser yourself"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "If a supervisor dismisses a report, escalate to a higher authority (administrator, ombudsman, or state abuse hotline). Your reporting duty continues.",
      incorrectA: "You cannot 'forget' a mandatory reporting duty.",
      incorrectC: "Waiting allows potential continued abuse.",
      incorrectD: "Never confront suspected abusers; use proper reporting channels."
    },
    cdphReference: "Reporting Chain; Escalation",
    keywords: ['supervisor', 'escalation', 'hotline', 'higher authority'],
    difficulty: 'hard'
  },
  {
    id: 156,
    category: 'abuse-neglect',
    scenario: "A resident asks you to keep a secret about being hurt by another resident.",
    stem: "What should you do?",
    options: {
      A: "Keep the secret since they asked you to",
      B: "Explain that you must report injuries and abuse, even between residents",
      C: "Tell them it's not abuse if another resident did it",
      D: "Promise to keep it secret but tell the nurse anyway"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Resident-to-resident abuse is still abuse and must be reported. Explain your reporting duty compassionately and ensure both residents' safety.",
      incorrectA: "You cannot keep secrets about abuse.",
      incorrectC: "Resident-to-resident abuse is reportable abuse.",
      incorrectD: "Breaking a promise damages trust; be honest about your duty."
    },
    cdphReference: "Resident-to-Resident Abuse; Reporting",
    keywords: ['resident abuse', 'secret', 'reporting', 'injury'],
    difficulty: 'medium'
  },

  // ========== BODY MECHANICS & POSITIONING (11 questions) ==========
  {
    id: 157,
    category: 'body-mechanics',
    scenario: "You need to lift a heavy box from the floor.",
    stem: "What is the CORRECT body mechanics technique?",
    options: {
      A: "Bend at the waist, keeping legs straight",
      B: "Bend your knees, keep your back straight, and lift with your legs",
      C: "Twist while lifting to get more momentum",
      D: "Lift quickly in one jerky motion"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Proper body mechanics: wide stance, bend knees, keep back straight, lift with legs (strongest muscles), and keep the load close to your body.",
      incorrectA: "Bending at waist with straight legs strains the back.",
      incorrectC: "Twisting while lifting causes back injury.",
      incorrectD: "Jerky motions strain muscles."
    },
    cdphReference: "Body Mechanics; Safe Lifting",
    keywords: ['lifting', 'body mechanics', 'back safety', 'legs'],
    difficulty: 'easy'
  },
  {
    id: 158,
    category: 'body-mechanics',
    scenario: "You need to move a resident up in bed. They weigh 200 pounds.",
    stem: "What is the safest approach?",
    options: {
      A: "Lift them by yourself to save time",
      B: "Get assistance from another staff member and use a draw sheet",
      C: "Have the resident help by pushing with their feet only",
      D: "Pull them up by their arms"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Two-person assist with a draw sheet is safest for heavier residents. This protects both the resident and staff from injury.",
      incorrectA: "Single-person lifts of heavy residents risk injury.",
      incorrectC: "While resident participation helps, staff assistance is still needed for safe repositioning.",
      incorrectD: "Pulling by arms can injure shoulder joints."
    },
    cdphReference: "Repositioning Techniques",
    keywords: ['repositioning', 'draw sheet', 'assistance', 'two-person'],
    difficulty: 'easy'
  },
  {
    id: 159,
    category: 'body-mechanics',
    scenario: "A resident has been in the same position for 2 hours.",
    stem: "What should you do?",
    options: {
      A: "Leave them if they seem comfortable",
      B: "Reposition them to prevent pressure ulcers",
      C: "Wait until they ask to be moved",
      D: "Check again in 4 hours"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Repositioning should occur at least every 2 hours to prevent pressure ulcer development. Don't wait for discomfort or requests.",
      incorrectA: "Comfort doesn't indicate pressure ulcer risk; reposition anyway.",
      incorrectC: "Don't wait for requests; repositioning is scheduled care.",
      incorrectD: "Four hours is too long between repositioning."
    },
    cdphReference: "Pressure Ulcer Prevention; Repositioning",
    keywords: ['repositioning', 'pressure ulcer', '2 hours', 'prevention'],
    difficulty: 'easy'
  },
  {
    id: 160,
    category: 'body-mechanics',
    scenario: "You need to position a resident in the Fowler's position.",
    stem: "How is this position achieved?",
    options: {
      A: "Lying flat on the back",
      B: "Head of bed raised 45-60 degrees with knees slightly elevated",
      C: "Lying on the side",
      D: "Lying face down"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Fowler's position involves raising the head of the bed 45-60 degrees. This helps with breathing, eating, and reduces aspiration risk.",
      incorrectA: "Flat on back is supine position.",
      incorrectC: "Lying on side is lateral position.",
      incorrectD: "Face down is prone position."
    },
    cdphReference: "Positioning Terminology",
    keywords: ['Fowler\'s position', 'positioning', 'head elevated', 'angles'],
    difficulty: 'easy'
  },
  {
    id: 161,
    category: 'body-mechanics',
    scenario: "A resident is at risk for heel pressure ulcers.",
    stem: "What position modification can help?",
    options: {
      A: "Keep heels firmly on the mattress",
      B: "Float heels off the bed using pillows under the calves",
      C: "Apply pressure to heels to increase circulation",
      D: "Wrap heels tightly with bandages"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Floating heels (placing pillows under calves so heels are suspended) eliminates pressure on the heels entirely, preventing ulcer development.",
      incorrectA: "Heels on mattress creates pressure.",
      incorrectC: "More pressure worsens ulcer risk.",
      incorrectD: "Tight wrapping doesn't relieve pressure and can impair circulation."
    },
    cdphReference: "Heel Pressure Ulcer Prevention",
    keywords: ['heel', 'pressure ulcer', 'floating', 'prevention'],
    difficulty: 'easy'
  },
  {
    id: 162,
    category: 'body-mechanics',
    scenario: "When positioning a resident on their side (lateral position), you notice their top leg is crossing over the bottom leg.",
    stem: "What should you do?",
    options: {
      A: "Leave it since the resident is stable",
      B: "Place a pillow between the legs to maintain alignment and reduce pressure",
      C: "Straighten both legs completely",
      D: "Cross the legs more for added stability"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "A pillow between the knees maintains spinal alignment, reduces pressure between bony surfaces, and increases comfort.",
      incorrectA: "Crossed legs create pressure points between knees and ankles.",
      incorrectC: "Slight knee bend is more comfortable than straight legs.",
      incorrectD: "Crossing increases pressure point risk."
    },
    cdphReference: "Lateral Positioning",
    keywords: ['lateral position', 'pillow', 'alignment', 'pressure points'],
    difficulty: 'easy'
  },
  {
    id: 163,
    category: 'body-mechanics',
    scenario: "You need to turn a resident toward you.",
    stem: "Why is it generally safer to pull toward you rather than push away?",
    options: {
      A: "It's faster",
      B: "You have more control and can use your body weight for leverage",
      C: "It's easier for the resident",
      D: "There's no difference"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Pulling toward you allows better control and use of body weight. You can also see the resident and their face throughout the turn.",
      incorrectA: "Speed isn't the primary safety factor.",
      incorrectC: "It's primarily about staff safety and control.",
      incorrectD: "There is a significant difference in control and safety."
    },
    cdphReference: "Turning and Repositioning",
    keywords: ['turning', 'pulling', 'control', 'body mechanics'],
    difficulty: 'easy'
  },
  {
    id: 164,
    category: 'body-mechanics',
    scenario: "What is the Sims' (semi-prone) position used for?",
    stem: "Select the BEST answer:",
    options: {
      A: "Eating meals",
      B: "Rectal procedures and enemas",
      C: "Breathing treatments",
      D: "Blood pressure measurements"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Sims' position (left side-lying, semi-prone, right knee drawn up) provides access for rectal examinations, enemas, and suppository insertion.",
      incorrectA: "Eating requires more upright positioning.",
      incorrectC: "Breathing treatments use upright positions.",
      incorrectD: "Blood pressure is usually taken sitting or lying supine."
    },
    cdphReference: "Positioning for Procedures",
    keywords: ['Sims\' position', 'rectal', 'enema', 'procedure'],
    difficulty: 'easy'
  },
  {
    id: 165,
    category: 'body-mechanics',
    scenario: "You are standing for long periods while providing care.",
    stem: "What technique helps reduce back strain?",
    options: {
      A: "Lock your knees to stay stable",
      B: "Stand with feet together for better balance",
      C: "Keep a wide, stable base of support and shift weight periodically",
      D: "Lean forward over the resident for closer access"
    },
    correctAnswer: 'C',
    explanation: {
      correct: "A wide stance provides stability, and shifting weight reduces fatigue and strain on any one area.",
      incorrectA: "Locked knees cause fatigue and can lead to fainting.",
      incorrectB: "Feet together is less stable.",
      incorrectD: "Leaning forward strains the back."
    },
    cdphReference: "Standing Body Mechanics",
    keywords: ['standing', 'base of support', 'strain', 'posture'],
    difficulty: 'easy'
  },
  {
    id: 166,
    category: 'body-mechanics',
    scenario: "A resident needs to be moved from bed to stretcher. You have only two staff members available.",
    stem: "What is the safest approach?",
    options: {
      A: "Proceed with just two people",
      B: "Get at least one more person; lateral transfers typically require 3-4 staff",
      C: "Have the resident move themselves",
      D: "Use just a draw sheet pulled by one person"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Lateral transfers (bed to stretcher) are high-risk and typically require 3-4 staff with a slide board or proper transfer equipment.",
      incorrectA: "Two people is usually insufficient for safe lateral transfer.",
      incorrectC: "If the resident could safely move themselves, they wouldn't need a stretcher.",
      incorrectD: "One person pulling is unsafe and insufficient."
    },
    cdphReference: "Lateral Transfer Safety",
    keywords: ['stretcher', 'lateral transfer', 'staffing', 'safety'],
    difficulty: 'medium'
  },
  {
    id: 167,
    category: 'body-mechanics',
    scenario: "You need to adjust the height of the bed before providing care.",
    stem: "At what height should the bed be positioned for your comfort?",
    options: {
      A: "As low as possible to prevent falls",
      B: "At your waist height to avoid bending or reaching",
      C: "At the highest setting for best visibility",
      D: "It doesn't matter; just work quickly"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Waist height allows working without excessive bending or reaching, reducing back strain. Adjust for each task and return to low when leaving.",
      incorrectA: "Low beds are for fall prevention when leaving, not for providing care.",
      incorrectC: "Too high causes reaching and shoulder strain.",
      incorrectD: "Proper height is essential for back safety."
    },
    cdphReference: "Bed Height Adjustment",
    keywords: ['bed height', 'waist height', 'ergonomics', 'back safety'],
    difficulty: 'easy'
  },

  // ========== HIPAA & CONFIDENTIALITY (8 questions) ==========
  {
    id: 168,
    category: 'hipaa',
    scenario: "A former neighbor of a resident asks you how the resident is doing.",
    stem: "What is the correct response?",
    options: {
      A: "Give a brief health update since they know each other",
      B: "Explain that you cannot share patient information without authorization",
      C: "Confirm the resident is there but give no other details",
      D: "Tell them to ask the resident directly during visiting hours"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "HIPAA prohibits sharing any patient information (including confirming someone is a patient) without proper authorization.",
      incorrectA: "No health information can be shared without authorization.",
      incorrectC: "Even confirming presence reveals protected information.",
      incorrectD: "While visiting is an option, still cannot confirm the person is there."
    },
    cdphReference: "HIPAA Privacy Rule",
    keywords: ['HIPAA', 'neighbor', 'privacy', 'authorization'],
    difficulty: 'easy'
  },
  {
    id: 169,
    category: 'hipaa',
    scenario: "You notice a resident's medical chart left open at the nurses' station where visitors can see it.",
    stem: "What should you do?",
    options: {
      A: "Leave it since you didn't open it",
      B: "Close the chart or turn it face-down to protect confidentiality",
      C: "Read it since it's already open",
      D: "Take a photo to show the nurse later"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Everyone has responsibility to protect patient privacy. Close the chart to prevent unauthorized viewing.",
      incorrectA: "Protecting privacy is everyone's responsibility.",
      incorrectC: "Only access information you need for care.",
      incorrectD: "Taking photos of medical records is a serious violation."
    },
    cdphReference: "HIPAA; Physical Safeguards",
    keywords: ['chart', 'privacy', 'confidentiality', 'protection'],
    difficulty: 'easy'
  },
  {
    id: 170,
    category: 'hipaa',
    scenario: "A nursing student asks to look at a resident's chart for a case study.",
    stem: "What should you tell them?",
    options: {
      A: "Sure, as long as they're a healthcare student",
      B: "They need to get proper authorization from their instructor and the facility",
      C: "Only if they promise not to tell anyone",
      D: "No students are ever allowed to see charts"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Access to patient information requires proper authorization. Students must go through appropriate channels with instructor and facility approval.",
      incorrectA: "Being a student doesn't automatically grant access.",
      incorrectC: "Informal promises don't satisfy HIPAA requirements.",
      incorrectD: "Students can access information with proper authorization."
    },
    cdphReference: "HIPAA; Access Authorization",
    keywords: ['student', 'authorization', 'access', 'case study'],
    difficulty: 'easy'
  },
  {
    id: 171,
    category: 'hipaa',
    scenario: "You are discussing a resident's care in the hallway when you notice a family member of another resident walking by.",
    stem: "What should you do?",
    options: {
      A: "Continue the conversation quietly",
      B: "Stop the conversation or move to a private area",
      C: "Speak louder so there's no question about what you're saying",
      D: "Turn your back to the family member and continue"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Discussions about residents should occur in private areas where they cannot be overheard by unauthorized individuals.",
      incorrectA: "Even quiet conversations in public areas risk being overheard.",
      incorrectC: "Speaking louder increases the likelihood of others hearing.",
      incorrectD: "Physical position doesn't make the conversation private."
    },
    cdphReference: "HIPAA; Private Communications",
    keywords: ['privacy', 'hallway', 'overheard', 'private area'],
    difficulty: 'easy'
  },
  {
    id: 172,
    category: 'hipaa',
    scenario: "A resident asks to see their own medical records.",
    stem: "What should the CNA tell them?",
    options: {
      A: "Residents are not allowed to see their records",
      B: "You have the right to access your records; let me get the nurse to help you",
      C: "I can read them to you right now",
      D: "You'll need to hire a lawyer first"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Patients have the right to access their medical records. The CNA should refer the request to the nurse or appropriate staff member to facilitate this.",
      incorrectA: "Patients have a legal right to access their records.",
      incorrectC: "There are proper procedures for providing access; the CNA doesn't just read charts aloud.",
      incorrectD: "No lawyer is required to access one's own records."
    },
    cdphReference: "HIPAA; Patient Access Rights",
    keywords: ['patient rights', 'access', 'medical records', 'HIPAA'],
    difficulty: 'easy'
  },
  {
    id: 173,
    category: 'hipaa',
    scenario: "You're off duty and a friend asks about a celebrity who is a patient at your facility.",
    stem: "What should you say?",
    options: {
      A: "Share some general information since everyone will find out anyway",
      B: "Refuse to confirm or deny anything about patients at your facility",
      C: "Tell them but ask them to keep it secret",
      D: "Only share if they promise not to post it on social media"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "HIPAA applies at all times, on or off duty. You cannot confirm or share any patient information, regardless of their celebrity status.",
      incorrectA: "Public interest doesn't override privacy rights.",
      incorrectC: "Secret promises don't satisfy legal requirements.",
      incorrectD: "Social media restrictions don't make initial disclosure acceptable."
    },
    cdphReference: "HIPAA; Celebrity Patients",
    keywords: ['celebrity', 'off duty', 'privacy', 'confidentiality'],
    difficulty: 'easy'
  },
  {
    id: 174,
    category: 'hipaa',
    scenario: "The police arrive asking for information about a resident involved in a crime investigation.",
    stem: "What should the CNA do?",
    options: {
      A: "Provide all information immediately since it's the police",
      B: "Refer them to the supervisor or administrator to handle the request",
      C: "Tell them you don't know anything even if you do",
      D: "Ask for their badge number and then share information"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Law enforcement requests for patient information must go through proper channels. Refer to administration who can determine proper legal requirements.",
      incorrectA: "Even police requests must follow proper procedures.",
      incorrectC: "Lying is not appropriate; refer to supervisors.",
      incorrectD: "Badge number doesn't authorize information release."
    },
    cdphReference: "HIPAA; Law Enforcement Requests",
    keywords: ['police', 'law enforcement', 'disclosure', 'supervisor'],
    difficulty: 'medium'
  },
  {
    id: 175,
    category: 'hipaa',
    scenario: "You accidentally access a resident's file that you were not assigned to.",
    stem: "What should you do?",
    options: {
      A: "Close it immediately and pretend it didn't happen",
      B: "Report the accidental access to your supervisor",
      C: "Continue reviewing since you're already in",
      D: "Ask the resident for permission retroactively"
    },
    correctAnswer: 'B',
    explanation: {
      correct: "Accidental access should be reported. Electronic systems often log access, and self-reporting demonstrates integrity and allows proper documentation.",
      incorrectA: "Pretending it didn't happen could look suspicious if discovered.",
      incorrectC: "Continuing to review is an intentional violation.",
      incorrectD: "Resident permission doesn't cover workplace access policies."
    },
    cdphReference: "HIPAA; Accidental Access; Self-Reporting",
    keywords: ['accidental access', 'self-reporting', 'integrity', 'HIPAA'],
    difficulty: 'medium'
  }
];

export default cnaQuestions;
