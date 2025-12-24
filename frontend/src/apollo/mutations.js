import { gql } from "graphql-tag";

// Создание пользователя
export const CREATE_USER = gql`
  mutation CreateUser($name: String!, $email: String!, $password: String!) {
    createUser(name: $name, email: $email, password: $password) {
      id
      name
      email
      googleId
      picture
      projects {
        id
        name
      }
    }
  }
`;

// Логин пользователя
export const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        createdAt
        googleId
        picture
        projects {
          id
          name
        }
      }
    }
  }
`;

// Установка пароля
export const SET_PASSWORD = gql`
  mutation setPasswordMutation($email: String!, $password: String!) {
    setPassword(email: $email, password: $password) {
      id
      name
      email
      createdAt
    }
  }
`;

// Логин через Google
export const LOGIN_WITH_GOOGLE = gql`
  mutation LoginWithGoogle($idToken: String!) {
    loginWithGoogle(idToken: $idToken) {
      token
      user {
        id
        name
        email
        googleId
        picture
        createdAt
        projects {
          id
          name
        }
      }
    }
  }
`;
// Удаление пользователя
export const REMOVE_USER = gql`
  mutation RemoveUser($userId: ID!) {
    removeUser(userId: $userId)
  }
`;

// Создание проекта
export const CREATE_PROJECT = gql`
  mutation CreateProject(
    $ownerId: ID!
    $name: String!
    $data: JSON!
    $scssMixVar: String
  ) {
    createProject(
      ownerId: $ownerId
      name: $name
      data: $data
      scssMixVar: $scssMixVar
    ) {
      id
      name
    }
  }
`;

// Загрузка одного изображения для проекта Ulon
export const UPLOAD_ULON_IMAGE = gql`
  mutation UploadImage($file: Upload!) {
    uploadImage(file: $file) {
      url
      filename
    }
  }
`;

// Поиск проекта
export const FIND_PROJECT = gql`
  mutation FindProject($projectId: ID!) {
    findProject(projectId: $projectId) {
      id
      name
      data
    }
  }
`;
export const UPDATE_PROJECT = gql`
  mutation UpdateProject($projectId: ID!, $data: JSON!) {
    updateProject(projectId: $projectId, data: $data) {
      id
      name
      data
    }
  }
`;

// Удаление проекта
export const REMOVE_PROJECT = gql`
  mutation RemoveProject($projectId: ID!) {
    removeProject(projectId: $projectId)
  }
`;
export const CREATE_FIGMA_PROJECT = gql`
  mutation CreateFigmaProject(
    $ownerId: ID!
    $name: String!
    $fileCache: JSON!
  ) {
    createFigmaProject(ownerId: $ownerId, name: $name, fileCache: $fileCache) {
      id
      name
      fileCache
      owner {
        id
        name
      }
    }
  }
`;
export const UPLOAD_FIGMA_JSON_PROJECT = gql`
  mutation uploadFigmaJsonProject(
    $ownerId: ID!
    $name: String!
    $jsonContent: JSON!
  ) {
    uploadFigmaJsonProject(
      ownerId: $ownerId
      name: $name
      jsonContent: $jsonContent
    ) {
      project {
        id
        name
        previewUrl
        fileCache
        figmaImages {
          fileName
        }
        owner {
          id
          name
        }
      }
      colors
      fonts
      textNodes {
        text
        fontFamily
        fontWeight
        fontSize
        color
        mixin
      }
    }
  }
`;
export const UPDATE_FIGMA_PROJECT = gql`
  mutation UpdateFigmaProject(
    $figmaProjectId: ID!
    $images: [FigmaImageInput!]
  ) {
    updateFigmaProject(figmaProjectId: $figmaProjectId, images: $images) {
      id
      name
      figmaImages {
        fileName
        filePath
      }
    }
  }
`;

// Удалить Figma-проект
export const REMOVE_FIGMA_PROJECT = gql`
  mutation removeFigmaProject($figmaProjectId: ID!) {
    removeFigmaProject(figmaProjectId: $figmaProjectId)
  }
`;

// Загрузка изображений и SVG в Cloudinary
export const UPLOAD_FIGMA_IMAGES_TO_CLOUDINARY = gql`
  mutation uploadFigmaImagesToCloudinary($projectId: ID!) {
    uploadFigmaImagesToCloudinary(projectId: $projectId) {
      filePath
    }
  }
`;

export const REMOVE_FIGMA_IMAGE = gql`
  mutation RemoveFigmaImage($figmaProjectId: ID!, $figmaImageId: ID!) {
    removeFigmaImage(
      figmaProjectId: $figmaProjectId
      figmaImageId: $figmaImageId
    ) {
      id
      figmaImages {
        fileName
        filePath
      }
      fileCache
    }
  }
`;

export const EXTRACT_AND_SAVE_COLORS = gql`
  mutation extractAndSaveColors($figmaFile: JSON!) {
    extractAndSaveColors(figmaFile: $figmaFile) {
      id
      variableName
      hex
      rgba
      type
    }
  }
`;

export const EXTRACT_AND_SAVE_FONTS = gql`
  mutation extractAndSaveFonts($figmaFile: JSON!) {
    extractAndSaveFonts(figmaFile: $figmaFile) {
      name
      scss
      texts
    }
  }
`;

export const UPLOAD_DESIGN_FILE = gql`
  mutation UploadDesignFile($file: Upload!) {
    uploadDesignFile(file: $file) {
      filename
      images {
        filename
        ext
        mime
        base64
      }
      vectorNodes {
        id
        name
        type
      }
      imagesCount
    }
  }
`;
export const TRACE_IMAGE_MUTATION = gql`
  mutation TraceImageFromFig($imageName: String!, $archiveBuffer: Upload!) {
    traceImageFromFig(imageName: $imageName, archiveBuffer: $archiveBuffer) {
      filename
      svg
    }
  }
`;
