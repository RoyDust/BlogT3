"use server";

import { db } from "~/server/db";
import { Prisma } from "../../../generated/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth-guard";

/**
 * 相册 CRUD 操作
 * 使用 Prisma 客户端进行数据库操作
 */

// 定义类型
export interface PhotoGallery {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string;
  coverImageThumb: string;
  authorId: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  viewCount: number;
  likeCount: number;
  imageCount: number;
  location: string | null;
  captureDate: Date | null;
  tags: string[];
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Photo {
  id: string;
  galleryId: string;
  url: string;
  thumbnail: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  order: number;
  exifData: Record<string, any> | null;
  createdAt: Date;
}

export interface CreateGalleryInput {
  title: string;
  slug: string;
  description?: string;
  coverImage: string;
  coverImageThumb: string;
  authorId: string;
  status?: "DRAFT" | "PUBLISHED";
  featured?: boolean;
  location?: string;
  captureDate?: Date;
  tags?: string[];
  photos?: CreatePhotoInput[];
}

export interface CreatePhotoInput {
  url: string;
  thumbnail: string;
  alt?: string;
  width?: number;
  height?: number;
  order: number;
  exifData?: Record<string, any>;
}

export interface UpdateGalleryInput {
  title?: string;
  slug?: string;
  description?: string;
  coverImage?: string;
  coverImageThumb?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured?: boolean;
  location?: string;
  captureDate?: Date;
  tags?: string[];
}

export interface GetGalleriesOptions {
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  authorId?: string;
  featured?: boolean;
  tag?: string;
  query?: string; // 搜索关键词（标题、描述）
  limit?: number;
  offset?: number;
  orderBy?:
    | "createdAt"
    | "publishedAt"
    | "viewCount"
    | "likeCount"
    | "captureDate";
  order?: "asc" | "desc";
}

/**
 * 创建相册
 */
export async function createGallery(input: CreateGalleryInput) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authenticated) {
      return { success: false, error: authResult.error };
    }

    const publishedAt =
      input.status === "PUBLISHED" ? new Date() : null;

    // 插入相册
    const gallery = await db.photoGallery.create({
      data: {
        title: input.title,
        slug: input.slug,
        description: input.description ?? null,
        coverImage: input.coverImage,
        coverImageThumb: input.coverImageThumb,
        authorId: input.authorId,
        status: input.status ?? "DRAFT",
        featured: input.featured ?? false,
        location: input.location ?? null,
        captureDate: input.captureDate ?? null,
        imageCount: input.photos?.length ?? 0,
        publishedAt,
        updatedAt: new Date(),
      },
    });

    // 如果有照片，插入照片
    if (input.photos && input.photos.length > 0) {
      await db.photoImage.createMany({
        data: input.photos.map((photo) => ({
          galleryId: gallery.id,
          url: photo.url,
          thumbnail: photo.thumbnail,
          alt: photo.alt ?? null,
          width: photo.width ?? null,
          height: photo.height ?? null,
          sortOrder: photo.order,
          exifData: photo.exifData ?? Prisma.JsonNull,
        })),
      });
    }

    revalidatePath("/photography");
    return { success: true, data: gallery };
  } catch (error) {
    console.error("Error creating gallery:", error);
    return { success: false, error: "Failed to create gallery" };
  }
}

/**
 * 获取单个相册（通过 ID）
 */
export async function getGalleryById(id: string) {
  try {
    const gallery = await db.photoGallery.findUnique({
      where: { id },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found" };
    }

    return { success: true, data: gallery };
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return { success: false, error: "Failed to fetch gallery" };
  }
}

/**
 * 获取单个相册（通过 slug）
 */
export async function getGalleryBySlug(slug: string) {
  try {
    const gallery = await db.photoGallery.findUnique({
      where: { slug },
      include: {
        GalleryTag: {
          include: {
            Tag: true,
          },
        },
      },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found" };
    }

    return { success: true, data: gallery };
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return { success: false, error: "Failed to fetch gallery" };
  }
}

/**
 * 获取相册列表
 */
export async function getGalleries(options: GetGalleriesOptions = {}) {
  try {
    // 构建 where 条件
    const where: any = {};

    if (options.status) {
      where.status = options.status;
    }
    if (options.authorId) {
      where.authorId = options.authorId;
    }
    if (options.featured !== undefined) {
      where.featured = options.featured;
    }
    if (options.tag) {
      where.GalleryTag = {
        some: {
          Tag: {
            slug: options.tag,
          },
        },
      };
    }

    // 搜索关键词（标题、描述）
    if (options.query) {
      where.OR = [
        { title: { contains: options.query, mode: "insensitive" } },
        { description: { contains: options.query, mode: "insensitive" } },
      ];
    }

    // 排序
    const orderBy = options.orderBy ?? "createdAt";
    const order = options.order ?? "desc";

    // 执行查询
    const [galleries, count] = await Promise.all([
      db.photoGallery.findMany({
        where,
        orderBy: { [orderBy]: order },
        skip: options.offset,
        take: options.limit,
      }),
      db.photoGallery.count({ where }),
    ]);

    // 为每个相册加载前几张图片
    if (galleries && galleries.length > 0) {
      const galleriesWithPhotos = await Promise.all(
        galleries.map(async (gallery) => {
          const photos = await db.photoImage.findMany({
            where: { galleryId: gallery.id },
            select: { id: true, url: true, thumbnail: true, alt: true },
            orderBy: { sortOrder: "asc" },
            take: 4, // 只加载前4张图片用于预览
          });

          return {
            ...gallery,
            photos: photos ?? [],
          };
        }),
      );

      return { success: true, data: galleriesWithPhotos, count };
    }

    return { success: true, data: galleries, count };
  } catch (error) {
    console.error("Error fetching galleries:", error);
    return { success: false, error: "Failed to fetch galleries" };
  }
}

/**
 * 更新相册
 */
export async function updateGallery(id: string, input: UpdateGalleryInput) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authenticated) {
      return { success: false, error: authResult.error };
    }

    const updateData: any = {
      ...input,
      updatedAt: new Date(),
    };

    // 如果状态改为 PUBLISHED 且之前没有发布时间，设置发布时间
    if (input.status === "PUBLISHED") {
      const currentGallery = await db.photoGallery.findUnique({
        where: { id },
        select: { publishedAt: true },
      });

      if (currentGallery && !currentGallery.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    // 更新相册
    const gallery = await db.photoGallery.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/photography");
    revalidatePath(`/photography/${gallery.slug}`);
    return { success: true, data: gallery };
  } catch (error) {
    console.error("Error updating gallery:", error);
    return { success: false, error: "Failed to update gallery" };
  }
}

/**
 * 删除相册
 */
export async function deleteGallery(id: string) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authenticated) {
      return { success: false, error: authResult.error };
    }

    const gallery = await db.photoGallery.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found" };
    }

    // 删除相册（级联删除会自动删除相关的 PhotoImage 和 GalleryTag）
    // 但需要手动删除 Like 记录
    await db.like.deleteMany({
      where: {
        targetType: "GALLERY",
        targetId: id,
      },
    });

    await db.photoGallery.delete({
      where: { id },
    });

    revalidatePath("/photography");
    return { success: true };
  } catch (error) {
    console.error("Error deleting gallery:", error);
    return { success: false, error: "Failed to delete gallery" };
  }
}

/**
 * 增加相册浏览量
 */
export async function incrementGalleryView(galleryId: string) {
  try {
    await db.photoGallery.update({
      where: { id: galleryId },
      data: {
        viewCount: {
          increment: 1,
        },
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error incrementing view:", error);
    return { success: false, error: "Failed to increment view" };
  }
}

/**
 * 获取相册的照片列表
 */
export async function getGalleryPhotos(galleryId: string) {
  try {
    const data = await db.photoImage.findMany({
      where: { galleryId },
      orderBy: { sortOrder: "asc" },
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching photos:", error);
    return { success: false, error: "Failed to fetch photos" };
  }
}

/**
 * 添加照片到相册
 */
export async function addPhotosToGallery(
  galleryId: string,
  photos: CreatePhotoInput[],
) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authenticated) {
      return { success: false, error: authResult.error };
    }

    await db.photoImage.createMany({
      data: photos.map((photo) => ({
        galleryId,
        url: photo.url,
        thumbnail: photo.thumbnail,
        alt: photo.alt ?? null,
        width: photo.width ?? null,
        height: photo.height ?? null,
        sortOrder: photo.order,
        exifData: photo.exifData ?? Prisma.JsonNull,
      })),
    });

    // 更新相册的照片数量
    await db.photoGallery.update({
      where: { id: galleryId },
      data: {
        imageCount: {
          increment: photos.length,
        },
        updatedAt: new Date(),
      },
    });

    revalidatePath("/photography");
    return { success: true };
  } catch (error) {
    console.error("Error adding photos:", error);
    return { success: false, error: "Failed to add photos" };
  }
}

/**
 * 删除照片
 */
export async function deletePhoto(photoId: string) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authenticated) {
      return { success: false, error: authResult.error };
    }

    const photo = await db.photoImage.findUnique({
      where: { id: photoId },
      select: { galleryId: true },
    });

    if (!photo) {
      return { success: false, error: "Photo not found" };
    }

    // 删除照片
    await db.photoImage.delete({
      where: { id: photoId },
    });

    // 更新相册的照片数量
    const gallery = await db.photoGallery.findUnique({
      where: { id: photo.galleryId },
      select: { imageCount: true },
    });

    if (gallery && gallery.imageCount > 0) {
      await db.photoGallery.update({
        where: { id: photo.galleryId },
        data: {
          imageCount: {
            decrement: 1,
          },
          updatedAt: new Date(),
        },
      });
    }

    revalidatePath("/photography");
    return { success: true };
  } catch (error) {
    console.error("Error deleting photo:", error);
    return { success: false, error: "Failed to delete photo" };
  }
}

/**
 * 更新照片顺序
 */
export async function updatePhotoOrder(photoId: string, newOrder: number) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authenticated) {
      return { success: false, error: authResult.error };
    }

    await db.photoImage.update({
      where: { id: photoId },
      data: { sortOrder: newOrder },
    });

    revalidatePath("/photography");
    return { success: true };
  } catch (error) {
    console.error("Error updating photo order:", error);
    return { success: false, error: "Failed to update photo order" };
  }
}

/**
 * 批量更新照片顺序
 */
export async function updatePhotosOrder(
  updates: { id: string; order: number }[],
) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authenticated) {
      return { success: false, error: authResult.error };
    }

    await Promise.all(
      updates.map((update) =>
        db.photoImage.update({
          where: { id: update.id },
          data: { sortOrder: update.order },
        }),
      ),
    );

    revalidatePath("/photography");
    return { success: true };
  } catch (error) {
    console.error("Error updating photos order:", error);
    return { success: false, error: "Failed to update photos order" };
  }
}

/**
 * 更新照片的 alt 文本
 */
export async function updatePhotoAlt(photoId: string, alt: string) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authenticated) {
      return { success: false, error: authResult.error };
    }

    await db.photoImage.update({
      where: { id: photoId },
      data: { alt },
    });

    revalidatePath("/photography");
    return { success: true };
  } catch (error) {
    console.error("Error updating photo alt:", error);
    return { success: false, error: "Failed to update photo alt" };
  }
}
