от храилища к редактору кода---
StateProvider.tsx --> orderIndexes --> jsonToHtml --> formatHtml --> monaco
--> document.getElementById("preview") визуализация

--> плагины фигмы для снятия данных
Figma to JSON Exporter
Bulk image exporter

--> Image
import Image from "next/image";
<Image src="/svg/cross.svg" alt="copy" width={16} height={16} />

--> StateContext
import { useStateContext } from "@/providers/StateProvider";
const { htmlJson, setHtmlJson, setModalMessage } = useStateContext();

--> мутации
import { useMutation } from "@apollo/client";

import { REMOVE_FIGMA_IMAGE } from "@/apollo/mutations";

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

--> pathname
import { usePathname } from "next/navigation";
const pathname = usePathname();
const isPlaza = () => {
return pathname === "/plaza" ? true : false;
};

--> Router
import { useRouter } from "next/navigation";
const router = useRouter();
setTimeout(() => {
router.push("/login");
return;
}, 2000);

https://console.cloudinary.com/app/c-9988edc34f8836c410ad1695096399/assets/media_library/search?q=&view_mode=mosaic

import { cookies } from "next/headers";
export default async function Page() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value ?? null;
  // ...
}


const [getDogs, { loading, data }] = useLazyQuery(GET_DOGS);
onClick={() => getDogs({ variables: { breed: 'bulldog' } })}

--------вращает иконку при отработке сервера
import Update from "@/components/icons/Update";
<div className={`${loadingUpdateProject ? "animate-spin" : ""} w-4 h-4 overflow-hidden`} >
<Update />
</div>


--------------------------

InfoProject  панель информации о выбранном узле при фокусе на узле меняем мета данные

AdminPanel общая панель выежает внизу. -->  PlazaToolbar ServisButtons AdminComponent

ServisButtons ряд кнопок вверху AdminComponent
ниже
AdminComponent цветные кнопки добавления тэгов
слева 
PlazaToolbar три кнопки перехода по странице

StyleComponent --> MobileAddStyle




import Spinner from "@/components/icons/Spinner";
<Spinner />

===================================🔹 🔹 groq
https://console.groq.com/keys
