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

export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};
type Preview = {
  id: string;
  fileName: string;
  filePath: string;
  imageRef: string;
  type: "VECTOR" | "RASTER" | "OTHER";
  __typename: "FigmaImage";
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
  updateHtmlJson: (next: HtmlNode[]) => void;
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
  colors: string;
  setColors: React.Dispatch<React.SetStateAction<string>>;
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
  const [colors, setColors] = useState<string[]>([]);
  const [texts, setTexts] = useState<string[]>([]);
  const [undoStack, setUndoStack] = useState<HtmlNode[][]>([]);
  const [redoStack, setRedoStack] = useState<HtmlNode[][]>([]);
  const [HTML, setHTML] = useState<string>("");
  const [SCSS, setSCSS] = useState<string>("");
  const [preview, setPreview] = useState<Preview>(null);
  const [ScssMixVar, setScssMixVar] = useState<string>("");
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨э
  const { data: usersData, subscribeToMore: subscribeToUsers } = useQuery(
    GET_USERS,
    { fetchPolicy: "cache-and-network" },
  );

  const { data: jsonData } = useQuery(GET_JSON_DOCUMENT, {
    variables: { name: "initialTags" },
    fetchPolicy: "network-only",
  });
  // ------------------------
  useEffect(() => {
    if (!user) return;
    console.log("<===state user===>", user);
  }, [user]);

  // ------------------------
  // ------------------------
  // ------------------------
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

  // ==== INIT USERS + SUBS ====
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

  // ==== MODAL ====
  useEffect(() => {
    if (!modalMessage) return;
    setOpen(true);

    const t = setTimeout(() => {
      setOpen(false); // триггерит exit‑анимацию
      setModalMessage(""); // можно чуть позже, но так тоже ок
    }, 2000);

    return () => clearTimeout(t);
  }, [modalMessage]);

  // ==== INIT HTML JSON ====
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("htmlJson");
    if (stored && stored !== "[]") {
      setHtmlJson(JSON.parse(stored));
    } else if (jsonData) {
      const initialJson = jsonData?.jsonDocumentByName?.content[0];
      if (initialJson) {
        localStorage.setItem("htmlJson", JSON.stringify(initialJson));
        setHtmlJson(initialJson);
      } else {
        setHtmlJson([]);
      }
    } else {
      setHtmlJson([]);
    }
  }, [jsonData]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (
      (htmlJson === null || htmlJson === undefined || htmlJson.length === 0) &&
      jsonData
    ) {
      const initialJson = jsonData?.jsonDocumentByName?.content[0];

      if (initialJson) {
        const clone = JSON.parse(JSON.stringify(initialJson));
        localStorage.setItem("htmlJson", JSON.stringify(clone));
        updateHtmlJson(clone);
      } else {
        updateHtmlJson([]);
        localStorage.setItem("htmlJson", "[]");
      }
    } else {
      localStorage.setItem("htmlJson", JSON.stringify(htmlJson));
    }
  }, [htmlJson, jsonData]);

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
        colors,
        setColors,
        ScssMixVar,
        setScssMixVar,
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
