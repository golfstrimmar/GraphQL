export type DesignSystem = {
  id: number;
  name: string;
  designTexts: designText[];
};
export type designText = {
  tag: string;
  class: string;
  style: string;
};
