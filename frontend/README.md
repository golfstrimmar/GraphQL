anim --- AnimatePresence
oc -- onClick
mu -- useMutation front
mucache --- useMutation с записью в кэш
qu -- useQuery
qul -- useLazyQuery – когда запрос нужен по действию пользователя или по особому условию: клик, сабмит, выбор таба, изменение фильтров и т.п.
cc
provider --useStateContext
cl
us
ue
ur -- useRef
um -- useMemo
uc -- useCallback
af
map
filter
click
emoji








--> плагины фигмы для снятия данных
Figma to JSON Exporter
Bulk image exporter

--> Image
import Image from "next/image";
<Image src="/svg/cross.svg" alt="copy" width={16} height={16} />

--> StateContext
import { useStateContext } from "@/providers/StateProvider";
const { htmlJson, setHtmlJson, setModalMessage } = useStateContext();



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

--------------------------
thismailforzzz@gmail.com

https://console.cloudinary.com/app/c-9988edc34f8836c410ad1695096399/assets/media_library/search?q=&view_mode=mosaic


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
