function buildScssMixVar(
  prev: string,
  uniqueMixins: TextNode[],
  colorsTo: string[],
): string {
  const prevText = prev ?? "";

  // ---------- 1. МИКСИНЫ ИЗ prev ----------
  const mixinRegex = /@mixin\s+\S+\s*{[\s\S]*?}/g;
  const existingMixinBlocks = prevText.match(mixinRegex) || [];
  const existingMixinNames = new Set<string>();
  existingMixinBlocks.forEach((block) => {
    const name = block.match(/@mixin\s+(\S+)/)?.[1];
    if (name) existingMixinNames.add(name);
  });
  const prevWithoutMixins = prevText.replace(mixinRegex, "");

  // ---------- 2. ЦВЕТА ИЗ prev ----------
  const prevColorLines: string[] = [];
  let maxColorIndex = 0;
  const existingColorValues = new Set<string>();

  prevWithoutMixins
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l) => l.trim())
    .forEach((line) => {
      const m = line.match(/^\s*(\$color-(\d+)):\s*(.+);?\s*$/);
      if (m) {
        const idx = Number(m[2]);
        let value = m[3].trim(); // rgb(...); или rgb(...);;;
        value = value.replace(/;+\s*$/, ""); // убираем хвост ;;;
        if (!Number.isNaN(idx)) {
          maxColorIndex = Math.max(maxColorIndex, idx);
        }
        prevColorLines.push(`${m[1]}: ${value};`);
        existingColorValues.add(value);
      }
    });

  // ---------- 3. ИМПОРТЫ и прочий текст из prev ----------
  const importLines: string[] = [];
  const otherLines: string[] = [];

  prevWithoutMixins
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l) => l.trim())
    .forEach((line) => {
      if (line.includes("https://fonts.googleapis.com")) {
        if (!importLines.includes(line)) importLines.push(line);
      } else if (!line.match(/\$color-\d+:/)) {
        otherLines.push(line);
      }
    });

  // ---------- 4. НОВЫЕ МИКСИНЫ из createMixins ----------
  const newMixinsBlocks: string[] = [];
  mixins
    .split(/(@mixin\s+\S+\s*{[\s\S]*?})/)
    .filter(Boolean)
    .forEach((block) => {
      const name = block.match(/@mixin\s+(\S+)/)?.[1];
      if (name && !existingMixinNames.has(name)) {
        existingMixinNames.add(name);
        newMixinsBlocks.push(block.trim());
      }
    });

  // ---------- 5. НОВЫЕ ЦВЕТА с продолжением нумерации (по УНИКАЛЬНЫМ значениям) ----------
  const newColorLines: string[] = [];
  let colorIndex = maxColorIndex;

  colorsTo.forEach((colorValue) => {
    const valueMatch = colorValue.match(/:\s*(.+);?$/);
    let value = valueMatch ? valueMatch[1].trim() : colorValue.trim();
    value = value.replace(/;+\s*$/, ""); // убираем ;; если прилетели

    if (existingColorValues.has(value)) {
      // такое значение уже есть → переменную не создаём
      return;
    }

    existingColorValues.add(value);
    colorIndex += 1;
    newColorLines.push(`$color-${colorIndex}: ${value};`);
  });

  // ---------- 6. ИМПОРТЫ ИЗ googleFonts ----------
  if (googleFonts) {
    googleFonts
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("@import"))
      .forEach((line) => {
        if (!importLines.includes(line)) {
          importLines.push(line);
        }
      });
  }

  // ---------- 7. Сборка: импорты → переменные → миксины → остальное ----------
  const colorLines = [...prevColorLines, ...newColorLines];
  const mixinBlocksAll = [
    ...existingMixinBlocks.map((b) => b.trim()),
    ...newMixinsBlocks,
  ];

  const parts: string[] = [];

  if (importLines.length) {
    parts.push(importLines.join("\n"));
  }

  if (colorLines.length) {
    parts.push(colorLines.join("\n"));
  }

  if (mixinBlocksAll.length) {
    parts.push(mixinBlocksAll.join("\n\n"));
  }

  if (otherLines.length) {
    parts.push(otherLines.join("\n"));
  }

  let result = parts
    .join("\n\n")
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l) => l.trim())
    .join("\n");
  // ---------- 8. ЗАМЕНА цветов в миксинах на переменные ----------
  const colorMap = new Map<string, string>();
  colorLines.forEach((line) => {
    const m = line.match(/(\$color-\d+):\s*(.+);/);
    if (m) {
      const name = m[1]; // $color-1
      const value = m[2].trim(); // rgb(...), #fff и т.п.
      colorMap.set(value, name);
    }
  });

  if (colorMap.size > 0) {
    result = result.replace(mixinRegex, (block) => {
      let newBlock = block;
      colorMap.forEach((varName, value) => {
        const valueEscaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp(`(color:\\s*)${valueEscaped}(\\s*;)`, "g");
        newBlock = newBlock.replace(re, `$1${varName}$2`);
      });
      return newBlock;
    });
  }

  return result;
}
export default buildScssMixVar;
