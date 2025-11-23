import prisma from "../prisma/client.js";
import { extractFigmaData } from "../utils/figmaExtractors.js";

const uploadFigmaJsonProject = async (_, { ownerId, name, jsonContent }) => {
  console.log("<====name====>", name);
  const realJsonContent =
    typeof jsonContent === "string" ? JSON.parse(jsonContent) : jsonContent;

  // Получаем все необходимые данные одной функцией
  const { colors, fonts, textNodes } = extractFigmaData(realJsonContent);

  const project = await prisma.figmaProject.create({
    data: {
      name,
      fileKey: realJsonContent?.metadata?.componentName || "json-upload",
      nodeId: "root",
      previewUrl: null,
      fileCache: realJsonContent,
      owner: { connect: { id: Number(ownerId) } },
    },
    include: { owner: true },
  });

  return {
    project,
    colors,
    fonts,
    textNodes,
  };
};

export default uploadFigmaJsonProject;
