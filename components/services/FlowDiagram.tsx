// Hero visual for /services: the Advanced AI example as a vertical pipeline. Server-rendered, CSS-only motion
// (each step lights up in turn, then a dot travels its rail segment to the next); prefers-reduced-motion shows it at rest.
// The receipt details are fictional sample data.
import type { CSSProperties } from 'react';
import Icon from '@/components/templates/Icon';

const FIELDS = [
  { k: 'Vendor', v: 'Harbor Office Co.' },
  { k: 'Date', v: 'Oct 3' },
  { k: 'Amount', v: '$142.80' },
  { k: 'Category', v: 'Office supplies' },
];

const at = (i: number) => ({ '--i': i }) as CSSProperties;

export default function FlowDiagram() {
  return (
    <figure className="sv-flow" role="img"
      aria-label="Example workflow, Advanced AI package: a receipt arrives by email, AI reads it and extracts the vendor, date, amount and category, the entry is posted in QuickBooks, and an SMS is sent.">
      <div className="sv-flow__card" aria-hidden="true">
        <div className="sv-flow__bar">
          <span><Icon name="bolt" />Receipts to the books</span>
          <span className="pill pill--gray">4 steps</span>
        </div>
        <div className="sv-flow__body">
          <ol className="sv-flow__steps">
            <li className="sv-flow__node" style={at(0)}>
              <span className="sv-flow__ico"><Icon name="mail" /></span>
              <div className="sv-flow__txt"><b>Receipt arrives by email</b><small>receipt_1043.pdf</small></div>
            </li>
            <li className="sv-flow__node" style={at(1)}>
              <span className="sv-flow__ico"><Icon name="sparkle" /></span>
              <div className="sv-flow__txt">
                <b>AI reads the receipt</b>
                <span className="sv-flow__fields">{FIELDS.map(f => <span key={f.k}><i>{f.k}</i>{f.v}</span>)}</span>
              </div>
            </li>
            <li className="sv-flow__node" style={at(2)}>
              <span className="sv-flow__ico"><Icon name="calc" /></span>
              <div className="sv-flow__txt"><b>Entered in QuickBooks</b><small>Expense · Office supplies</small></div>
              <span className="pill pill--grn">Posted</span>
            </li>
            <li className="sv-flow__node" style={at(3)}>
              <span className="sv-flow__ico"><Icon name="chat" /></span>
              <div className="sv-flow__txt"><b>SMS sent</b><small>“Receipt logged: $142.80”</small></div>
            </li>
          </ol>
        </div>
      </div>
      <figcaption className="sv-flow__cap" aria-hidden="true">Example workflow · Advanced AI</figcaption>
    </figure>
  );
}
