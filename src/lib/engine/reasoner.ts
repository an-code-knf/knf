/**
 * Narrative generation is factored behind this interface so the deterministic
 * rule engine (scoring.ts, comparison.ts, negotiation.ts) can stay in charge of
 * the numbers, while *how the numbers get explained in prose* is swappable.
 *
 * Today `TemplateReasoner` renders rationale from the same factors the rule
 * engine already computed — no network call, nothing to configure. Swapping in
 * a real model later (e.g. an `AnthropicReasoner` calling the Claude API) only
 * means implementing this interface and changing the export at the bottom of
 * the file — nothing upstream (routes, UI, scoring) has to change.
 */
export interface Reasoner {
  summarize(input: ReasonerInput): Promise<string>;
}

export interface ReasonerInput {
  kind: "interview-decision" | "stay-vs-offer" | "negotiation";
  headline: string;
  pros: string[];
  cons: string[];
  facts: Record<string, string | number>;
}

class TemplateReasoner implements Reasoner {
  async summarize(input: ReasonerInput): Promise<string> {
    const { headline, pros, cons } = input;
    const parts: string[] = [headline];

    if (pros.length > 0) {
      parts.push(`In favor: ${pros.join("; ")}.`);
    }
    if (cons.length > 0) {
      parts.push(`Working against it: ${cons.join("; ")}.`);
    }

    return parts.join(" ");
  }
}

// Swap this line for an LLM-backed implementation when ready
// (e.g. `export const reasoner: Reasoner = new AnthropicReasoner();`).
export const reasoner: Reasoner = new TemplateReasoner();
