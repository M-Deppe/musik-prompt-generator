import { AccordionSection } from "@/components/AccordionSection";

type Props = { sectionLabel: string; accordions?: string[] };

export const Placeholder = ({ sectionLabel, accordions = [] }: Props) => (
  <div className="flex flex-col gap-3">
    {accordions.length > 0 ? (
      accordions.map((a) => (
        <AccordionSection key={a} title={a} optional>
          <p className="py-3 text-center text-xs text-[var(--color-text-faint)]">
            Phase B — Content kommt gleich.
          </p>
        </AccordionSection>
      ))
    ) : (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-6 text-center">
        <p className="text-sm text-[var(--color-text-dim)]">
          Section <span className="text-[var(--color-amber)]">{sectionLabel}</span> — Accordion-Inhalte kommen in Phase B.
        </p>
      </div>
    )}
  </div>
);
