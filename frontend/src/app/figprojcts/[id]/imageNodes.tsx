type HtmlNode = {
  tag: string;
  class?: string;
  children?: HtmlNode[] | HtmlNode | string;
  text?: string;
  style?: string;
  attributes?: Record<string, string>;
};

function returnCurentImages(currentImgs: HtmlNode[]) {
  const imageNodes = currentImgs
    .filter((img) => img.fileName !== "preview.png")
    .map((img, index) => ({
      tag: "div",
      class: "img-container",
      text: "img-container",
      style:
        "background: rgb(226, 232, 240);\npadding: 2px 4px;\nborder: 1px solid #adadad;\nposition: relative;",
      children: [
        {
          tag: "div",
          text: "imgs",
          class: "imgs",
          style:
            "background: rgb(226, 232, 240);padding: 2px 4px;border: 1px solid #adadad;overflow: hidden;position: absolute;width: 100%;height: 100%;top: 0;left: 0;",
          children: [
            {
              tag: "img",
              text: "",
              class: "",
              style:
                "background: #0ea5e9; padding: 2px 4px; border: 1px solid #adadad;",
              children: [],
              attributes: {
                alt: img.nodeId ?? index.toString(),
                src: img.filePath,
              },
            },
          ],
        },
      ],
    }));
  return imageNodes;
}

export default returnCurentImages;
