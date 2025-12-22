"use server";

import { supabase } from "~/lib/supabase";
import { revalidatePath } from "next/cache";

/**
 * 相册 CRUD 操作
 * 使用 Supabase 客户端进行数据库操作
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
    const publishedAt =
      input.status === "PUBLISHED" ? new Date().toISOString() : null;

    // 插入相册
    const { data: gallery, error } = await supabase
      .from("PhotoGallery")
      .insert({
        title: input.title,
        slug: input.slug,
        description: input.description || null,
        coverImage: input.coverImage,
        coverImageThumb: input.coverImageThumb,
        authorId: input.authorId,
        status: input.status ?? "DRAFT",
        featured: input.featured ?? false,
        location: input.location ?? null,
        captureDate: input.captureDate?.toISOString() ?? null,
        tags: input.tags ?? [],
        imageCount: input.photos?.length ?? 0,
        publishedAt,
      })
      .select()
      .single();

    if (error) throw error;

    // 如果有照片，插入照片
    if (input.photos && input.photos.length > 0) {
      const photos = input.photos.map((photo) => ({
        galleryId: gallery.id,
        url: photo.url,
        thumbnail: photo.thumbnail,
        alt: photo.alt ?? null,
        width: photo.width ?? null,
        height: photo.height ?? null,
        order: photo.order,
        exifData: photo.exifData ?? null,
      }));

      const { error: photoError } = await supabase
        .from("PhotoImage")
        .insert(photos);
      if (photoError) throw photoError;
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
    const { data: gallery, error } = await supabase
      .from("PhotoGallery")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
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
    const { data: gallery, error } = await supabase
      .from("PhotoGallery")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw error;
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
    let query = supabase.from("PhotoGallery").select("*", { count: "exact" });

    // 应用筛选条件
    if (options.status) {
      query = query.eq("status", options.status);
    }
    if (options.authorId) {
      query = query.eq("authorId", options.authorId);
    }
    if (options.featured !== undefined) {
      query = query.eq("featured", options.featured);
    }
    if (options.tag) {
      query = query.contains("tags", [options.tag]);
    }

    // 排序
    const orderBy = options.orderBy ?? "createdAt";
    const order = options.order ?? "desc";
    query = query.order(orderBy, { ascending: order === "asc" });

    // 分页
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit ?? 10) - 1,
      );
    }

    const { data: galleries, error, count } = await query;

    if (error) throw error;

    // 为每个相册加载前几张图片
    if (galleries && galleries.length > 0) {
      const galleriesWithPhotos = await Promise.all(
        galleries.map(async (gallery) => {
          const { data: photos } = await supabase
            .from("PhotoImage")
            .select("id, url, thumbnail, alt")
            .eq("galleryId", gallery.id)
            .order("sortOrder", { ascending: true })
            .limit(4); // 只加载前4张图片用于预览

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
    const updateData: any = { ...input };

    // 如果状态改为 PUBLISHED 且之前没有发布时间，设置发布时间
    if (input.status === "PUBLISHED") {
      const { data: currentGallery } = await supabase
        .from("PhotoGallery")
        .select("publishedAt")
        .eq("id", id)
        .single();

      if (currentGallery && !currentGallery.publishedAt) {
        updateData.publishedAt = new Date().toISOString();
      }
    }

    // 更新相册
    const { data: gallery, error } = await supabase
      .from("PhotoGallery")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

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
    // 获取相册信息
    const { data: gallery } = await supabase
      .from("PhotoGallery")
      .select("slug")
      .eq("id", id)
      .single();

    if (!gallery) {
      return { success: false, error: "Gallery not found" };
    }

    // 删除相关数据（应用层保证一致性）
    await supabase.from("PhotoImage").delete().eq("galleryId", id);
    await supabase
      .from("Like")
      .delete()
      .eq("targetType", "GALLERY")
      .eq("targetId", id);

    // 删除相册
    const { error } = await supabase.from("PhotoGallery").delete().eq("id", id);
    if (error) throw error;

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
    const { data, error } = await supabase
      .from("PhotoGallery")
      .select("viewCount")
      .eq("id", galleryId)
      .single();

    if (error) throw error;

    const { error: updateError } = await supabase
      .from("PhotoGallery")
      .update({ viewCount: (data.viewCount ?? 0) + 1 })
      .eq("id", galleryId);

    if (updateError) throw updateError;
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
    const { data, error } = await supabase
      .from("PhotoImage")
      .select("*")
      .eq("galleryId", galleryId)
      .order("sortOrder", { ascending: true });

    if (error) throw error;
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
    const photoData = photos.map((photo) => ({
      galleryId,
      url: photo.url,
      thumbnail: photo.thumbnail,
      alt: photo.alt ?? null,
      width: photo.width ?? null,
      height: photo.height ?? null,
      order: photo.order,
      exifData: photo.exifData ?? null,
    }));

    const { error } = await supabase.from("PhotoImage").insert(photoData);
    if (error) throw error;

    // 更新相册的照片数量
    const { data: gallery } = await supabase
      .from("PhotoGallery")
      .select("imageCount")
      .eq("id", galleryId)
      .single();

    if (gallery) {
      await supabase
        .from("PhotoGallery")
        .update({ imageCount: gallery.imageCount + photos.length })
        .eq("id", galleryId);
    }

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
    // 获取照片信息
    const { data: photo } = await supabase
      .from("PhotoImage")
      .select("galleryId")
      .eq("id", photoId)
      .single();

    if (!photo) {
      return { success: false, error: "Photo not found" };
    }

    // 删除照片
    const { error } = await supabase
      .from("PhotoImage")
      .delete()
      .eq("id", photoId);
    if (error) throw error;

    // 更新相册的照片数量
    const { data: gallery } = await supabase
      .from("PhotoGallery")
      .select("imageCount")
      .eq("id", photo.galleryId)
      .single();

    if (gallery && gallery.imageCount > 0) {
      await supabase
        .from("PhotoGallery")
        .update({ imageCount: gallery.imageCount - 1 })
        .eq("id", photo.galleryId);
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
    const { error } = await supabase
      .from("PhotoImage")
      .update({ sortOrder: newOrder })
      .eq("id", photoId);

    if (error) throw error;

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
    for (const update of updates) {
      await supabase
        .from("PhotoImage")
        .update({ sortOrder: update.order })
        .eq("id", update.id);
    }

    revalidatePath("/photography");
    return { success: true };
  } catch (error) {
    console.error("Error updating photos order:", error);
    return { success: false, error: "Failed to update photos order" };
  }
}
