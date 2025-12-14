import PostEditorPage from "../../new/page";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <PostEditorPage params={params} />;
}
