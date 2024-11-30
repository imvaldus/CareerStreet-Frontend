"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Blog } from "@/app/schemaValidations/blog.schema";
import blogApiRequest from "@/app/apiRequest/blog";
import { 
  FaCalendarAlt, 
  FaUser, 
  FaArrowLeft, 
  FaCode, 
  FaLaptopCode, 
  FaMobileAlt, 
  FaBrain, 
  FaCloud, 
  FaShieldAlt,
  FaLink,
  FaClock,
  FaShareAlt,
  FaFacebook,
  FaTwitter,
  FaLinkedin
} from "react-icons/fa";

// Mảng các gradient và icon cho từng chủ đề
const BLOG_THEMES = [
  { 
    gradient: "from-blue-500/20 to-blue-100/20",
    bgGradient: "from-blue-500/5 via-white to-white",
    icon: FaCode,
    label: "Lập trình",
    textColor: "text-blue-600"
  },
  { 
    gradient: "from-green-500/20 to-green-100/20",
    bgGradient: "from-green-500/5 via-white to-white",
    icon: FaLaptopCode,
    label: "Web Development",
    textColor: "text-green-600"
  },
  { 
    gradient: "from-yellow-500/20 to-yellow-100/20",
    bgGradient: "from-yellow-500/5 via-white to-white",
    icon: FaMobileAlt,
    label: "Mobile Development",
    textColor: "text-yellow-600"
  },
  { 
    gradient: "from-purple-500/20 to-purple-100/20",
    bgGradient: "from-purple-500/5 via-white to-white",
    icon: FaBrain,
    label: "AI & ML",
    textColor: "text-purple-600"
  },
  { 
    gradient: "from-cyan-500/20 to-cyan-100/20",
    bgGradient: "from-cyan-500/5 via-white to-white",
    icon: FaCloud,
    label: "Cloud Computing",
    textColor: "text-cyan-600"
  },
  { 
    gradient: "from-red-500/20 to-red-100/20",
    bgGradient: "from-red-500/5 via-white to-white",
    icon: FaShieldAlt,
    label: "Cybersecurity",
    textColor: "text-red-600"
  }
];

const getBlogTheme = (blogId: number) => {
  const index = blogId % BLOG_THEMES.length;
  return BLOG_THEMES[index];
};

const estimateReadTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

export default function BlogDetailPage({ params }: { params: { id: string } }) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await blogApiRequest.getBlogById(Number(params.id));
        setBlog(response.payload.data);
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog không tồn tại</h1>
        <Link href="/blog" className="text-purple-600 hover:text-purple-800">
          Quay lại trang Blog
        </Link>
      </div>
    );
  }

  const theme = getBlogTheme(blog.blogId);
  const IconComponent = theme.icon;
  const readTime = estimateReadTime(blog.content);

  return (
    <div className={"min-h-screen bg-gradient-to-b " + theme.bgGradient}>
      {/* Header */}
      <div className={"bg-gradient-to-br " + theme.gradient}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center text-gray-600 hover:text-purple-600 group"
            >
              <FaArrowLeft className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
              Quay lại trang Blog
            </Link>
          </nav>

          <div className="text-center">
            <div className={"inline-flex items-center px-4 py-2 rounded-full text-sm " + theme.textColor + " bg-white shadow-sm mb-6"}>
              <IconComponent className="mr-2" />
              {theme.label}
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {blog.title}
            </h1>

            <div className="flex items-center justify-center text-sm text-gray-600 gap-6 mb-8">
              <div className="flex items-center">
                <FaUser className="mr-2" />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2" />
                <span>{new Date(blog.date).toLocaleDateString("vi-VN")}</span>
              </div>
              <div className="flex items-center">
                <FaClock className="mr-2" />
                <span>{readTime} phút đọc</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 sm:p-12">
            <div className="prose prose-lg max-w-none">
              {blog.content.split('\n').map((paragraph, index) => (
                <p key={index} className="text-gray-600 mb-6 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center text-sm text-gray-500">
                  <FaLink className="mr-2 text-purple-600" />
                  <span className="font-semibold mr-2">Nguồn:</span>
                  <a 
                    href={blog.origin.startsWith('http') ? blog.origin : `https://${blog.origin}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-purple-600 transition-colors"
                  >
                    {blog.origin}
                  </a>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Chia sẻ:</span>
                  <div className="flex gap-3">
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <FaFacebook size={20} />
                    </a>
                    <a 
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(blog.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-500 hover:text-sky-600 transition-colors"
                    >
                      <FaTwitter size={20} />
                    </a>
                    <a 
                      href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(blog.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:text-blue-800 transition-colors"
                    >
                      <FaLinkedin size={20} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 