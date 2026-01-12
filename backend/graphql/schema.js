import { gql } from "graphql-tag";

export const typeDefs = gql`
  scalar JSON
  scalar Upload
  enum ImageType {
    VECTOR
    RASTER
    OTHER
  }
  enum ColorType {
    PALETTE
    TEXT
    BACKGROUND
    FILL
    STROKE
  }

  input ColorVariableInput {
    variableName: String!
    hex: String!
    type: ColorType!
  }
  input JsonDocumentInput {
    name: String!
    content: JSON!
  }
  input FigmaImageInput {
    fileName: String!
    filePath: String!
    imageRef: String!
    type: ImageType
  }

  type ImageUniversal {
    filename: String!
    ext: String!
    mime: String!
    base64: String!
  }
  type VectorNode {
    id: String!
    name: String!
    type: String!
  }
  type UploadedResult {
    filename: String!
    size: Int!
    images: [ImageUniversal!]!
    imagesCount: Int!
    vectorNodes: [VectorNode!]!
  }

  type TracedSVG {
    filename: String!
    svg: String!
  }

  type ProjectSummary {
    id: ID!
    name: String!
  }

  type User {
    id: ID!
    email: String!
    name: String!
    createdAt: String!
    googleId: String
    picture: String
    projects: [ProjectSummary!]!
    figmaProjects: [FigmaProject!]!
  }

  type JsonDocument {
    id: ID!
    name: String!
    content: JSON!
    createdAt: String!
  }

  type Project {
    id: ID!
    name: String!
    data: JSON!
    scssMixVar: String
    createdAt: String!
    owner: User!
  }

  type ColorVariable {
    id: ID!
    variableName: String!
    hex: String!
    rgba: String!
    type: ColorType!
  }

  type FigmaImage {
    id: ID!
    fileName: String!
    filePath: String!
    imageRef: String!
    figmaProjectId: Int
    type: ImageType
  }

  type TextNodeWithStyle {
    text: String!
    fontFamily: String!
    fontWeight: String!
    fontSize: String!
    color: String
    mixin: String!
  }

  type FigmaProject {
    id: ID!
    name: String!
    owner: User!
    previewUrl: String
    figmaImages: [FigmaImage!]
    fileCache: JSON!
    createdAt: String!
    colors: [String!]
    fonts: JSON!
    textNodes: [TextNodeWithStyle!]
  }

  type ImageUploadResponse {
    url: String!
    filename: String!
  }
  type AuthPayload {
    token: String!
    user: User!
  }

  type ProjectResponse {
    id: ID!
    name: String!
  }

  type Font {
    id: ID!
    name: String!
    scss: String!
    texts: [String!]!
    createdAt: String!
  }

  type Query {
    users: [User!]!
    findProject(id: ID!): Project
    getAllProjectsByUser(userId: ID!): [Project!]
    jsonDocumentByName(name: String!): JsonDocument
    figmaProject(id: ID!): FigmaProject
    figmaProjectsByUser(userId: ID!): [FigmaProject!]!
    getFigmaProjectData(projectId: ID!): FigmaProject!
  }

  type Mutation {
    createUser(name: String!, email: String!, password: String!): User!
    loginUser(email: String!, password: String!): AuthPayload!
    setPassword(email: String!, password: String!): User!
    loginWithGoogle(idToken: String!): AuthPayload!
    removeUser(userId: ID!): ID!
    createProject(
      ownerId: ID!
      name: String!
      data: JSON!
      scssMixVar: String
    ): Project!
    updateProject(projectId: ID!, data: JSON!): Project!
    removeProject(projectId: ID!): ID
    createFigmaProject(
      ownerId: ID!
      name: String!
      fileCache: JSON!
    ): FigmaProject!
    updateFigmaProject(
      figmaProjectId: ID!
      images: [FigmaImageInput!]
    ): FigmaProject!
    removeFigmaProject(figmaProjectId: ID!): ID
    uploadFigmaImagesToCloudinary(projectId: ID!): [FigmaImage!]!
    uploadFigmaSvgsToCloudinary(projectId: ID!): [FigmaImage!]!
    uploadDesignFile(file: Upload!): UploadedResult!
    traceImageFromFig(imageName: String!, archiveBuffer: Upload!): TracedSVG!
    removeFigmaImage(figmaImageId: ID!, figmaProjectId: ID!): FigmaImage!
    uploadFigmaJsonProject(
      ownerId: ID!
      name: String!
      jsonContent: JSON!
    ): FigmaProject!
    uploadImage(file: Upload!): ImageUploadResponse!
  }

  type Subscription {
    userCreated: User!
    userUpdated: User!
    userDeleted: ID!
    # figmaProjectCreated: FigmaProject!
  }
`;
