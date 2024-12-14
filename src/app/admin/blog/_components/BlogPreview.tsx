"use client";
import { Blog } from "@/app/schemaValidations/blog.schema";
import { BLOG_THEMES } from "@/app/admin/_components/HomeBlog";
import { detectTheme } from "@/app/admin/_components/HomeBlog";

export default function BlogPreview({ blog }: { blog: Blog | null }) {
  if (!blog) {
    return (
      <div className="bg-gray-100 rounded-lg p-6 h-full">
        <p className="text-gray-500 text-center">Xem trước sẽ hiển thị ở đây</p>
      </div>
    );
  }

  const theme = BLOG_THEMES.find(t => t.id === detectTheme(blog.content, blog.title)) || BLOG_THEMES[0];
  const IconComponent = theme.icon;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className={`w-full h-48 bg-gradient-to-br ${theme.gradient} flex items-center justify-center relative`}>
        <IconComponent className="text-4xl text-gray-600" />
        <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm py-2 text-center">
          <span className="text-sm text-white font-medium">{theme.label}</span>
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{blog.title}</h2>
        
        <div className="flex items-center text-gray-600 text-sm mb-4">
          <span className="mr-4">
            <IconComponent className="mr-2 inline" />
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