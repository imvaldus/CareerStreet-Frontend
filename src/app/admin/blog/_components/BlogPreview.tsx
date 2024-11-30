"use client";
import { Blog } from "@/app/schemaValidations/blog.schema";

export default function BlogPreview({ blog }: { blog: Blog | null }) {
  if (!blog) {
    return (
      <div className="bg-gray-100 rounded-lg p-6 h-full">
        <p className="text-gray-500 text-center">Xem trước sẽ hiển thị ở đây</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{blog.title}</h2>
        
        <div className="flex items-center text-gray-600 text-sm mb-4">
          <span className="mr-4">
            <i className="far fa-user mr-2"></i>
            {blog.author}
          </span>
          <span>
            <i className="far fa-calendar mr-2"></i>
            {new Date(blog.date).toLocaleDateString('vi-VN')}
          </span>
        </div>

        <div className="prose max-w-none">
          {blog.content.split('\n').map((paragraph, index) => (
            <p key={index} className="text-gray-600 mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            <span className="font-semibold">Nguồn:</span> {blog.origin}
          </p>
        </div>
      </div>
    </div>
  );
} 