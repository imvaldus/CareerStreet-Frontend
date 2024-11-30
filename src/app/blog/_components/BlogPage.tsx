"use client";
import { useEffect, useState } from "react";
import { Blog } from "@/app/schemaValidations/blog.schema";
import blogApiRequest from "@/app/apiRequest/blog";
import BlogHeader from "./BlogHeader";
import BlogGrid from "./BlogGrid";
import Alert from "@/components/Alert";
import { FaTags, FaRss, FaBookmark, FaEnvelope, FaShieldAlt, FaBrain, FaCloud, FaMobileAlt, FaLaptopCode, FaCode } from "react-icons/fa";

// Danh sách các chủ đề
const CATEGORIES = [
  { id: "all", name: "Tất cả", icon: FaTags },
  { id: "programming", name: "Lập trình", icon: FaCode },
  { id: "web", name: "Web Development", icon: FaLaptopCode },
  { id: "mobile", name: "Mobile Development", icon: FaMobileAlt },
  { id: "ai", name: "AI & ML", icon: FaBrain },
  { id: "cloud", name: "Cloud Computing", icon: FaCloud },
  { id: "security", name: "Cybersecurity", icon: FaShieldAlt }
];

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await blogApiRequest.getBlogs();
      
      if (response.payload && Array.isArray(response.payload.data)) {
        const allBlogs = response.payload.data;
        setBlogs(allBlogs);
        setFilteredBlogs(allBlogs);
        // Lấy các bài viết có lượt xem cao nhất làm featured
        setFeaturedBlogs(allBlogs.slice(0, 5));
      } else {
        throw new Error("Dữ liệu không hợp lệ");
      }
    } catch (error) {
      console.error("Lỗi khi tải blogs:", error);
      setError("Không thể tải danh sách blog. Vui lòng thử lại sau.");
      Alert.error("Lỗi", "Không thể tải danh sách blog");
    } finally {
      setLoading(false);
    }
  };

  // Filter blogs by category
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    if (categoryId === "all") {
      setFilteredBlogs(blogs);
      return;
    }

    // Lọc blog dựa trên từ khóa trong tiêu đề hoặc nội dung
    const filtered = blogs.filter(blog => {
      const content = (blog.title + blog.content).toLowerCase();
      const category = CATEGORIES.find(cat => cat.id === categoryId);
      return content.includes(category?.name.toLowerCase() || "");
    });

    setFilteredBlogs(filtered);
  };

  // Handle newsletter subscription
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      Alert.error("Lỗi", "Vui lòng nhập email");
      return;
    }

    try {
      setSubscribing(true);
      // Giả lập API call - thay thế bằng API thật khi có
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.success("Thành công", "Đăng ký nhận tin thành công!");
      setEmail("");
    } catch (error) {
      Alert.error("Lỗi", "Không thể đăng ký. Vui lòng thử lại sau.");
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => fetchBlogs()}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BlogHeader />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Categories */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaTags className="mr-2 text-purple-600" />
              Chủ đề
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center
                    ${selectedCategory === category.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-purple-50'}`}
                >
                  <Icon className="mr-2" />
                  {category.name}
                  {selectedCategory === category.id && filteredBlogs.length > 0 && (
                    <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                      {filteredBlogs.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main blog list */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                <div className="flex items-center">
                  <FaRss className="mr-2 text-purple-600" />
                  {selectedCategory === "all" 
                    ? "Bài viết mới nhất" 
                    : `Bài viết về ${CATEGORIES.find(cat => cat.id === selectedCategory)?.name}`}
                </div>
                <span className="text-sm text-gray-500 font-normal">
                  {filteredBlogs.length} bài viết
                </span>
              </h2>
              <BlogGrid blogs={filteredBlogs} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-4 space-y-6">
              {/* Featured Posts */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <FaBookmark className="mr-2 text-purple-600" />
                  Bài viết nổi bật
                </h2>
                <div className="space-y-4">
                  {featuredBlogs.map(blog => (
                    <div key={blog.blogId} className="group">
                      <a 
                        href={`/blog/${blog.blogId}`}
                        className="block p-4 rounded-xl transition-all hover:bg-purple-50"
                      >
                        <h3 className="font-medium text-gray-800 group-hover:text-purple-600 transition-colors line-clamp-2">
                          {blog.title}
                        </h3>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span className="mr-3">{blog.author}</span>
                          <span>{new Date(blog.date).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Newsletter Subscription */}
              <form onSubmit={handleSubscribe} className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-sm p-6 text-white">
                <div className="flex items-center mb-4">
                  <FaEnvelope className="text-2xl mr-3" />
                  <div>
                    <h2 className="text-xl font-bold">Đăng ký nhận tin</h2>
                    <p className="text-sm text-purple-100">Cập nhật kiến thức mới nhất về công nghệ</p>
                  </div>
                </div>
                <input
                  type="email"
                  placeholder="Email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 placeholder-purple-100 text-white mb-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button 
                  type="submit"
                  disabled={subscribing}
                  className="w-full px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {subscribing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent mr-2"></div>
                      Đang đăng ký...
                    </>
                  ) : (
                    'Đăng ký ngay'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 