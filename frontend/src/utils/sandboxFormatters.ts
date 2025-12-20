import prettier from "prettier/standalone";
import postcssPlugin from "prettier/plugins/postcss";

export function softFormatScss(code: string): string {
  if (!code) return "";

  let src = code.replace(/\r\n/g, "\n");
  src = src.replace(/\u00A0/g, " ");

  // 1. @import: перенос только если дальше реально начинается другая сущность
  //   но не дробим саму строку внутри url(...)
  src = src.replace(/(@import[^\n]+;)\s*(?=\S)/g, "$1\n");

  // 2. Переменные
  src = src.replace(/(\$[a-zA-Z0-9_-]+:[^;]+;)\s*(?=\S)/g, "$1\n");

  // 3. Миксины
  src = src.replace(/(@mixin\s+[^{]+{)/g, "\n$1\n");

  // 4. Закрытие блоков: убираем @import из lookahead
  src = src.replace(/}\s*(?=@mixin|\.[A-Za-z#:$@]|\$|$)/g, "}\n");

  // 5. Точки с запятой: тоже убираем @import из lookahead
  src = src.replace(/;\s*(?=@mixin|\.[A-Za-z#:$@]|\$|$)/g, ";\n");

  // 6. Селекторы с точкой — с новой строки
  src = src.replace(/(\n\s*)(\.[A-Za-z])/g, "\n$2");

  src = src.replace(/\n{3,}/g, "\n\n");

  return src.trim();
}

export async function formatScss(code: string): Promise<string> {
  const soft = softFormatScss(code);
  if (!soft.trim()) return soft;

  try {
    const formatted = await prettier.format(soft, {
      parser: "scss",
      plugins: [postcssPlugin],
    });
    return formatted;
  } catch (e) {
    console.error("Prettier SCSS error:", e);
    // Если Prettier упал — возвращаем хотя бы мягко отформатированный текст
    return soft;
  }
}
