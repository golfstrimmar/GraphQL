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
import { clearImages } from "@/app/design/utils/imageStore";

const ModalMessage = dynamic(
  () => import("@/components/ModalMessage/ModalMessage"),
  { ssr: false },
);

import type { HtmlNode } from "@/types/HtmlNode";
import { designText } from "@/types/DesignSystem";

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

type TextNodeWithStyle = {
  color: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  mixin: string;
  text: string;
  __typename: "TextNodeWithStyle";
};

type ModalVariant = "success" | "error";

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
  modalVariant: ModalVariant;
  setModalVariant: React.Dispatch<React.SetStateAction<ModalVariant>>;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showModal: (
    message: string,
    variant?: ModalVariant,
    duration?: number,
  ) => void;
  updateHtmlJson: (
    next: HtmlNode[] | ((prev: HtmlNode[]) => HtmlNode[]),
  ) => void;
  undo: () => void;
  redo: () => void;
  undoStack: HtmlNode[][];
  redoStack: HtmlNode[][];
  texts: TextNodeWithStyle[];
  setTexts: React.Dispatch<React.SetStateAction<TextNodeWithStyle[]>>;
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
  designTexts: designText[];
  setDesignTexts: React.Dispatch<React.SetStateAction<designText[]>>;
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
  const [modalVariant, setModalVariant] = useState<ModalVariant>("success");
  const [open, setOpen] = useState<boolean>(false);

  const [texts, setTexts] = useState<TextNodeWithStyle[]>([]);
  const [undoStack, setUndoStack] = useState<HtmlNode[][]>([]);
  const [redoStack, setRedoStack] = useState<HtmlNode[][]>([]);
  const [HTML, setHTML] = useState<string>("");
  const [SCSS, setSCSS] = useState<string>("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [ScssMixVar, setScssMixVar] = useState<string>("");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [designTexts, setDesignTexts] = useState<designText[]>([]);

  const { data: usersData, subscribeToMore: subscribeToUsers } = useQuery(
    GET_USERS,
    { fetchPolicy: "cache-and-network" },
  );

  const { data: jsonData } = useQuery(GET_JSON_DOCUMENT, {
    variables: { name: "initialTags" },
    fetchPolicy: "network-only",
  });
  // ==>==>==>==>==>==>==>==>==>==>==>

  // ==>==>==>==>==>==>==>==>==>==>==>
  useEffect(() => {
    if (!user) {
      clearImages();
    }
  }, [user]);
  // ------------------------ INIT HTML JSON ------------------------
  const resetHtmlJson = () => {
    setUndoStack([]);
    setRedoStack([]);
    setHtmlJson([]);
  };

  // ------------------------ SYNC HTML JSON ------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("htmlJson", JSON.stringify(htmlJson));
  }, [htmlJson]);

  // ------------------------ MODAL API ------------------------
  const showModal = (
    msg: string,
    variant: ModalVariant = "success",
    duration = 2000,
  ) => {
    setModalVariant(variant);
    setModalMessage(msg);
    setOpen(true);

    window.setTimeout(() => {
      setOpen(false);
      setModalMessage("");
      setModalVariant("success");
    }, duration);
  };

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
        modalVariant,
        setModalVariant,
        isModalOpen: open,
        setIsModalOpen: setOpen,
        showModal,
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
        colors,
        setColors,
        preview,
        setPreview,
        ScssMixVar,
        setScssMixVar,
        resetHtmlJson,
        activeKey,
        setActiveKey,
        dragKey,
        setDragKey,
        designTexts,
        setDesignTexts,
      }}
    >
      <AnimatePresence initial={false} mode="wait">
        {open && <ModalMessage message={modalMessage} variant={modalVariant} />}
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
