export default function cleanConstructorScss(scss: string): string {
  return (
    scss
      // 1. Фоновые цвета конструктора
      .replace(/background:\s*rgb\(220,\s*230,\s*220\);?/g, "")
      .replace(/background:\s*rgb\(226,\s*232,\s*240\);?/g, "")
      .replace(/background:\s*dodgerblue;?/g, "")
      .replace(/background:\s*#22c55e;?/g, "")
      .replace(/background:\s*#8b5cf6;?/g, "")
      .replace(/background:\s*#f97316;?/g, "")
      .replace(/background:\s*#eab308;?/g, "")
      .replace(/background:\s*#0ea5e9;?/g, "")
      .replace(/background:\s*#3b82f6;?/g, "")
      .replace(/background:\s*#06b6d4;?/g, "")
      .replace(/background:\s*#14b8a6;?/g, "")
      .replace(/background:\s*#ef4444;?/g, "")
      .replace(/background:\s*#f59e0b;?/g, "")
      .replace(/background:\s*#84cc16;?/g, "")
      .replace(/background:\s*#6366f1;?/g, "")
      .replace(/background:\s*#ec4899;?/g, "")
      .replace(/background:\s*#737373;?/g, "")
      .replace(/background:\s*#71717a;?/g, "")
      .replace(/background:\s*#f43f5e;?/g, "")
      .replace(/background:\s*#a855f7;?/g, "")
      .replace(/background:\s*#d946ef;?/g, "")
      .replace(/background:\s*#38bdf8;?/g, "")
      .replace(/background:\s*powderblue;?/g, "")
      .replace(/background:\s*rgb\(220,\s*230,\s*220\);?/g, "")
      .replace(/background:\s*rgb\(226,\s*232,\s*240\);?/g, "")
      // 2. Стили конструктора (placeholder, drag)
      .replace(/padding:\s*2px\s*4px;?/g, "")
      .replace(/padding:\s*0px\s*10px\s*0px\s*!important;?/g, "")
      .replace(/padding:\s*10px\s*!important;?/g, "")
      .replace(/border:\s*1px\s*solid\s*rgb\(173,\s*173,\s*173\);?/g, "")
      .replace(/border:\s*1px\s*solid\s*#adadad;?/g, "")

      // 3. Блоки imgs { img { ... } } — чисто конструктор
      .replace(/\.imgs\s*\{[^}]*img\s*\{\s*[^}]*\}[^}]*\}/g, "")

      // 4. Форматирование (экспорт)
      .replace(/\s*\n\s*/g, " ")
      .replace(/\s{2,}/g, " ")
      .replace(/\s*{\s*/g, " { ")
      .replace(/\s*}\s*/g, " } ")
      .replace(/\s*;\s*/g, ";")
      .trim()
  );
}
