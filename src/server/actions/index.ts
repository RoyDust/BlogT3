/**
 * Server Actions Index
 * 统一导出所有数据库操作函数
 */

// Posts
export {
  createPost,
  getPostById,
  getPostBySlug,
  getPosts,
  updatePost,
  deletePost,
  incrementPostView,
  getPostTags,
  getPostComments,
  type Post,
  type CreatePostInput,
  type UpdatePostInput,
  type GetPostsOptions,
} from './posts';

// Galleries
export {
  createGallery,
  getGalleryById,
  getGalleryBySlug,
  getGalleries,
  updateGallery,
  deleteGallery,
  incrementGalleryView,
  getGalleryPhotos,
  addPhotosToGallery,
  deletePhoto,
  updatePhotoOrder,
  updatePhotosOrder,
  type PhotoGallery,
  type Photo,
  type CreateGalleryInput,
  type CreatePhotoInput,
  type UpdateGalleryInput,
  type GetGalleriesOptions,
} from './galleries';

// Likes
export {
  createLike,
  deleteLike,
  toggleLike,
  checkUserLiked,
  getLikes,
  getUserLikes,
  type LikeTargetType,
  type CreateLikeInput,
} from './likes';

// Comments
export {
  createComment,
  getCommentById,
  getComments,
  getCommentReplies,
  getPostCommentsTree,
  updateComment,
  deleteComment,
  approveComment,
  rejectComment,
  markAsSpam,
  getPendingCommentsCount,
  type Comment,
  type CreateCommentInput,
  type UpdateCommentInput,
  type GetCommentsOptions,
} from './comments';
