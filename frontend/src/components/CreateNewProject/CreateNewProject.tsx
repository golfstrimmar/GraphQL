"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useStateContext } from "@/providers/StateProvider";
import "./createnewproject.scss";
import { useMutation } from "@apollo/client";
import { CREATE_PROJECT } from "@/apollo/mutations";
import { GET_ALL_PROJECTS_BY_USER } from "@/apollo/queries";
import Input from "@/components/ui/Input/Input";

const CreateNewProject = () => {
  const { htmlJson, user, setModalMessage } = useStateContext();
  const [newProjectName, setNewProjectName] = useState<string>("");
  const variables = useMemo(() => ({ userId: user?.id }), [user?.id]);
  const [createProject, { loading: createLoading }] = useMutation(
    CREATE_PROJECT,
    {
      refetchQueries: [{ query: GET_ALL_PROJECTS_BY_USER, variables }],
      awaitRefetchQueries: true,
    }
  );

  // useEffect(() => {
  //   if (imageFiles.length > 0) {
  //     console.log("<====imageFiles====>", imageFiles);
  //   }
  // }, [imageFiles]);
  const createNewProject = async () => {
    if (!newProjectName || !user) {
      setModalMessage(" All fields are required.");
      return;
    }
    // if (!htmlJson || !htmlJson.children || htmlJson.children.length === 0) {
    //   setModalMessage(" Data fields are required.");
    //   return;
    // }

    // // Шаг 1: Загружаем изображения и получаем обновленный htmlJson
    // const projectWithCloudinaryUrls = await findAndUploadImages(
    //   htmlJson as ProjectNode,
    //   imageFiles as ImageFile[],
    //   uploadImage,
    //   setModalMessage
    // );

    // try {
    //   await createProject({
    //     variables: {
    //       ownerId: user.id,
    //       name: newProjectName,
    //       data: projectWithCloudinaryUrls,
    //     },
    //   });

    //   setModalMessage(`Project ${newProjectName} created.`);
    //   setNewProjectName("");
    // } catch (error) {
    //   setModalMessage("Failed to create project.");
    //   console.error(error);
    // }
  };

  return (
    <div className="createnewproject">
      <hr className="bordered-2 border-slate-200 mt-2 mb-4" />
      <h5 className="text-lg font-semibold text-slate-700 mb-3">
        Create a new Ulon project
      </h5>
      <div className="grid grid-cols-[1fr_max-content] gap-2 w-full mt-4">
        <Input
          typeInput="text"
          data="Project name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
        />
        <button
          type="button"
          className=" px-5 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50"
          onClick={createNewProject}
          disabled={createLoading}
        >
          {createLoading ? "Creating..." : "Create Project"}
        </button>
      </div>
    </div>
  );
};

export default CreateNewProject;
