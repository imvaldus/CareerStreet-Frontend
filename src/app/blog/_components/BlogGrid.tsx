"use client";
import Image from "next/image";
import Link from "next/link";
import { Blog } from "@/app/schemaValidations/blog.schema";
import { FaUser, FaCalendarAlt, FaArrowRight, FaCode, FaLaptopCode, FaMobileAlt, FaBrain, FaCloud, FaShieldAlt } from "react-icons/fa";

// Mảng các gradient và icon cho từng chủ đề
const BLOG_THEMES = [
  { 
    gradient: "from-blue-100 to-blue-50",
    icon: FaCode,
    label: "Lập trình"
  },
  { 
    gradient: "from-green-100 to-green-50",
    icon: FaLaptopCode,
    label: "Web Development"
  },
  { 
    gradient: "from-yellow-100 to-yellow-50",
    icon: FaMobileAlt,
    label: "Mobile Development"
  },
  { 
    gradient: "from-purple-100 to-purple-50",
    icon: FaBrain,
    label: "AI & ML"
  },
  { 
    gradient: "from-cyan-100 to-cyan-50",
    icon: FaCloud,
    label: "Cloud Computing"
  },
  { 
    gradient: "from-red-100 to-red-50",
    icon: FaShieldAlt,
    label: "Cybersecurity"
  }
];

// Hàm lấy theme dựa trên ID của blog
const getBlogTheme = (blogId: number) => {
  const index = blogId % BLOG_THEMES.length;
  return BLOG_THEMES[index];
};

export default function BlogGrid({ blogs }: { blogs: Blog[] }) {
  if (blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl text-gray-600 mb-4">Chưa có bài viết nào</h3>
        <p className="text-gray-500">Vui lòng quay lại sau.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      {blogs.map((blog) => {
        const theme = getBlogTheme(blog.blogId);
        const IconComponent = theme.icon;

        return (
          <article 
            key={blog.blogId} 
            className="flex flex-col md:flex-row gap-6 p-4 hover:bg-gray-50 rounded-lg transition-all duration-300"
          >
            <div className={`relative w-full md:w-48 h-48 overflow-hidden rounded-lg group bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
              <IconComponent className="text-5xl text-gray-600 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-10 text-white text-xs py-1 text-center">
                {theme.label}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center text-sm text-gray-500 mb-2 flex-wrap gap-4">
                <div className="flex items-center">
                  <FaUser className="mr-2 text-purple-600" />
                  <span>{blog.author}</span>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-2 text-purple-600" />
                  <span>{new Date(blog.date).toLocaleDateString("vi-VN")}</span>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-purple-700">
                <Link href={`/blog/${blog.blogId}`} className="hover:text-purple-700 transition-colors">
                  {blog.title}
                </Link>
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-2">{blog.content}</p>
              <div className="flex items-center justify-between">
                <Link
                  href={`/blog/${blog.blogId}`}
                  className="text-purple-600 hover:text-purple-800 transition-colors inline-flex items-center group"
                >
                  Xem chi tiết
                  <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                </Link>
                <span className="text-sm text-gray-500">Nguồn: {blog.origin}</span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
} 