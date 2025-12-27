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
]; // [web:181][web:186][web:190]

function NormalizeSCSS(prev: string, addingScss: string): string {
  if (!addingScss) return prev;

  const base = prev ?? "";

  const addingLines = addingScss
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const hasControlledPropsInAdding = addingLines.some((line) =>
    /(background-color|background|display)\s*:/.test(line),
  );

  let result = base;

  if (hasControlledPropsInAdding) {
    // 1) убираем ВСЕ background/background-color/display
    result = base
      .split("\n")
      .filter((line) => !/(background-color|background|display)\s*:/.test(line))
      .join("\n");
  }

  // 2) анализируем новый display
  const displayLine = addingLines.find((line) => /display\s*:/.test(line));
  if (displayLine) {
    const isFlexDisplay = /display\s*:\s*(flex|inline-flex)\s*;?/i.test(
      displayLine,
    );
    const isGridDisplay = /display\s*:\s*(grid|inline-grid)\s*;?/i.test(
      displayLine,
    );

    // если display НЕ flex → чистим flex-свойства
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

    // если display НЕ grid → чистим grid-свойства
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

  // 3) добавляем все строки из addingScss (как есть, но с ;)
  for (const raw of addingLines) {
    const line = raw.endsWith(";") ? raw : raw + ";";
    result += (result.trim().length ? "\n" : "") + line;
  }

  return result;
}

export default NormalizeSCSS;
