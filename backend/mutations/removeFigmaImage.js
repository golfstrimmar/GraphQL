import { deleteFromCloudinary } from "../utils/cloudinary.js";
import prisma from "../prisma/client.js";

const removeFigmaImage = async (_parent, { figmaProjectId, figmaImageId }) => {
  const projectId = Number(figmaProjectId);
  const imageId = Number(figmaImageId);

  // 1. Находим картинку, гарантируя, что она принадлежит этому проекту
  const image = await prisma.figmaImage.findFirst({
    where: {
      id: imageId,
      figmaProjectId: projectId,
    },
  });
  if (!image) {
    throw new Error("Image not found");
  }

  // 2. Удаляем из Cloudinary
  await deleteFromCloudinary(image);

  // 3. Удаляем из БД
  await prisma.figmaImage.delete({
    where: { id: image.id },
  });

  // 4. Возвращаем обновлённый проект с оставшимися картинками
  return prisma.figmaProject.findUnique({
    where: { id: projectId },
    include: {
      figmaImages: true,
    },
  });
};

export default removeFigmaImage;
