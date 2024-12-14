"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import blogApiRequest from "@/app/apiRequest/blog";
import Alert from "@/components/Alert";
import { Blog } from "@/app/schemaValidations/blog.schema";
import BlogPreview from "./BlogPreview";
import { BLOG_THEMES, detectTheme } from "@/app/admin/_components/HomeBlog";

export default function EditBlogForm({ blogId }: { blogId: number }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    date: new Date().toISOString().split('T')[0],
    origin: "",
    admin_id: 1,
    category: ""
  });

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const blogData = await blogApiRequest.getBlogById(blogId);
        const data = blogData.payload.data;
        const detectedTheme = detectTheme(data.content, data.title);
        
        setFormData({
          ...data,
          category: detectedTheme
        });
      } catch (error) {
        console.error("Error fetching blog data:", error);
        Alert.error("Lỗi!", "Không thể tải thông tin blog.");
      }
    };
    fetchBlogData();
  }, [blogId]);

  // Tự động cập nhật theme khi nội dung hoặc tiêu đề thay đổi
  useEffect(() => {
    const newTheme = detectTheme(formData.content, formData.title);
    if (newTheme !== formData.category) {
      setFormData(prev => ({
        ...prev,
        category: newTheme
      }));
    }
  }, [formData.content, formData.title]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await blogApiRequest.updateBlog(blogId, formData);
      Alert.success("Thành công", "Blog đã được cập nhật");
      router.push("/admin/blog");
      router.refresh();
    } catch (error) {
      console.error("Error updating blog:", error);
      Alert.error("Lỗi", "Không thể cập nhật blog");
    }
  };

  // Create a preview blog object
  const previewBlog: Blog = {
    blogId,
    ...formData
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Chỉnh sửa Blog</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form chỉnh sửa */}
        <div>
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tác giả</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nguồn</label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full p-2 border rounded h-64 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Cập nhật
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-4">
          <h2 className="text-lg font-semibold mb-4">Xem trước</h2>
          <BlogPreview blog={previewBlog} />
        </div>
      </div>
    </div>
  );
} 