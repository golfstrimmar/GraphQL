import prisma from "../prisma/client.js";
import { extractFigmaData } from "../utils/figmaExtractors.js";

const getFigmaProjectData = async (_, { projectId }) => {
  if (!projectId) throw new Error("Missing projectId");

  const project = await prisma.figmaProject.findUnique({
    where: { id: Number(projectId) },
    include: { owner: true, figmaImages: true },
  });

  if (!project) throw new Error("Project not found");

  const realJsonContent =
    typeof project.fileCache === "string"
      ? JSON.parse(project.fileCache)
      : project.fileCache;

  // Получаем все необходимые данные одной функцией
  const { colors, fonts, textNodes } = extractFigmaData(realJsonContent);

  return {
    project,
    colors,
    fonts,
    textNodes,
  };
};

export default getFigmaProjectData;
