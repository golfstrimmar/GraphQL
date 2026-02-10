export type Text = {
  tagName: string;
  className: string;
  style: string;
};

export type DesignSystem = {
  id: string;
  name: string;
  designTexts: Text[];
  images: DesignImage[];
  createdAt: string;
};
export type DesignImage = {
  id: string; // ID из GraphQL (можешь сделать number, если везде приводишь)
  publicId: string; // Cloudinary public_id
  url: string; // secure_url
  alt?: string | null; // опционально
  createdAt: string; // ISO-строка
};
