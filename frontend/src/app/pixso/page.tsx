"use client";
import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { UPLOAD_FIGMA_JSON_PROJECT } from "@/apollo/mutations";
import {
  GET_FIGMA_PROJECTS_BY_USER,
  GET_FIGMA_PROJECT_DATA,
} from "@/apollo/queries";
import Button from "@/components/ui/Button/Button";
import "../figma/figma.scss";
import Loading from "@/components/ui/Loading/Loading";
import { useStateContext } from "@/providers/StateProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";

// --------
type FigmaProject = {
  id: string;
  name: string;
  fileKey: string;
  nodeId?: string | null;
  file?: any | null;
  owner: ProjectOwner;
};

type ProjectOwner = {
  id: string;
  name: string;
};
type Project = {
  id: string;
  name: string;
};
export default function FigmaPage() {
  const router = useRouter();
  const { user, setModalMessage } = useStateContext();
  const [file, setFile] = useState<File | null>(null); // archive
  const [name, setName] = useState<string>("");
  const [colors, setColors] = useState<string[]>([]);
  const [fonts, setFonts] = useState<string[]>([]);
  const [texts, setTexts] = useState<string[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [currentProject, setcurrentProject] = useState<FigmaProject | null>(
    null
  );

  // Query
  const {
    data: figmaProjectsByUser,
    loading: allProjectsLoading,
    error: allProjectsError,
  } = useQuery(GET_FIGMA_PROJECTS_BY_USER, {
    variables: { userId: user?.id },
  });
  const {
    data: figmaProjectData,
    loading: figmaProjectLoading,
    error: figmaProjectError,
  } = useQuery(GET_FIGMA_PROJECT_DATA, {
    variables: { projectId: projectId },
  });

  //Mutation
  const [uploadFigmaJsonProject, { loading }] = useMutation(
    UPLOAD_FIGMA_JSON_PROJECT
  );
  //
  useEffect(() => {
    if (figmaProjectsByUser?.figmaProjectsByUser) {
      setAllProjects(figmaProjectsByUser.figmaProjectsByUser);
    }
  }, [figmaProjectsByUser]);
  useEffect(() => {
    if (figmaProjectData?.getFigmaProjectData) {
      console.log(
        "<==🔥🔥🔥🔥==figmaProjectData ==🔥🔥🔥==>",
        figmaProjectData.getFigmaProjectData
      );
      setcurrentProject(figmaProjectData.getFigmaProjectData.project);
      setColors(figmaProjectData.getFigmaProjectData.colors);
      setFonts(figmaProjectData.getFigmaProjectData.fonts);
      setTexts(figmaProjectData.getFigmaProjectData.textNodes);
    }
  }, [figmaProjectData]);
  //
  const handleUpload = async () => {
    if (!file) return;
    if (!user) {
      setModalMessage("You are not logged in.");
      return;
    }
    if (name.length === 0) {
      setModalMessage("Please enter a name.");
      return;
    }
    // Открываем FileReader
    const reader = new FileReader();
    reader.onload = async (e) => {
      const jsonString = e.target.result;
      const jsonContent = JSON.parse(jsonString);
      const { data } = await uploadFigmaJsonProject({
        variables: { ownerId: user.id, name, jsonContent },
      });
      setColors(data.uploadFigmaJsonProject.colors);
      setFonts(data.uploadFigmaJsonProject.fonts);
      setTexts(data.uploadFigmaJsonProject.textNodes);
      setAllProjects(() => {
        return [
          ...allProjects,
          {
            id: data.uploadFigmaJsonProject.project.id,
            name: data.uploadFigmaJsonProject.project.name,
          },
        ];
      });
    };

    // file — это instance of File
    reader.readAsText(file);
  };
  const uniqueMixins = Object.values(
    texts.reduce((acc, el) => {
      const key = `${el.mixin}`;
      if (!acc[key]) {
        acc[key] = el;
      }
      return acc;
    }, {})
  );
  return (
    <div className="figma">
      <div className="container">
        <h2 className="text-center mb-4">Figma projects</h2>
        {allProjects.length === 0 && (
          <p className="text-center text-red-500 my-4">
            No Figma projects found
          </p>
        )}
        <div className="flex flex-col gap-2">
          {allProjects &&
            allProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  setProjectId(project.id);
                }}
              >
                {project.name}
              </button>
            ))}
        </div>
        <form>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border rounded p-2 mb-2"
            placeholder="Select a file"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded p-2 mb-2"
            placeholder="Project name"
          />
          <Button disabled={!file || loading} onClick={handleUpload}>
            {loading ? "Uploading..." : "Upload file"}
          </Button>
        </form>
        {currentProject && (
          <div style={{ marginTop: 20 }}>
            <h4>Current project</h4>
            <p>{currentProject.name}</p>
          </div>
        )}
        {colors.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h4>Colors</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
              {colors.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    style={{
                      background: value,
                    }}
                    className="w-8 h-8 border rounded-full mr-4 ml-2"
                  />
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {fonts && Object.keys(fonts).length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h4>Fonts</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
              {Object.entries(fonts).map(([key, fontObj]) => (
                <div
                  key={key}
                  style={{
                    padding: 8,
                    border: "1px solid #eee",
                    borderRadius: 8,
                  }}
                >
                  <b>{fontObj.family || key}</b>
                  <div style={{ fontSize: 13, opacity: 0.6 }}>{key}</div>
                  {fontObj.sizes && (
                    <div>sizes: {Object.values(fontObj.sizes).join(", ")}</div>
                  )}
                  {fontObj.weights && (
                    <div>
                      weights: {Object.values(fontObj.weights).join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {texts.length > 0 && (
          <div className="my-4">
            <h4>Mixins</h4>
            <div className="flex flex-col gap-1">
              {uniqueMixins.map((el) => {
                const scssMixin = `@mixin ${el.mixin} {\n  font-family: "${el.fontFamily}", sans-serif;\n  font-weight: ${el.fontWeight};\n  font-size: ${el.fontSize};\n color: ${el.color};\n}`;

                return (
                  <button
                    key={el.mixin}
                    onClick={() => {
                      navigator.clipboard.writeText(scssMixin);
                      setModalMessage("Scss copied!");
                    }}
                    className="border rounded px-1 text-left whitespace-pre font-mono  text-sm py-1 pl-6 relative"
                  >
                    <div className="absolute top-1 left-1">
                      <Image
                        src="/svg/copy.svg"
                        alt="copy"
                        width={16}
                        height={16}
                      />
                    </div>
                    {scssMixin}
                  </button>
                );
              })}
            </div>

            {/* <div className="flex flex-col gap-1 my-2">
              {uniqueMixins.map((el) => (
                <button
                  key={el.text}
                  onClick={() => {
                    navigator.clipboard.writeText(`@include ${el.mixin};`);
                    setModalMessage("Mixin copied!");
                  }}
                  className="border rounded px-1 relative"
                >
                  <div className="absolute top-1 left-1">
                    <Image
                      src="/svg/copy.svg"
                      alt="copy"
                      width={16}
                      height={16}
                    />
                  </div>
                  @include {el.mixin}
                </button>
              ))}
            </div> */}
            <div className="my-2">
              <h4>Texts</h4>
              <div className="flex flex-col gap-2">
                {texts.map((el) => (
                  <div key={el.text}>
                    <button
                      key={el.text}
                      onClick={() => {
                        navigator.clipboard.writeText(`${el.text}`);
                        setModalMessage("Text copied!");
                      }}
                      className="border rounded px-1 relative pl-6 "
                    >
                      <div className="absolute top-1 left-1">
                        <Image
                          src="/svg/copy.svg"
                          alt="copy"
                          width={16}
                          height={16}
                        />
                      </div>
                      <div
                        style={{
                          fontFamily: el.fontFamily,
                          fontWeight: el.fontWeight,
                          fontSize: el.fontSize,
                        }}
                      >
                        {el.text}
                      </div>
                    </button>

                    <button
                      key={el.text}
                      onClick={() => {
                        navigator.clipboard.writeText(`@include ${el.mixin};`);
                        setModalMessage("Mixin copied!");
                      }}
                      className="border rounded px-1 relative  pl-6 ml-2"
                    >
                      <div className="absolute top-1 left-1 ">
                        <Image
                          src="/svg/copy.svg"
                          alt="copy"
                          width={16}
                          height={16}
                        />
                      </div>
                      @include {el.mixin};
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
