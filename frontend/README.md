от храилища к редактору кода---
StateProvider.tsx --> orderIndexes --> jsonToHtml --> formatHtml --> monaco
--> document.getElementById("preview") визуализация

-->плагины фигмы для снятия данных
Figma to JSON Exporter
Bulk image

import Image from "next/image";
<Image src="/svg/cross.svg" alt="copy" width={16} height={16} />

import { useStateContext } from "@/providers/StateProvider";
const { htmlJson, setHtmlJson, setModalMessage } = useStateContext();

-->пример мутации с обьновлением кэша
const [removeFigmaImage] = useMutation(REMOVE_FIGMA_IMAGE, {
update(cache, { data }) {
const updatedProject = data?.removeFigmaImage;
if (!updatedProject) return;

      // читаем из кеша текущие данные проекта
      const existing = cache.readQuery({
        query: GET_FIGMA_PROJECT_DATA,
        variables: { projectId: String(updatedProject.id) },
      }) as any;

      if (!existing?.getFigmaProjectData) return;

      cache.writeQuery({
        query: GET_FIGMA_PROJECT_DATA,
        variables: { projectId: String(updatedProject.id) },
        data: {
          getFigmaProjectData: {
            ...existing.getFigmaProjectData,
            project: {
              ...existing.getFigmaProjectData.project,
              figmaImages: updatedProject.figmaImages,
              fileCache: updatedProject.fileCache,
            },
          },
        },
      });
    },

});

https://console.cloudinary.com/app/c-9988edc34f8836c410ad1695096399/assets/media_library/search?q=&view_mode=mosaic
