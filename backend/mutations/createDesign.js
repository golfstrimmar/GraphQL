import prisma from "../prisma/client.js";

const extractFileIdFromUrl = (url) => {
  const match = url.match(/design\/([a-zA-Z0-9_-]+)/);
  if (!match || !match[1]) {
    throw new Error("Invalid Figma URL");
  }
  return match[1];
};

const fetchFigmaFile = async (fileId, token) => {
  const response = await fetch(`https://api.figma.com/v1/files/${fileId}`, {
    headers: {
      "X-Figma-Token": token,
    },
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.statusText}`);
  }

  return await response.json();
};

const createDesign = async (_, { ownerId, name, figmaUrl }) => {
  const apiKey = process.env.FIGMA_TOKEN;

  if (!apiKey) {
    throw new Error("FIGMA_TOKEN not set");
  }

  const fileId = extractFileIdFromUrl(figmaUrl);

  const exists = await prisma.figmaProject.findUnique({
    where: {
      ownerId_name: {
        ownerId: Number(ownerId),
        name,
      },
    },
  });

  if (exists) {
    throw new Error(`FigmaProject with name: ${name} already exists`);
  }

  try {
    const fileCache = await fetchFigmaFile(fileId, apiKey);

    const project = await prisma.figmaProject.create({
      data: {
        ownerId: Number(ownerId),
        name,
        fileCache,
        createdAt: new Date(),
      },
      include: { owner: true },
    });

    return project;
  } catch (error) {
    console.error("Failed to create FigmaProject:");
    throw new Error("Failed to create FigmaProject");
  }
};

export default createDesign;
