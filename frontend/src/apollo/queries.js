import { gql } from "graphql-tag";

// Получить всех пользователей с их проектами и Figma-проектами
export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      name
      createdAt
      projects {
        id
        name
      }
      figmaProjects {
        id
        name
      }
    }
  }
`;

// Получить JSON-документ по имени
export const GET_JSON_DOCUMENT = gql`
  query GetJsonDocument($name: String!) {
    jsonDocumentByName(name: $name) {
      id
      name
      content
      createdAt
    }
  }
`;

// Найти проект по ID
export const FIND_PROJECT = gql`
  query findProject($id: ID!) {
    findProject(id: $id) {
      id
      name
      data
      scssMixVar
    }
  }
`;

// Получить все проекты пользователя
export const GET_ALL_PROJECTS_BY_USER = gql`
  query GET_ALL_PROJECTS_BY_USER($userId: ID!) {
    getAllProjectsByUser(userId: $userId) {
      id
      name
      # data
    }
  }
`;

// Получить Figma-проект по ID
export const GET_FIGMA_PROJECT = gql`
  query getFigmaProject($id: ID!) {
    figmaProject(id: $id) {
      id
      name
      token
      previewUrl
      owner {
        id
        name
      }
      figmaImages {
        fileName
        filePath
        imageRef
        type
      }
    }
  }
`;

// Получить все Figma-проекты пользователя
export const GET_FIGMA_PROJECTS_BY_USER = gql`
  query GetFigmaProjectsByUser($userId: ID!) {
    figmaProjectsByUser(userId: $userId) {
      id
      name
      owner {
        id
        name
      }
    }
  }
`;

// Получить расширенные данные для Figma-проекта + файл и изображения
export const GET_FIGMA_PROJECT_DATA = gql`
  query GetFigmaProjectData($projectId: ID!) {
    getFigmaProjectData(projectId: $projectId) {
      id
      name
      fileCache
      owner {
        id
        name
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
      figmaImages {
        id
        fileName
        filePath
        imageRef
        type
      }
    }
  }
`;
