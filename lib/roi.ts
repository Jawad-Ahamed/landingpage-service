// Admin Hours ROI Calculator: one set of formulas for the page (client) and the results email (server), so the
// email always shows exactly what the calculator showed. The server recomputes from the inputs; it never trusts
// result figures sent by the browser.
import { PLANS } from '@/content/data/pricing';

export const WEEKS_PER_MONTH = 4.33;

export const FIRM_TYPES = [
  { id: 'acct', label: 'Accounting & tax', hours: 9, rate: 175 },
  { id: 'legal', label: 'Law firm', hours: 8, rate: 250 },
  { id: 'health', label: 'Healthcare practice', hours: 10, rate: 120 },
  { id: 'other', label: 'Other firm', hours: 8, rate: 125 },
];

/** Slider ranges, also the server's validation bounds. */
export const ROI_LIMITS = {
  team: { min: 1, max: 50, step: 1 },
  hours: { min: 1, max: 25, step: 1 },
  rate: { min: 40, max: 500, step: 5 },
  share: { min: 10, max: 70, step: 5 },
};

export type RoiInput = { team: number; hours: number; rate: number; share: number };

export function roiResults({ team, hours, rate, share }: RoiInput) {
  const adminMonth = team * hours * WEEKS_PER_MONTH;
  const back = adminMonth * (share / 100);
  const plan = team <= 5 ? PLANS[1] : team <= 20 ? PLANS[2] : PLANS[3];
  return { adminMonth, back, perPerson: back / team, value: back * rate, year: back * rate * 12, plan };
}
export type RoiResults = ReturnType<typeof roiResults>;

/** Reads the four inputs from submitted values; null unless every one is a number inside its slider range and step. */
export function roiInputFrom(values: Record<string, string | number>): RoiInput | null {
  const read = (key: keyof RoiInput) => {
    const raw = values[key];
    if (raw === undefined || raw === '') return null;
    const n = Number(raw);
    const { min, max, step } = ROI_LIMITS[key];
    return Number.isFinite(n) && n >= min && n <= max && (n - min) % step === 0 ? n : null;
  };
  const team = read('team'), hours = read('hours'), rate = read('rate'), share = read('share');
  return team === null || hours === null || rate === null || share === null ? null : { team, hours, rate, share };
}

export const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
export const wholeNumber = (n: number) => Math.round(n).toLocaleString('en-US');
