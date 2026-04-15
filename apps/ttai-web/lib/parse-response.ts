export interface ParsedSection {
  title: string;
  body: string;
}

export interface ParsedResponse {
  summary: string;
  sections: ParsedSection[];
}

const SEPARATOR_RE = /^[\s]*[─-]{3,}[\s]*$/;
const BOXED_HEADER_RE = /^[\s]*═{2,}\s*(.+?)\s*═{2,}[\s]*$/;
const NUMBERED_HEADER_RE = /^[\s]*(\d+)[.)]\s+([A-Z][A-Z0-9 &/\-,'()]{2,})[\s]*$/;

function isPlainAllCapsHeader(line: string): string | null {
  const trimmed = line.trim();
  if (trimmed.length < 3 || trimmed.length > 80) return null;
  if (!/[A-Z]/.test(trimmed)) return null;
  if (/[a-z]/.test(trimmed)) return null;
  if (!/^[A-Z0-9][A-Z0-9 &/\-,'():]*$/.test(trimmed)) return null;
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 10) return null;
  return trimmed.replace(/[:]+$/, '');
}

function detectHeader(line: string): string | null {
  const boxed = line.match(BOXED_HEADER_RE);
  if (boxed && boxed[1]) return boxed[1].trim();

  const numbered = line.match(NUMBERED_HEADER_RE);
  if (numbered && numbered[1] && numbered[2]) return `${numbered[1]}. ${numbered[2].trim()}`;

  return isPlainAllCapsHeader(line);
}

export function parseResponseSections(text: string): ParsedResponse {
  const lines = text.split(/\r?\n/);
  const summaryLines: string[] = [];
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;

  for (const line of lines) {
    if (SEPARATOR_RE.test(line)) {
      if (current) {
        sections.push(current);
        current = null;
      }
      continue;
    }

    const header = detectHeader(line);
    if (header) {
      if (current) sections.push(current);
      current = { title: header, body: '' };
      continue;
    }

    if (current) {
      current.body += (current.body ? '\n' : '') + line;
    } else {
      summaryLines.push(line);
    }
  }

  if (current) sections.push(current);

  const cleaned = sections
    .map((s) => ({ title: s.title, body: s.body.replace(/^\n+|\n+$/g, '') }))
    .filter((s) => s.body.trim().length > 0);

  return {
    summary: summaryLines.join('\n').replace(/^\n+|\n+$/g, ''),
    sections: cleaned,
  };
}
