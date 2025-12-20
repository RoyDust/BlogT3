// Photography types
export interface PhotoImage {
  url: string; // 原图 URL
  thumbnail: string; // 缩略图 URL
  alt?: string; // 图片说明
  width?: number; // 原图宽度
  height?: number; // 原图高度
}

export interface PhotoGallery {
  id: string;
  title: string; // 标题
  coverImage: string; // 封面图 URL
  coverImageThumb: string; // 封面缩略图 URL
  date: Date; // 发布日期
  tags: string[]; // 标签数组
  images: PhotoImage[]; // 图片数组
  description?: string; // 可选描述
}
