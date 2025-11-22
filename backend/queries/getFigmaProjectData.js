import prisma from "../prisma/client.js";
function findAllTextNodes(obj, acc = []) {
  if (!obj || typeof obj !== "object") return acc;
  if (obj.type === "TEXT" && obj.content) acc.push(obj.content);
  if (Array.isArray(obj.children)) {
    obj.children.forEach((child) => findAllTextNodes(child, acc));
  }
  return acc;
}
const getFigmaProjectData = async (_, { projectId }) => {
  if (!projectId) throw new Error("Missing projectId");
  console.log("<====getFigmaProjectData====>", projectId);
  const project = await prisma.figmaProject.findUnique({
    where: { id: Number(projectId) },
    include: { owner: true, figmaImages: true },
  });
  const realJsonContent =
    typeof project.fileCache === "string"
      ? JSON.parse(project.fileCache)
      : project.fileCache;
  //
  const colors = Object.values(realJsonContent.designTokens?.colors || {});
  const fonts = realJsonContent.designTokens?.fonts || {};
  const textNodes = findAllTextNodes(realJsonContent.structure);
  if (!project) throw new Error("Project not found");
  //
  return {
    project,
    colors,
    fonts,
    textNodes,
  };
};

export default getFigmaProjectData;
