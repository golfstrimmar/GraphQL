import prisma from "../prisma/client.js";

// 1. Разбираем URL на fileId и nodeId
const extractFileAndNodeFromUrl = (url) => {
  // file key: .../design/yhmqwKkJ7oxyCZP4GFYzRA/...
  const fileMatch = url.match(/design\/([a-zA-Z0-9_-]+)/);
  if (!fileMatch || !fileMatch[1]) {
    throw new Error("Invalid Figma URL (no file key)");
  }
  const fileId = fileMatch[1];

  // node-id=986-2678&t=...
  const nodeMatch = url.match(/node-id=([^&]+)/);
  const nodeId = nodeMatch ? decodeURIComponent(nodeMatch[1]) : null;

  return { fileId, nodeId };
};

// 2. Фетчим либо конкретный node, либо весь файл (если вдруг без node-id)
const fetchFigmaFileOrNode = async (fileId, nodeId, token) => {
  if (nodeId) {
    const res = await fetch(
      `https://api.figma.com/v1/files/${fileId}/nodes?ids=${encodeURIComponent(nodeId)}`,
      {
        headers: { "X-Figma-Token": token },
      },
    );

    if (!res.ok) {
      throw new Error(
        `Figma API error (nodes): ${res.status} ${res.statusText}`,
      );
    }

    const data = await res.json();
    const nodeData = data.nodes?.[nodeId];
    if (!nodeData || !nodeData.document) {
      throw new Error("Figma: node not found or no document");
    }

    // сохраняем только document этого узла — фрагмент
    return nodeData.document;
  }

  // если nodeId нет — берём весь файл (старое поведение)
  const res = await fetch(`https://api.figma.com/v1/files/${fileId}`, {
    headers: { "X-Figma-Token": token },
  });

  if (!res.ok) {
    throw new Error(`Figma API error (file): ${res.status} ${res.statusText}`);
  }

  return await res.json();
};

// 3. Основной резолвер
const createDesign = async (_, { ownerId, name, figmaUrl }) => {
  const apiKey = process.env.FIGMA_TOKEN;
  if (!apiKey) throw new Error("FIGMA_TOKEN not set");

  // ⬅️ здесь мы ТОЛЬКО парсим URL, а не фетчим
  const { fileId, nodeId } = extractFileAndNodeFromUrl(figmaUrl);

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
    // ⬅️ а здесь уже фетчим либо node, либо весь файл
    const fileCache = await fetchFigmaFileOrNode(fileId, nodeId, apiKey);

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
    console.error("=== 🚨🚨🚨 ===Failed to create FigmaProject:", error);
    throw new Error("Failed to create FigmaProject");
  }
};

export default createDesign;
