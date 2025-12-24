import prisma from "../prisma/client.js";
import { extractFigmaData } from "../utils/figmaExtractors.js";

const getFigmaProjectData = async (_, { projectId }) => {
  console.log("<===projectId==>", projectId);
  if (!projectId) throw new Error("Missing projectId");

  const project = await prisma.figmaProject.findUnique({
    where: { id: Number(projectId) },
    include: { owner: true, figmaImages: true },
  });
  console.log("<===project==>", project);
  if (!project) throw new Error("Project not found");

  const realJsonContent =
    typeof project.fileCache === "string"
      ? JSON.parse(project.fileCache)
      : project.fileCache;

  // Получаем все необходимые данные одной функцией
  const { colors, fonts, textNodes } = extractFigmaData(realJsonContent);

  return {
    ...project,
    colors: colors ?? [],
    fonts: fonts ?? [],
    textNodes: textNodes ?? [],
  };
};

export default getFigmaProjectData;
