import prettier from "prettier/standalone";
import parserScss from "prettier/parser-postcss";

export async function formatScss(code: string): Promise<string> {
  if (!code.trim()) return code;

  return prettier.format(code, {
    parser: "scss",
    plugins: [parserScss],
  });
}
