"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import blogApiRequest from "@/app/apiRequest/blog";
import Alert from "@/components/Alert";
import { Blog } from "@/app/schemaValidations/blog.schema";
import { FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import BlogPreview from "./BlogPreview";

export default function BlogDetail({ blogId }: { blogId: number }) {
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await blogApiRequest.getBlogById(blogId);
        setBlog(response.payload.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching blog:", error);
        Alert.error("Lỗi", "Không thể tải thông tin blog");
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa blog này?")) {
      try {
        await blogApiRequest.deleteBlog(blogId);
        Alert.success("Thành công", "Đã xóa blog");
        router.push("/admin/blog");
      } catch (error) {
        console.error("Error deleting blog:", error);
        Alert.error("Lỗi", "Không thể xóa blog");
      }
    }
  };

  if (loading) {
    return <div className="text-center p-4">Đang tải...</div>;
  }

  if (!blog) {
    return <div className="text-center p-4">Không tìm thấy blog</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Chi tiết Blog</h1>
        </div>
        <div className="flex space-x-4">
          <Link
            href={`/admin/blog/edit/${blogId}`}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <FaEdit className="mr-2" /> Sửa
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <FaTrash className="mr-2" /> Xóa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phần thông tin chỉnh sửa */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Thông tin Blog</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                <p className="mt-1 text-gray-900">{blog.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tác giả</label>
                <p className="mt-1 text-gray-900">{blog.author}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nguồn</label>
                <p className="mt-1 text-gray-900">{blog.origin}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ngày đăng</label>
                <p className="mt-1 text-gray-900">{new Date(blog.date).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Nội dung</h3>
            <div className="prose max-w-none bg-gray-50 p-4 rounded-lg">
              {blog.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Phần xem trước */}
        <div className="lg:sticky lg:top-4">
          <h3 className="text-lg font-semibold mb-4">Xem trước</h3>
          <BlogPreview blog={blog} />
        </div>
      </div>
    </div>
  );
} 