import { gql } from "graphql-tag";

export const typeDefs = gql`
  scalar JSON
  scalar Upload
  enum ImageType {
    VECTOR
    RASTER
    OTHER
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
    createdAt: String!
    owner: User!
  }

  type ColorVariable {
    id: ID!
    variableName: String!
    hex: String!
    rgba: String!
    type: ColorType!
    fileKey: String!
  }

  type FigmaImage {
    fileName: String!
    filePath: String!
    nodeId: String!
    imageRef: String!
    figmaProjectId: Int
    type: ImageType
    fileKey: String!
  }

  type FigmaProject {
    id: ID!
    name: String!
    fileKey: String!
    nodeId: String!
    owner: User!
    previewUrl: String
    figmaImages: [FigmaImage!]!
    fileCache: JSON
  }
  type TextNodeWithStyle {
    text: String!
    fontFamily: String!
    fontWeight: String!
    fontSize: String!
    color: String
    mixin: String!
  }

  type FigmaProjectData {
    id: ID!
    name: String!
    fileKey: String!
    nodeId: String!
    fileCache: JSON!
    owner: User!
    colors: [String!]!
    fonts: [String!]!
    textNodes: [TextNodeWithStyle!]!
  }

  type FigmaProjectExtended {
    project: FigmaProject!
    colors: [String!]!
    fonts: JSON
    textNodes: [TextNodeWithStyle!]!
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
    fileKey: String!
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
    getFigmaProjectData(projectId: ID!): FigmaProjectExtended!
    getColorVariablesByFileKey(fileKey: String!): [ColorVariable!]!
    getFontsByFileKey(fileKey: String!): [Font!]
  }

  type Mutation {
    createUser(name: String!, email: String!, password: String!): User!
    loginUser(email: String!, password: String!): AuthPayload!
    setPassword(email: String!, password: String!): User!
    loginWithGoogle(idToken: String!): AuthPayload!
    removeUser(userId: ID!): ID!
    createProject(ownerId: ID!, name: String!, data: JSON!): Project!
    updateProject(projectId: ID!, data: JSON!): Project!
    removeProject(projectId: ID!): ID
    createFigmaProject(
      ownerId: ID!
      name: String!
      fileKey: String!
      nodeId: String!
      token: String!
      type: String!
    ): FigmaProject!
    removeFigmaProject(figmaProjectId: ID!): ID
    uploadFigmaImagesToCloudinary(projectId: ID!): [FigmaImage!]!
    uploadFigmaSvgsToCloudinary(projectId: ID!): [FigmaImage!]!
    removeFigmaImage(nodeId: String!, figmaProjectId: Int!): FigmaImage!
    transformRasterToSvg(nodeId: String!): FigmaImage!
    extractAndSaveColors(
      fileKey: String!
      figmaFile: JSON!
      nodeId: String!
    ): [ColorVariable!]!
    extractAndSaveFonts(
      fileKey: String!
      figmaFile: JSON!
      nodeId: String!
    ): [Font!]!
    uploadDesignFile(file: Upload!): UploadedResult!
    traceImageFromFig(imageName: String!, archiveBuffer: Upload!): TracedSVG!

    uploadFigmaJsonProject(
      ownerId: ID!
      name: String!
      jsonContent: JSON!
    ): FigmaProjectExtended!
    uploadImage(file: Upload!): ImageUploadResponse!
  }

  type Subscription {
    userCreated: User!
    userUpdated: User!
    userDeleted: ID!
    # figmaProjectCreated: FigmaProject!
  }
`;
