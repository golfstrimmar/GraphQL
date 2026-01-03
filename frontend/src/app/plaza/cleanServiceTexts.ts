const SERVICE_TEXTS = [
  "section",
  "container",
  "flex row",
  "flex col",
  "link",
  "span",
  "div",
  "div__wrap",
  "a",
  "button",
  "ul",
  "flex",
  "ul flex row",
  "ul flex col",

  "li",
  "nav",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "legend",
  "article",
  "aside",
  "fieldset",
  "form",
  "header",
  "ol",
  "option",
  "optgroup",
  "select",
  "imgs",
  "img",
  "img-container",
  "img container",
  "hero__wrap",
  "hero__title",
  "hero__content",
  "hero img",
  "hero__img",
  "hero__info",
  "hero__items",
  "slotes",
  "slotes__wrap",
  "slotes__title",
  "slotes__title title",
  "slotes__cards",
  "slotes__cards cards",
  "cards__card",
  "cards__card card",
  "card__title",
  "card__button",
];
function cleanServiceTexts(htmlJson: any[], updateFn: (next: any[]) => void) {
  const serviceSet = new Set(SERVICE_TEXTS.map((t) => t.trim().toLowerCase()));

  function walk(node) {
    if (!node || typeof node !== "object") return node;

    let nextText = node.text;
    if (typeof node.text === "string") {
      const normalizedText = node.text.trim().toLowerCase();
      if (serviceSet.has(normalizedText)) {
        nextText = ""; // ✅ очищаем
      }
    }

    let nextChildren = node.children;
    if (Array.isArray(node.children)) {
      nextChildren = node.children.map(walk);
    }

    return {
      ...node,
      text: nextText,
      children: nextChildren,
    };
  }

  const cleaned = Array.isArray(htmlJson)
    ? htmlJson.map(walk)
    : [walk(htmlJson)];

  updateFn(cleaned);
}

export default cleanServiceTexts;
