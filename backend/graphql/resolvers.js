import { EventEmitter } from "events";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import prisma from "../prisma/client.js";
import { GraphQLJSON } from "graphql-type-json";

// ----queries
import getFigmaProjectData from "../queries/getFigmaProjectData.js";
// ----mutations
// import uploadFigmaImagesToCloudinary from "../mutations/FigmaImages.js";
// import uploadFigmaSvgsToCloudinary from "../mutations/FigmaSVG.js";
import {
  createUser,
  loginUser,
  setPassword,
  loginWithGoogle,
  removeUser,
} from "../mutations/withUser.js";
import removeFigmaImage from "../mutations/removeFigmaImage.js";
// import transformRasterToSvg from "../mutations/transformRasterToSvg.js";
import removeFigmaProject from "../mutations/removeFigmaProject.js";
// import extractAndSaveColors from "../mutations/extractAndSaveColors.js";
// import extractAndSaveFonts from "../mutations/extractAndSaveFonts.js";
import uploadFigmaJsonProject from "../mutations/uploadFigmaJsonProject.js";
import createFigmaProject from "../mutations/createFigmaProject.js";
import createDesign from "../mutations/createDesign.js";
import createDesignSystem from "../mutations/createDesignSystem.js";
import getDesignSystem from "../queries/getDesignSystem.js";
import getDesignSystemsByUser from "../queries/getDesignSystemsByUser.js";
import updateDesignSystem from "../mutations/updateDesignSystem.js";
import removeDesignSystem from "../mutations/removeDesignSystem.js";
import {
  addDesignImagesToSystem,
  updateDesignImages,
  removeDesignImage,
} from "../mutations/designSystemImages.js";
// ----
import { GraphQLUpload } from "graphql-upload";
// ----

const ee = new EventEmitter();
// Увеличиваем лимит слушателей, чтобы избежать предупреждений в режиме разработки
ee.setMaxListeners(20); // Можно поставить и больше, если нужно

export const resolvers = {
  JSON: GraphQLJSON,
  Upload: GraphQLUpload,
  Query: {
    users: () =>
      prisma.user.findMany({
        include: { projects: true },
      }),
    findProject: (_, { id }) =>
      prisma.project
        .findUnique({
          where: { id: Number(id) },
        })
        .then((project) => (project ? { ...project, owner: null } : null)),
    getAllProjectsByUser: (_, { userId }) =>
      prisma.project.findMany({ where: { ownerId: Number(userId) } }),
    jsonDocumentByName: async (_, { name }) => {
      const Doc = await prisma.jsonDocument.findUnique({ where: { name } });
      return Doc || null;
    },

    figmaProjectsByUser: async (_, { userId }) => {
      return prisma.figmaProject.findMany({
        where: { ownerId: Number(userId) },
        include: { owner: true },
      });
    },
    getFigmaProjectData,
    getDesignSystem,
    getDesignSystemsByUser,
  },
  Mutation: {
    createProject: async (_, { ownerId, name, data, scssMixVar }) => {
      const project = await prisma.project.create({
        data: { name, data, ownerId: Number(ownerId), scssMixVar },
      });
      const user = await prisma.user.findUnique({
        where: { id: Number(ownerId) },
        include: { projects: true },
      });
      ee.emit("USER_UPDATED", user); // <<< ВЫПУСКАЕМ событие для подписки
      return project;
    },
    updateProject: async (_, { projectId, data }) =>
      prisma.project.update({
        where: { id: Number(projectId) },
        data: { data },
      }),

    removeProject: async (_, { projectId }) => {
      const project = await prisma.project.delete({
        where: { id: Number(projectId) },
      });
      const user = await prisma.user.findUnique({
        where: { id: project.ownerId },
        include: { projects: true },
      });
      ee.emit("USER_UPDATED", user); // <<< чтобы подписчики обновили пользователя
      return project.id;
    },
    uploadImage: async (_, { file }) => {
      const { createReadStream, filename } = await file;
      const stream = createReadStream();
      console.log("<==!!== filename ====>", filename);
      try {
        const result = await uploadToCloudinary(
          stream,
          "ulon_projects",
          filename,
        );
        return {
          url: result.secure_url,
          filename: filename,
        };
      } catch (error) {
        console.error("Failed to upload image to Cloudinary:", error);
        throw new Error("Image upload failed.");
      }
    },

    updateFigmaProject: async (_parent, { figmaProjectId, images }) => {
      const id = Number(figmaProjectId);
      console.log("↔↔↔ updateFigmaProject where id =", id);

      const exists = await prisma.figmaProject.findUnique({
        where: { id },
      });

      if (!exists) {
        throw new Error(`FigmaProject ${id} not found`);
      }

      // если нет новых картинок — просто вернуть проект как есть
      if (!images || !images.length) {
        return await prisma.figmaProject.findUnique({
          where: { id },
          include: { figmaImages: true, owner: true },
        });
      }

      const updated = await prisma.figmaProject.update({
        where: { id },
        data: {
          figmaImages: {
            create: images.map((img) => ({
              fileName: img.fileName,
              filePath: img.filePath,
              imageRef: img.imageRef,
              type: img.type,
            })),
          },
        },
        include: {
          figmaImages: true,
          owner: true,
        },
      });

      return updated;
    },

    // removeFigmaImage: async (_parent, { figmaProjectId, figmaImageId }) => {
    //   const projectId = Number(figmaProjectId);
    //   const imageId = Number(figmaImageId);

    //   const project = await prisma.figmaProject.findUnique({
    //     where: { id: projectId },
    //   });

    //   if (!project) {
    //     throw new Error(`FigmaProject ${projectId} not found`);
    //   }

    //   const updated = await prisma.figmaProject.update({
    //     where: { id: projectId },
    //     data: {
    //       figmaImages: {
    //         deleteMany: {
    //           id: imageId,
    //         },
    //       },
    //     },
    //     include: {
    //       figmaImages: true,
    //       owner: true,
    //     },
    //   });

    //   return updated;
    // },

    // uploadFigmaImagesToCloudinary,
    // uploadFigmaSvgsToCloudinary,
    createUser,
    loginUser,
    setPassword,
    loginWithGoogle,
    removeUser,
    removeFigmaImage,
    removeFigmaProject,
    // extractAndSaveColors,
    // extractAndSaveFonts,
    uploadFigmaJsonProject,
    createFigmaProject,
    createDesign,
    createDesignSystem,
    updateDesignSystem,
    removeDesignSystem,
    addDesignImagesToSystem,
    updateDesignImages,
    removeDesignImage,
  },
  User: {
    projects: (parent) =>
      prisma.project.findMany({
        where: { ownerId: parent.id },
        select: { id: true, name: true },
      }),
    figmaProjects: (parent) =>
      prisma.figmaProject.findMany({
        where: { ownerId: parent.id },
        select: { id: true, name: true },
      }),
  },
  Project: {
    owner: (parent) =>
      prisma.user.findUnique({ where: { id: parent.ownerId } }),
  },
  FigmaProject: {
    owner: (parent) =>
      prisma.user.findUnique({ where: { id: parent.ownerId } }),
    figmaImages: (parent) =>
      prisma.figmaImage.findMany({ where: { figmaProjectId: parent.id } }),
  },
  Subscription: {
    userCreated: {
      subscribe: async function* () {
        const queue = [];
        const handler = (payload) => queue.push(payload);
        ee.on("USER_CREATED", handler);
        try {
          while (true) {
            if (queue.length === 0) {
              await new Promise((resolve) => setTimeout(resolve, 100));
            } else {
              yield { userCreated: queue.shift() };
            }
          }
        } finally {
          ee.off("USER_CREATED", handler);
        }
      },
    },
    userUpdated: {
      subscribe: async function* () {
        const queue = [];
        const handler = (payload) => queue.push(payload);
        ee.on("USER_UPDATED", handler);
        try {
          while (true) {
            if (queue.length === 0) {
              await new Promise((resolve) => setTimeout(resolve, 100));
            } else {
              yield { userUpdated: queue.shift() };
            }
          }
        } finally {
          ee.off("USER_UPDATED", handler);
        }
      },
    },
    userDeleted: {
      subscribe: async function* () {
        const queue = [];
        const handler = (payload) => queue.push(payload);
        ee.on("USER_DELETED", handler);
        try {
          while (true) {
            if (queue.length === 0) {
              await new Promise((resolve) => setTimeout(resolve, 100));
            } else {
              yield { userDeleted: queue.shift() };
            }
          }
        } finally {
          ee.off("USER_DELETED", handler);
        }
      },
    },
  },
};
