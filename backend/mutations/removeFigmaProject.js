import { deleteFromCloudinary } from "../utils/cloudinary.js";
import prisma from "../prisma/client.js";

const removeFigmaProject = async (_parent, { figmaProjectId }) => {
  const id = Number(figmaProjectId);

  const project = await prisma.figmaProject.findUnique({
    where: { id },
    include: { figmaImages: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // 1️⃣ Удаляем все изображения из Cloudinary
  const images = project.figmaImages || [];

  await Promise.all(
    images.map(async (image) => {
      try {
        await deleteFromCloudinary(image);
      } catch (err) {
        console.error(`Cloudinary delete failed for ${image.filePath}`, err);
      }
    }),
  );

  // 2️⃣ Удаляем сам проект (картинки удалятся каскадно по onDelete: Cascade)
  await prisma.figmaProject.delete({
    where: { id },
  });

  // 3️⃣ Возвращаем id удалённого проекта
  return project.id;
};

export default removeFigmaProject;
