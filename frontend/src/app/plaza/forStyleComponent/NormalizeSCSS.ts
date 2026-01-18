const FLEX_PROPS = [
  "flex-wrap",
  "flex-direction",
  "flex-flow",
  "justify-content",
  "align-items",
  "align-content",
  "flex-grow",
  "flex-shrink",
  "flex-basis",
  "gap",
  "row-gap",
  "column-gap",
];

const GRID_PROPS = [
  "grid",
  "grid-template",
  "grid-template-rows",
  "grid-template-columns",
  "grid-template-areas",
  "grid-auto-rows",
  "grid-auto-columns",
  "grid-auto-flow",
  "grid-row",
  "grid-row-start",
  "grid-row-end",
  "grid-column",
  "grid-column-start",
  "grid-column-end",
  "grid-area",
  "place-content",
  "place-items",
  "place-self",
  "justify-items",
  "justify-content",
  "align-items",
  "align-content",
  "row-gap",
  "column-gap",
  "gap",
];

type Block = {
  selector: string | null; // null — корень
  lines: string[];
};

function parseBlocks(scss: string): Block[] {
  const lines = scss.split("\n");
  const blocks: Block[] = [{ selector: null, lines: [] }];
  const stack: Block[] = [];
  let current = blocks[0];

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) continue;

    const openMatch = line.match(/^(&[^{]+)\s*\{$/);
    if (openMatch) {
      const selector = openMatch[1].trim();
      const newBlock: Block = { selector, lines: [] };
      blocks.push(newBlock);
      stack.push(current);
      current = newBlock;
      continue;
    }

    if (line.trim() === "}") {
      current = stack.pop() ?? blocks[0];
      continue;
    }

    current.lines.push(line);
  }

  return blocks;
}

function stringifyBlocks(blocks: Block[]): string {
  return blocks
    .map((b) => {
      if (b.selector == null) return b.lines.join("\n");
      return `${b.selector} {\n${b.lines.join("\n")}\n}`;
    })
    .filter(Boolean)
    .join("\n");
}

function collectOverridePropsBySelector(addingScss: string) {
  const addingLines = addingScss
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const rootProps = new Set<string>();
  const nestedProps = new Map<string, Set<string>>();

  let currentSelector: string | null = null;

  for (const raw of addingLines) {
    const openMatch = raw.match(/^(&[^{]+)\s*\{$/);
    if (openMatch) {
      currentSelector = openMatch[1].trim();
      continue;
    }

    if (raw === "}") {
      currentSelector = null;
      continue;
    }

    const m = raw.match(/^([a-zA-Z-]+)\s*:/);
    if (!m) continue;
    const prop = m[1];

    if (currentSelector == null) {
      rootProps.add(prop);
    } else {
      if (!nestedProps.has(currentSelector)) {
        nestedProps.set(currentSelector, new Set());
      }
      nestedProps.get(currentSelector)!.add(prop);
    }
  }

  return { rootProps, nestedProps };
}

function NormalizeSCSS(prev: string, addingScss: string): string {
  if (!addingScss) return prev;

  const base = prev ?? "";

  const addingLines = addingScss
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let result = base;

  // 2) анализируем новый display
  const displayLine = addingLines.find((line) => /display\s*:/.test(line));
  if (displayLine) {
    const isFlexDisplay = /display\s*:\s*(flex|inline-flex)\s*;?/i.test(
      displayLine,
    );
    const isGridDisplay = /display\s*:\s*(grid|inline-grid)\s*;?/i.test(
      displayLine,
    );

    if (!isFlexDisplay) {
      result = result
        .split("\n")
        .filter((line) => {
          const trimmed = line.trim();
          return !FLEX_PROPS.some((prop) =>
            new RegExp(`^${prop}\\s*:`).test(trimmed),
          );
        })
        .join("\n");
    }

    if (!isGridDisplay) {
      result = result
        .split("\n")
        .filter((line) => {
          const trimmed = line.trim();
          return !GRID_PROPS.some((prop) =>
            new RegExp(`^${prop}\\s*:`).test(trimmed),
          );
        })
        .join("\n");
    }
  }

  // ✨ НОВОЕ: переопределяем свойства в нужных блоках (корень + &:hover и т.п.)
  if (result.trim().length) {
    const blocks = parseBlocks(result);
    const { rootProps, nestedProps } =
      collectOverridePropsBySelector(addingScss);

    // корень
    if (rootProps.size) {
      const root = blocks.find((b) => b.selector == null);
      if (root) {
        root.lines = root.lines.filter((line) => {
          const m = line.trim().match(/^([a-zA-Z-]+)\s*:/);
          if (!m) return true;
          return !rootProps.has(m[1]);
        });
      }
    }

    // вложенные селекторы вида &..., включая &:hover
    for (const [selector, props] of nestedProps) {
      const block = blocks.find((b) => b.selector === selector);
      if (!block) continue;
      block.lines = block.lines.filter((line) => {
        const m = line.trim().match(/^([a-zA-Z-]+)\s*:/);
        if (!m) return true;
        return !props.has(m[1]);
      });
    }

    result = stringifyBlocks(blocks);
  }

  // 3) добавляем все строки из addingScss (как есть, но с ;)
  for (const raw of addingLines) {
    const line = raw.endsWith(";") ? raw : raw + ";";
    result += (result.trim().length ? "\n" : "") + line;
  }

  return result;
}

export default NormalizeSCSS;
