import type { HtmlNode } from "@/types/HtmlNode";

/**
 * Универсальная функция изоляции компонента.
 * Находит корневые элементы и присваивает им уникальный ID.
 * Больше не добавляет технические классы (iso-*) всем вложенным нодам.
 */
export function isolateComponentNodes(nodes: HtmlNode[]): HtmlNode[] {
  return nodes.map((node) => {
    // Генерируем уникальный ID для каждого корневого элемента
    const uniqId = Math.random().toString(36).substring(2, 8);
    const isoId = `iso-${uniqId}`;

    // Добавляем ID в атрибуты, если его там еще нет
    const newAttributes = { 
      ...(node.attributes || {}), 
      id: node.attributes?.id || isoId 
    };

    // Возвращаем ноду с новым ID, сохраняя оригинальные классы из JSON
    return {
      ...node,
      attributes: newAttributes,
    };
  });
}
