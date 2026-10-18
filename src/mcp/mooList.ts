export type MooListValue = string | number | MooListValue[];

export function mooListToArray(mooList: string): MooListValue[] {
  const body = mooList.trim().slice(1, -1);
  const result: MooListValue[] = [];
  let current = '';
  let depth = 0;
  let inString = false;
  let escaping = false;

  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];

    if (escaping) {
      current += char;
      escaping = false;
      continue;
    }

    if (char === '\\' && inString) {
      current += char;
      escaping = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
    } else if (!inString && char === '{') {
      depth += 1;
    } else if (!inString && char === '}') {
      depth -= 1;
    } else if (!inString && char === ',' && depth === 0) {
      commit();
      current = '';
      continue;
    }

    current += char;
  }

  if (current.length > 0) {
    commit();
  }

  return result;

  function commit(): void {
    const value = current.trim();
    if (value.startsWith('{') && value.endsWith('}')) {
      result.push(mooListToArray(value));
    } else if (!Number.isNaN(Number(value))) {
      result.push(Number(value));
    } else if (value.startsWith('"') && value.endsWith('"')) {
      result.push(value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
    } else {
      result.push(value);
    }
  }
}
