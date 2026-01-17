"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

const feedbackSchema = z.object({
  type: z.enum(["BUG_REPORT", "SUGGESTION", "OTHER"]),
  content: z.string().min(10, "反馈内容至少需要 10 个字符").max(500, "反馈内容不能超过 500 个字符"),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackDialogProps {
  targetType: string;
  targetId: string;
  userId: string;
}

export function FeedbackDialog({ targetType, targetId, userId }: FeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: "SUGGESTION",
      content: "",
    },
  });

  const submitFeedback = api.feedback.submitFeedback.useMutation({
    onSuccess: () => {
      form.reset();
      setOpen(false);
      alert("感谢您的反馈！");
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    try {
      await submitFeedback.mutateAsync({
        ...data,
        targetType,
        targetId,
        userId,
        userAgent: navigator.userAgent,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-2 text-75 hover:text-90 transition-colors"
          aria-label="反馈"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>提交反馈</DialogTitle>
          <DialogDescription>
            您的反馈将帮助我们改进内容质量
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>反馈类型</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择反馈类型" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BUG_REPORT">问题报告</SelectItem>
                      <SelectItem value="SUGGESTION">建议</SelectItem>
                      <SelectItem value="OTHER">其他</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>反馈内容</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="请输入您的反馈内容（10-500 字符）"
                      className="resize-none"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "提交中..." : "提交"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

