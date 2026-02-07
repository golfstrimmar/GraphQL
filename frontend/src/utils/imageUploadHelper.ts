// import { ApolloError, useMutation } from "@apollo/client";
export interface ProjectNode {
  _key?: string;
  tag: string;
  text?: string;
  class?: string;
  style?: string;
  children?: (ProjectNode | string)[];
  attributes?: {
    [key: string]: any;
  };
}

export interface ImageFile {
  file: File;
  previewUrl: string;
}

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const findAndUploadImages = async (
  project: ProjectNode,
  imageFiles: ImageFile[],
  uploadImageMutation: any,
  setModalMessage: (message: string) => void,
): Promise<ProjectNode> => {
  // console.log("<====project====>", project);
  console.log("<====imageFiles====>", imageFiles);
  // console.log("<====uploadImageMutation) ====>", uploadImageMutation);

  let projectToSave = deepClone(project);

  const blobUrls = new Set<string>();
  const findBlobs = (node: ProjectNode | string) => {
    if (typeof node === "string") return;
    if (node.tag === "img" && node.attributes?.src?.startsWith("blob:")) {
      blobUrls.add(node.attributes.src);
    }
    if (Array.isArray(node.children)) {
      node.children.forEach(findBlobs);
    }
  };
  findBlobs(projectToSave);

  if (blobUrls.size > 0) {
    setModalMessage(`Uploading ${blobUrls.size} images...`);
    const urlMap = new Map<string, string>();

    const uploadPromises = Array.from(blobUrls).map(async (blobUrl) => {
      const imageFile = (imageFiles || []).find(
        (f) => f.previewUrl === blobUrl,
      );
      if (imageFile) {
        try {
          const { data } = await uploadImageMutation({
            variables: { file: imageFile.file },
          });
          if (data.uploadImage.url) {
            urlMap.set(blobUrl, data.uploadImage.url);
          }
        } catch (error) {
          console.error("Image upload failed:", error);
          setModalMessage(`Failed to upload ${imageFile.file.name}`);
        }
      }
    });

    await Promise.all(uploadPromises);

    const replaceUrls = (node: ProjectNode | string) => {
      if (typeof node === "string") return;
      if (node.tag === "img" && node.attributes?.src?.startsWith("blob:")) {
        if (urlMap.has(node.attributes.src)) {
          node.attributes.src = urlMap.get(node.attributes.src);
        }
      }
      if (Array.isArray(node.children)) {
        node.children.forEach(replaceUrls);
      }
    };
    replaceUrls(projectToSave);
  }

  return projectToSave;
};
