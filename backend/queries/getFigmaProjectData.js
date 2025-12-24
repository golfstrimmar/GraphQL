import prisma from "../prisma/client.js";
import { extractFigmaData } from "../utils/figmaExtractors.js";

const getFigmaProjectData = async (_, { projectId }) => {
  if (!projectId) throw new Error("Missing projectId");

  let project = await prisma.figmaProject.findUnique({
    where: { id: Number(projectId) },
    include: { owner: true, figmaImages: true },
  });
  if (!project) throw new Error("Project not found");

  // Если данные уже есть в колонках — просто вернуть
  if (project.colors && project.fonts && project.textNodes) {
    return project;
  }

  // Иначе один раз посчитать из fileCache и записать в БД
  const realJsonContent =
    typeof project.fileCache === "string"
      ? JSON.parse(project.fileCache)
      : project.fileCache;

  const { colors, fonts, textNodes } = extractFigmaData(realJsonContent);

  project = await prisma.figmaProject.update({
    where: { id: project.id },
    data: {
      colors,
      fonts,
      textNodes,
      fileCacheUpdatedAt: new Date(),
    },
    include: { owner: true, figmaImages: true },
  });

  return project;
};

export default getFigmaProjectData;
