"use client";
import EditBlogForm from "../../_components/EditBlogForm";

export default function EditBlogPage({ params }: { params: { id: string } }) {
  return <EditBlogForm blogId={Number(params.id)} />;
} 