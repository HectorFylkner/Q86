const MAX_SLUG_WORDS = 12;

export function semanticSlug(value: string): string {
  const normalized = value
    .replace(/\\\\(?:dfrac|frac)\{([^{}]*)\}\{([^{}]*)\}/g, "$1 over $2")
    .replace(/\\\\(?:text|operatorname)\{([^{}]*)\}/g, "$1")
    .replace(/\\\\[a-zA-Z]+/g, " ")
    .replace(/[{}$*_`~]/g, " ")
    .replace(/&(?:ge|le|gt|lt);/g, " ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .slice(0, MAX_SLUG_WORDS)
    .join("-");
  if (!normalized) throw new Error(`Cannot derive a semantic slug from: ${value}`);
  return normalized;
}

export function conceptId(chapter: string, semanticName: string): string {
  const section = chapter === "data_sufficiency_discipline" || chapter === "choosing_fastest_path"
    ? "strategy"
    : "quant";
  return `c.q86.${section}.${chapter}.${semanticSlug(semanticName)}`;
}

export function sourceIdeaId(chapter: string, semanticName: string): string {
  return `idea.q86.${chapter}.${semanticSlug(semanticName)}`;
}

export function entityId(kind: string, chapter: string, semanticName: string): string {
  return `${kind}.q86.${chapter}.${semanticSlug(semanticName)}`;
}
