
DO $$
DECLARE qid uuid; c uuid; rec jsonb; i int; qs jsonb;
BEGIN
qs := '[
["It is outside the scope of practice for a CNA to",["provide dementia care","insert tubes into a resident''s body","offer emotional support","help a resident eat dinner"],1],
["Chain of command is",["a hierarchical form of communication","used only in the military","outside healthcare","a type of abuse"],0],
["Professionalism in healthcare includes",["compassion","strong work ethic","arriving on time","all of the above"],3],
["Negligence occurs when a caregiver",["fails to follow standards of care","helps with ADLs","reports abuse","documents correctly"],0],
["False imprisonment includes",["allowing free movement","blocking a resident from leaving","respecting choices","using a call light"],1],
["Residents with autism benefit from",["a consistent routine","loud environments","constant touching","rapid schedule changes"],0],
["Receptive aphasia is the inability to",["understand spoken language","walk","see clearly","swallow"],0],
["The first action during a fire is to",["pull alarm","remove resident from danger","call family","close cafeteria"],1],
["Dependent residents should be toileted",["every 2 hours and as needed","once daily","every 8 hours","only on request"],0],
["When transferring a resident, the CNA should",["bend at the waist","use proper body mechanics","pull under the arms","twist the back"],1],
["Residents should be repositioned in bed at least every",["1 hour","2 hours","4 hours","6 hours"],1],
["A resident unable to bear weight requires",["mechanical lift","walker only","cane","one-person pivot"],0],
["The best device for a bedridden resident''s weight is",["standing scale","wheelchair scale","bed scale","stadiometer"],2],
["Fluid intake is commonly measured in",["mL","feet","grams","inches"],0],
["The normal adult pulse range is",["20-40","40-60","60-100","100-140"],2],
["Tachypnea means",["slow pulse","rapid respirations","high blood pressure","low temperature"],1],
["The nursing assistant should wash hands after",["using restroom","removing gloves","contact with body fluids","all of the above"],3],
["Standard precautions are used for",["all residents","infected residents only","children only","hospital patients only"],0],
["MRSA commonly occurs",["on the skin","in bones","in hair","in fingernails"],0],
["A resident with influenza requires",["droplet precautions","no precautions","burn precautions","sterile technique"],0],
["After feeding a resident, keep the head of bed",["flat","upright","lowered","sideways"],1],
["A resident on a gluten-free diet should avoid",["rice","bagels","fruit","milk"],1],
["The major risk factor for pressure injuries is",["immobility","exercise","hydration","youth"],0],
["Symptoms of Parkinson''s disease include",["tremors","night sweats","joint redness","blurred vision"],0],
["Cloudy foul-smelling urine may indicate",["stroke","UTI","arthritis","COPD"],1],
["The most common dementia is",["vascular","Lewy body","Alzheimer''s","Parkinson''s"],2],
["A gradual thinning of bone tissue is",["arthritis","contracture","osteoporosis","kyphosis"],2],
["Chest pain with sweating may indicate",["stroke","myocardial infarction","TB","asthma"],1],
["Range-of-motion exercises help",["prevent contractures","reduce atrophy","improve circulation","all of the above"],3],
["Abduction means",["moving away from midline","moving toward midline","bending","rotating"],0],
["NPO means",["nothing by mouth","new patient order","normal pulse","nursing procedure"],0],
["Objective information includes",["resident feelings","observed limp","opinions","guesses"],1],
["Cheyne-Stokes breathing occurs near",["exercise","sleep","death","therapy"],2],
["Mottling often appears on the",["legs and feet","hands","hair","abdomen"],0],
["Battery is",["threatening a resident","touching without permission","forgetting charting","ignoring call lights"],1],
["Residents may fear reporting abuse because",["they fear retaliation","they enjoy it","they forget","they dislike staff"],0],
["A nosey cup helps residents who",["cannot tilt head back","cannot walk","cannot hear","cannot chew"],0],
["The physical therapist focuses on",["gross motor skills","speech","vision","hearing"],0],
["The best position for an enema is",["supine","prone","Sims''s","high Fowler''s"],2],
["A CNA should report falls",["at shift end","immediately","only if injury occurs","to family first"],1],
["The abbreviation PRN means",["every day","nothing by mouth","as needed","twice daily"],2],
["A resident with dementia who wanders may benefit from",["alarm system","restraints","isolation","sedation"],0],
["A sign of hypoglycemia is",["shakiness","fever","dry cough","rash"],0],
["Residents with COPD often experience",["shortness of breath","hearing loss","vomiting","vision changes"],0],
["A CNA should use a gait belt during",["transfers","charting","feeding","specimen collection"],0],
["The CDC recommends HIV testing for",["healthcare workers only","all people ages 13-64","children only","older adults only"],1],
["One-sided weakness may indicate",["stroke","UTI","fracture","dehydration"],0],
["Maslow''s highest level is",["esteem","love","physiological","self-actualization"],3],
["The best way to prevent skin rashes in folds is",["keep clean and dry","use powder only","wash weekly","cover with blankets"],0],
["A CNA should document",["facts and observations","opinions","guesses","rumors"],0]
]'::jsonb;

FOREACH c IN ARRAY ARRAY[
  '5c51a2a9-c7de-42cd-b151-d8f6a3653f1b',
  '8b8888ae-60e1-4189-b701-b9b1307cf916',
  '917c5cbd-38e4-4c41-a812-c9e6cafc110b']::uuid[]
LOOP
  SELECT id INTO qid FROM public.quizzes WHERE course_id = c AND title = 'Midterm Examination' LIMIT 1;
  IF qid IS NULL THEN
    INSERT INTO public.quizzes (course_id, title, instructions, total_points, attempts_allowed, time_limit_minutes, published, answer_key_status)
    VALUES (c, 'Midterm Examination',
      'Health Star Academy CNA Midterm Examination — 50 multiple-choice questions, 1 point each. Content adapted from August Learning Solutions, Nursing Assistant Certification California Edition, Second Edition (c) 2024.',
      50, 1, 60, false, 'keyed')
    RETURNING id INTO qid;
  ELSE
    UPDATE public.quizzes SET total_points = 50, attempts_allowed = 1, time_limit_minutes = 60, answer_key_status = 'keyed' WHERE id = qid;
    DELETE FROM public.quiz_questions WHERE quiz_id = qid;
  END IF;

  i := 0;
  FOR rec IN SELECT * FROM jsonb_array_elements(qs) LOOP
    i := i + 1;
    INSERT INTO public.quiz_questions (quiz_id, prompt, options, correct_answer, points, position, question_type)
    VALUES (
      qid,
      rec->>0,
      (SELECT jsonb_agg(jsonb_build_object('text', o)) FROM jsonb_array_elements_text(rec->1) o),
      rec->2,
      1, i, 'multiple_choice');
  END LOOP;
END LOOP;
END $$;
