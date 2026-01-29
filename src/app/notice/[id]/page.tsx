import NoticeDetailPage from "@/views/notice/ui/DetailPage";

export default async function NoticeDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <NoticeDetailPage id={id} />;
}
