"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useQuery } from "@apollo/client";
import { GET_USERS, GET_JSON_DOCUMENT } from "@/apollo/queries";
import {
  USER_CREATED,
  USER_UPDATED,
  USER_DELETED,
} from "@/apollo/subscriptions";

const ModalMessage = dynamic(
  () => import("@/components/ModalMessage/ModalMessage"),
  { ssr: false },
);

type HtmlNode = {
  tag: string;
  class?: string;
  children?: HtmlNode[];
  text?: string;
  style?: string;
  attributes?: Record<string, string>;
};

type nodeToAdd = { type: number };
type BackgroundState = {
  background1: string;
  background2: string;
  background3: string;
  background4: string;
  background5: string;
};
type ColorState = {
  headers1color: string;
  headers2color: string;
  headers3color: string;
  headers4color: string;
  headers5color: string;
  headers6color: string;
  color7: string;
  color8: string;
  color9: string;
  color10: string;
};
export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};
type FontSlot = {
  id: string; // "headersfont", "font2" — используется в UI
  label: string; // подпись в UI
  family: string; // имя шрифта (Inter, Roboto) — это и есть value для базы
  importString: string; // строка @import, только для фронта
};
type FontSizeState = {
  fontSizeHeader1: string;
  fontSizeHeader2: string;
  fontSizeHeader3: string;
  fontSizeHeader4: string;
  fontSizeHeader5: string;
  fontSizeHeader6: string;
};

type Preview = {
  id: string;
  fileName: string;
  filePath: string;
  imageRef: string;
  type: "VECTOR" | "RASTER" | "OTHER";
  __typename: "FigmaImage";
};
type TextNodeWithStyle = {
  color: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  mixin: string;
  text: string;
  __typename: "TextNodeWithStyle";
};
interface StateContextType {
  htmlJson: HtmlNode[];
  setHtmlJson: React.Dispatch<React.SetStateAction<HtmlNode[]>>;
  nodeToAdd: nodeToAdd | null;
  setNodeToAdd: React.Dispatch<React.SetStateAction<nodeToAdd | null>>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  users: User[] | null;
  setUsers: React.Dispatch<React.SetStateAction<User[] | null>>;
  modalMessage: string;
  setModalMessage: React.Dispatch<React.SetStateAction<string>>;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showModal: (message: string, duration?: number) => void;
  updateHtmlJson: (
    next: HtmlNode[] | ((prev: HtmlNode[]) => HtmlNode[]),
  ) => void;
  undo: () => void;
  redo: () => void;
  undoStack: HtmlNode[][];
  redoStack: HtmlNode[][];
  texts: string[];
  setTexts: React.Dispatch<React.SetStateAction<string[]>>;
  HTML: string;
  setHTML: React.Dispatch<React.SetStateAction<string>>;
  SCSS: string;
  setSCSS: React.Dispatch<React.SetStateAction<string>>;
  colors: string[];
  setColors: React.Dispatch<React.SetStateAction<string[]>>;
  preview: Preview | null;
  setPreview: React.Dispatch<React.SetStateAction<Preview | null>>;
  ScssMixVar: string;
  setScssMixVar: React.Dispatch<React.SetStateAction<string>>;
  resetHtmlJson: () => void;
  activeKey: string | null;
  setActiveKey: React.Dispatch<React.SetStateAction<string | null>>;
  dragKey: string | null;
  setDragKey: React.Dispatch<React.SetStateAction<string | null>>;
}

const StateContext = createContext<StateContextType | null>(null);

export function StateProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [users, setUsers] = useState<User[] | null>(null);
  const [htmlJson, setHtmlJson] = useState<HtmlNode[]>([]);
  const [nodeToAdd, setNodeToAdd] = useState<nodeToAdd | null>(null);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  // const [colors, setColors] = useState<string[]>([]);
  const [texts, setTexts] = useState<TextNodeWithStyle[]>([]);
  const [undoStack, setUndoStack] = useState<HtmlNode[][]>([]);
  const [redoStack, setRedoStack] = useState<HtmlNode[][]>([]);
  const [HTML, setHTML] = useState<string>("");
  const [SCSS, setSCSS] = useState<string>("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [ScssMixVar, setScssMixVar] = useState<string>("");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);

  const { data: usersData, subscribeToMore: subscribeToUsers } = useQuery(
    GET_USERS,
    { fetchPolicy: "cache-and-network" },
  );

  const { data: jsonData } = useQuery(GET_JSON_DOCUMENT, {
    variables: { name: "initialTags" },
    fetchPolicy: "network-only",
  });
  // ------------------------
  const DEFAULT_BACKGROUNDS: BackgroundState = {
    background1: "",
    background2: "",
    background3: "",
    background4: "",
    background5: "",
  };
  const DEFAULT_COLORS: ColorState = {
    headers1color: "",
    headers2color: "",
    headers3color: "",
    headers4color: "",
    headers5color: "",
    headers6color: "",
    color7: "",
    color8: "",
    color9: "",
    color10: "",
  };
  const DEFAULT_FONTS: FontSlot[] = [
    { id: "headers1font", label: "headers1font", family: "", importString: "" },
    { id: "headers2font", label: "headers2font", family: "", importString: "" },
    { id: "headers3font", label: "headers3font", family: "", importString: "" },
    { id: "headers4font", label: "headers4font", family: "", importString: "" },
    { id: "headers5font", label: "headers5font", family: "", importString: "" },
    { id: "headers6font", label: "headers6font", family: "", importString: "" },
  ];
  const DEFAULT_FONT_SIZES: FontSizeState = {
    fontSizeHeader1: "",
    fontSizeHeader2: "",
    fontSizeHeader3: "",
    fontSizeHeader4: "",
    fontSizeHeader5: "",
    fontSizeHeader6: "",
  };

  const [backgrounds, setBackgrounds] =
    useState<BackgroundState>(DEFAULT_BACKGROUNDS);
  const [colors, setColors] = useState<ColorState>(DEFAULT_COLORS);
  const [fonts, setFonts] = useState<FontSlot[]>(DEFAULT_FONTS);
  const [fontSizes, setFontSizes] = useState<FontSizeState>(DEFAULT_FONT_SIZES);
  // ------------------------ INIT HTML JSON ------------------------
  const resetHtmlJson = () => {
    setUndoStack([]);
    setRedoStack([]);
    setHtmlJson([]);
  };

  // ------------------------ SYNC HTML JSON ------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    console.log("<= 🟢 ==htmlJson=  🟢==>", htmlJson);
    localStorage.setItem("htmlJson", JSON.stringify(htmlJson));
  }, [htmlJson]);

  // ------------------------ MODAL ------------------------
  useEffect(() => {
    if (!modalMessage) return;
    setOpen(true);

    const t = setTimeout(() => {
      setOpen(false);
      setModalMessage("");
    }, 2000);

    return () => clearTimeout(t);
  }, [modalMessage]);

  // ------------------------ USERS SUBSCRIPTIONS ------------------------
  useEffect(() => {
    if (usersData?.users) setUsers(usersData.users);

    const unsubCreate = subscribeToUsers({
      document: USER_CREATED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newUser = subscriptionData.data.userCreated;
        setUsers((prevUsers) =>
          prevUsers ? [...prevUsers, newUser] : [newUser],
        );
        return { users: [...prev.users, newUser] };
      },
    });

    const unsubUpdate = subscribeToUsers({
      document: USER_UPDATED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const updatedUser = subscriptionData.data.userUpdated;
        setUsers((prevUsers) =>
          prevUsers
            ? prevUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u))
            : null,
        );
        return {
          users: prev.users.map((u) =>
            u.id === updatedUser.id ? updatedUser : u,
          ),
        };
      },
    });

    const unsubDelete = subscribeToUsers({
      document: USER_DELETED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const deletedUserId = subscriptionData.data.userDeleted;
        setUsers((prevUsers) =>
          prevUsers ? prevUsers.filter((u) => u.id !== deletedUserId) : null,
        );
        return {
          users: prev.users
            ? prev.users.filter((u) => u.id !== deletedUserId)
            : [],
        };
      },
    });

    return () => {
      unsubCreate();
      unsubUpdate();
      unsubDelete();
    };
  }, [usersData, subscribeToUsers]);

  // ------------------------ UNDO/REDO ------------------------
  const updateHtmlJson = (
    nextHtmlJson: HtmlNode[] | ((prev: HtmlNode[]) => HtmlNode[]),
  ) => {
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(htmlJson))]);
    setRedoStack([]);
    if (typeof nextHtmlJson === "function") {
      setHtmlJson((prev) => nextHtmlJson(JSON.parse(JSON.stringify(prev))));
    } else {
      setHtmlJson(JSON.parse(JSON.stringify(nextHtmlJson)));
    }
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((stack) => stack.slice(0, -1));
    setRedoStack((stack) => [...stack, JSON.parse(JSON.stringify(htmlJson))]);
    setHtmlJson(prev);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((stack) => stack.slice(0, -1));
    setUndoStack((stack) => [...stack, JSON.parse(JSON.stringify(htmlJson))]);
    setHtmlJson(next);
  };
  // --------------------

  return (
    <StateContext.Provider
      value={{
        htmlJson,
        setHtmlJson,
        nodeToAdd,
        setNodeToAdd,
        user,
        setUser,
        users,
        setUsers,
        modalMessage,
        setModalMessage,
        updateHtmlJson,
        undo,
        redo,
        undoStack,
        redoStack,
        texts,
        setTexts,
        HTML,
        setHTML,
        SCSS,
        setSCSS,
        preview,
        setPreview,
        // colors,
        // setColors,
        ScssMixVar,
        setScssMixVar,
        isModalOpen: open,
        setIsModalOpen: setOpen,
        resetHtmlJson,
        activeKey,
        setActiveKey,
        dragKey,
        setDragKey,
        backgrounds,
        setBackgrounds,
        colors,
        setColors,
        fonts,
        setFonts,
        fontSizes,
        setFontSizes,
        showModal: (msg, duration = 2000) => setModalMessage(msg),
      }}
    >
      <AnimatePresence initial={false} mode="wait">
        {open && <ModalMessage message={modalMessage} />}
      </AnimatePresence>

      {children}
    </StateContext.Provider>
  );
}

export function useStateContext() {
  const context = useContext(StateContext);
  if (!context)
    throw new Error("useStateContext must be used within a StateProvider");
  return context;
}
