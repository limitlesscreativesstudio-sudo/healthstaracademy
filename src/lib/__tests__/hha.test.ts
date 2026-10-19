import { describe, it, expect } from 'vitest';
import { qualifyHha, buildHhaSheetRow, HHA_QUESTIONS, type HhaApplication } from '../../../supabase/functions/_shared/hha';
const applicant: HhaApplication = { program:'HHA', first_name:'Test',last_name:'Applicant',date_of_birth:'2000-01-01',email:'test@example.com',address:'123 Test St',phone:'2095550100',preferred_schedule:'Either',disclaimer_acknowledged:true,consent_given:true,referral_source:'Other',is_over_16:true,is_under_18:false,has_valid_id:true,has_ssn:true,can_pass_background:true,has_health_proof:true,physically_able:true,has_diploma:true,has_transportation:true,can_pay_fee:true,is_cna:true,wants_cna_next:true };
describe('HHA priority list rules',()=> {
 for (const key of ['is_over_16','has_valid_id','has_ssn','can_pass_background','has_health_proof','physically_able'] as const) it(`${key} is required`,()=>expect(qualifyHha({...applicant,[key]:false}).status).toBe('disqualified'));
 for (const key of ['has_transportation','can_pay_fee','is_cna','wants_cna_next'] as const) it(`${key} is informational`,()=>expect(qualifyHha({...applicant,[key]:false}).status).toBe('qualified'));
 it('under 18 requires consent without disqualification',()=>expect(qualifyHha({...applicant,is_under_18:true})).toMatchObject({status:'qualified',needsConsent:true}));
 it('no diploma requires exam without disqualification',()=>expect(qualifyHha({...applicant,has_diploma:false})).toMatchObject({status:'qualified',needsExam:true}));
 it('sheet uses 30 exact columns including blanks',()=>expect(buildHhaSheetRow(applicant,'2026-10-19')).toEqual(['2026-10-19','Test Applicant','2000-01-01','test@example.com','123 Test St','2095550100','Yes','No','Yes','Yes','Yes','Yes','Yes','Yes','Yes','Yes','Yes','Yes','Either','Yes','Other','Yes','Qualified','No','No','','Yes','','','']));
 it('sheet answers follow eligibility question order',()=>expect(HHA_QUESTIONS.map(q=>q.key)).toEqual(['is_over_16','is_under_18','has_valid_id','has_ssn','can_pass_background','has_health_proof','physically_able','has_diploma','has_transportation','can_pay_fee','is_cna','wants_cna_next']));
});
