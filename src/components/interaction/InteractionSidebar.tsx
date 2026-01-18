"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, Share2, MessageSquare } from "lucide-react";
import { ShareDialog } from "./ShareDialog";
import { FeedbackDialog } from "./FeedbackDialog";
import { api } from "~/trpc/react";

interface InteractionSidebarProps {
  targetType: "POST" | "GALLERY";
  targetId: string;
  initialLikeCount?: number;
  initialFeedbackCount?: number;
}

export function InteractionSidebar({
  targetType,
  targetId,
  initialLikeCount = 0,
  initialFeedbackCount = 0,
}: InteractionSidebarProps) {
  const [userId, setUserId] = useState<string>("");
  const [liked, setLiked] = useState(false);

  // 生成或获取用户 ID（使用 localStorage）
  useEffect(() => {
    let id = localStorage.getItem("anonymousUserId");
    if (!id) {
      id = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("anonymousUserId", id);
    }
    setUserId(id);

    // 检查本地点赞状态
    const likeKey = `like_${targetType}_${targetId}`;
    const isLiked = localStorage.getItem(likeKey) === "true";
    setLiked(isLiked);
  }, [targetType, targetId]);

  const utils = api.useUtils();

  // 获取点赞数量
  const { data: likeData } = api.like.getLikeCount.useQuery(
    { targetType, targetId },
    { initialData: { count: initialLikeCount } }
  );

  // 获取反馈数量
  const { data: feedbackData } = api.feedback.getFeedbackCount.useQuery(
    { targetType, targetId },
    { initialData: { count: initialFeedbackCount } }
  );

  // 切换点赞
  const toggleLike = api.like.toggleLike.useMutation({
    onSuccess: (data) => {
      setLiked(data.liked);
      const likeKey = `like_${targetType}_${targetId}`;
      localStorage.setItem(likeKey, data.liked.toString());

      // 刷新点赞数量
      void utils.like.getLikeCount.invalidate({ targetType, targetId });
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleLikeClick = () => {
    if (!userId) return;
    toggleLike.mutate({ targetType, targetId, userId });
  };

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <>
      {/* 桌面端侧边栏 - 固定在页面右侧 */}
      <div className="hidden lg:block fixed right-56 top-40 z-10">
        <div className="sticky top-20 flex flex-col gap-4">
          {/* 点赞按钮 */}
          <button
            onClick={handleLikeClick}
            disabled={!userId || toggleLike.isPending}
            className="relative flex items-center justify-center p-4 rounded-full bg-background border border-border hover:border-primary transition-colors disabled:opacity-50"
            aria-label="点赞"
          >
            <ThumbsUp
              className={`h-6 w-6 ${liked ? "fill-primary text-primary" : "text-75"}`}
            />
            {(likeData?.count ?? 0) > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium text-white bg-primary rounded-full">
                {likeData?.count ?? 0}
              </span>
            )}
          </button>

          {/* 分享按钮 */}
          <div className="relative flex items-center justify-center p-4 rounded-full bg-background border border-border hover:border-primary transition-colors">
            <ShareDialog url={currentUrl} title="分享内容" />
          </div>

          {/* 反馈按钮 */}
          <div className="relative flex items-center justify-center p-4 rounded-full bg-background border border-border hover:border-primary transition-colors">
            <FeedbackDialog
              targetType={targetType}
              targetId={targetId}
              userId={userId}
            />
            {(feedbackData?.count ?? 0) > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium text-white bg-primary rounded-full">
                {feedbackData?.count ?? 0}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 移动端底部栏 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-10 bg-background border-t border-border">
        <div className="flex items-center justify-around py-3 px-4">
          {/* 点赞按钮 */}
          <button
            onClick={handleLikeClick}
            disabled={!userId || toggleLike.isPending}
            className="relative flex items-center justify-center disabled:opacity-50"
            aria-label="点赞"
          >
            <ThumbsUp
              className={`h-5 w-5 ${liked ? "fill-primary text-primary" : "text-75"}`}
            />
            {(likeData?.count ?? 0) > 0 && (
              <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-medium text-white bg-primary rounded-full">
                {likeData?.count ?? 0}
              </span>
            )}
          </button>

          {/* 分享按钮 */}
          <div className="relative flex items-center justify-center">
            <ShareDialog url={currentUrl} title="分享内容" />
          </div>

          {/* 反馈按钮 */}
          <div className="relative flex items-center justify-center">
            <FeedbackDialog
              targetType={targetType}
              targetId={targetId}
              userId={userId}
            />
            {(feedbackData?.count ?? 0) > 0 && (
              <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-medium text-white bg-primary rounded-full">
                {feedbackData?.count ?? 0}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

