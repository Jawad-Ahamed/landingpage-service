// Sample scenarios for the "Ask your documents" demo on the home page: fictional data only.
export type AskScenario = {
  q: string; searching: string; done: string; a: string; cites: string[];
  files: { t?: string; c?: string; n: string; logo?: string }[];
  viz: 'bars' | 'timeline' | 'queue';
  bars?: { l: string; w: number; v: string; cls?: string }[];
  dates?: { d: string; l: string }[];
  queue?: { l: string; p: string }[];
};

export const ASK_SCENARIOS: AskScenario[] = [
  {
    q: 'What did Harbor &amp; Pine spend on contractors in Q3 vs Q2?',
    files: [{ t: 'PDF', c: '#B42318', n: 'HarborPine_PnL_Q3.pdf' }, { t: 'PDF', c: '#B42318', n: 'HarborPine_PnL_Q2.pdf' }, { logo: '/assets/logos/quickbooks.svg', n: 'QuickBooks › Contractor expenses' }],
    searching: 'Reading 2 files and QuickBooks…',
    done: 'Answered from 3 sources',
    a: 'Contractor spend was <span class="num">$48,210</span> in Q3, up <span class="num">18%</span> from <span class="num">$40,860</span> in Q2.',
    viz: 'bars',
    bars: [{ l: 'Q2', w: .72, v: '$40,860' }, { l: 'Q3', w: .85, v: '$48,210', cls: 'q3' }],
    cites: ['PnL_Q3.pdf · p.2', 'PnL_Q2.pdf · p.2', 'QuickBooks · Contractors']
  },
  {
    q: 'When was the breach notice served in Alvarez, and how long after the agreement was signed?',
    files: [{ t: 'PDF', c: '#B42318', n: 'Alvarez_Supply_Agreement_Mar2023.pdf' }, { t: 'PDF', c: '#B42318', n: 'Breach_Notice_Nov2024.pdf' }, { t: 'PDF', c: '#B42318', n: 'Alvarez_Complaint_Feb2025.pdf' }],
    searching: 'Reading 42 files in the matter…',
    done: 'Answered from 3 sources',
    a: 'The notice was served in <span class="num">November 2024</span>, <span class="num">20 months</span> after the March 2023 agreement was signed.',
    viz: 'timeline',
    dates: [{ d: 'Mar 2023', l: 'Agreement signed' }, { d: 'Nov 2024', l: 'Breach notice' }, { d: 'Feb 2025', l: 'Complaint filed' }, { d: 'Jun 2025', l: 'Deposition' }],
    cites: ['Breach_Notice · p.1', 'Supply_Agreement · §9.2', 'Complaint · ¶14']
  },
  {
    q: "Does this patient's chart meet the payer's criteria for a lumbar MRI (CPT 72148)?",
    files: [{ t: 'PDF', c: '#B42318', n: 'Intake_••••4471.pdf · PHI masked' }, { t: 'PDF', c: '#B42318', n: 'PT_Progress_Notes.pdf' }, { t: 'PDF', c: '#B42318', n: 'Payer_Lumbar_MRI_Policy.pdf' }],
    searching: 'Checking chart notes against payer policy…',
    done: 'Answered from 3 sources · patient details masked',
    a: '<span class="num">Likely yes.</span> The notes show <span class="num">8 weeks</span> of physical therapy without relief, and the payer requires at least 6.',
    viz: 'queue',
    queue: [
      { l: 'Conservative care ≥ 6 weeks · 8 documented', p: '<span class="pill pill--grn">Met</span>' },
      { l: 'Radiculopathy documented · ICD-10 M54.16', p: '<span class="pill pill--grn">Met</span>' },
      { l: 'Referring provider NPI', p: '<span class="pill pill--amb">Needs review</span>' }
    ],
    cites: ['PT_Progress_Notes · p.2', 'Payer_Policy · §4.1', 'Intake · PHI masked']
  }
];
