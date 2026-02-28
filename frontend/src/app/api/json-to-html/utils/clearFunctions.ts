import defaults from "@/app/api/json-to-html/utils/default";
const { selfClosingTags, SERVICE_TEXTS } = defaults;
// ===>===>  html  ===>===>===>===>===>===>===>
function buildAttrs(node) {
  const { class: cls, attributes = {} } = node;
  const attrs: string[] = [];

  if (cls) attrs.push(`class="${cls}"`);

  Object.entries(attributes).forEach(([key, value]) => {
    if (value == null || value === "") return;
    if (value !== "style") {
      attrs.push(`${key}="${String(value)}"`);
    }
  });

  return attrs.length ? " " + attrs.join(" ") + "" : "";
}

function cleanServiceText(raw: string): string {
  if (!raw) return "";
  let text = raw;
  const sorted = [...SERVICE_TEXTS].sort((a, b) => b.length - a.length);
  sorted.forEach((word) => {
    const pattern = word.replace(/\s+/g, "\\s+");
    const re = new RegExp(`^\\s*${pattern}\\s*$`, "i");
    if (re.test(text)) text = "";
  });

  return text;
}
const parseHtml = (nodes) => {
  let html = "";

  nodes.forEach((node) => {
    if (!node || !node.tag || node.tag === "style") return;
    const { tag, text, attributes = {}, children = [] } = node;
    const attrsStr = buildAttrs(node);
    const cleanedText = cleanServiceText(text || "");

    let childHtml = "";
    if (Array.isArray(children) && children.length > 0) {
      childHtml = parseHtml(children);
    }

    const lowerTag = String(tag).toLowerCase();
    let htmlItem: string;

    if (selfClosingTags.has(lowerTag)) {
      htmlItem = `<${tag}${attrsStr}/>`;
    } else {
      htmlItem = `<${tag}${attrsStr}>${cleanedText}${childHtml}</${tag}>`;
    }

    html += htmlItem;
  });

  return html;
};
// ===>===> scss ===>===>===>===>===>===>===>===>
const buildScss = (nodes, isRoot = true) => {
  let resSCSS = "";
  const StyleTags = nodes.filter((node) => node.tag === "style");
  if (StyleTags.length > 0) {
    StyleTags.forEach((styleTag) => {
      const styleContent = styleTag.text || "";
      resSCSS += styleContent;
    });
  }
  nodes.forEach((node) => {
    if (!node || !node.tag) return;

    const cls = node.class;
    const styleStr = node.style || "";
    const tag = node.tag;

    const currentSelector = cls ? `.${cls}` : tag;

    const childrenScss =
      Array.isArray(node.children) && node.children.length > 0
        ? buildScss(node.children, false)
        : "";

    let blockBody = "";
    if (styleStr) {
      blockBody += styleStr;
    }
    if (childrenScss) {
      blockBody += childrenScss;
    }
    if (blockBody) {
      resSCSS += `${currentSelector}{${blockBody}}`;
    }
  });

  return resSCSS;
};

const clearFunctions = {
  parseHtml,
  buildScss,
};

export default clearFunctions;
//
// .input-svg svg{position:absolute;width:18px;height:18px;top:50%;left:5px;transform:translateY(-50%);z-index:20;transition:all 0.2s ease-in-out;pointer-events:none;background:transparent;color:#cfd8dc;}.input-svg input+label{left:30px;}.input-svg:hover > svg {color: #455a64;}.input-f.input-svg input {padding-left: 25px;}
