export type FigmaTextNode = {
  name: string;
  type: "TEXT";
  size: { w: number; h: number };
  content: string;
  styles: {
    bg?: string;
    text: {
      family: string;
      size: number;
      weight: string;
      align?: "left" | "center" | "right";
    };
  };
};

export type FigmaRectangleNode = {
  name: string;
  type: "RECTANGLE";
  size: { w: number; h: number };
  styles: {
    bg?: string;
    radius?: number;
  };
};

export type FigmaGroupNode = {
  name: string;
  type: "GROUP";
  size: { w: number; h: number };
  children: FigmaNode[];
};

export type FigmaNode = FigmaTextNode | FigmaRectangleNode | FigmaGroupNode;

export type FigmaExport = {
  metadata: any;
  designTokens: any;
  structure: FigmaGroupNode;
};
