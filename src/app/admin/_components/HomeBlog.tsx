"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import blogApiRequest from "@/app/apiRequest/blog";
import Alert from "@/components/Alert";
import { Blog } from "@/app/schemaValidations/blog.schema";
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaPlus, 
  FaSearch, 
  FaSortAmountDown,
  FaCalendarAlt,
  FaUser,
  FaLink,
  FaExternalLinkAlt,
  FaCode,
  FaLaptopCode,
  FaMobileAlt,
  FaBrain,
  FaCloud,
  FaShieldAlt
} from "react-icons/fa";

// Mảng các gradient và icon cho từng chủ đề
const BLOG_THEMES = [
  { 
    gradient: "from-blue-500/20 to-blue-100/20",
    icon: FaCode,
    label: "Lập trình",
    textColor: "text-blue-600"
  },
  { 
    gradient: "from-green-500/20 to-green-100/20",
    icon: FaLaptopCode,
    label: "Web Development",
    textColor: "text-green-600"
  },
  { 
    gradient: "from-yellow-500/20 to-yellow-100/20",
    icon: FaMobileAlt,
    label: "Mobile Development",
    textColor: "text-yellow-600"
  },
  { 
    gradient: "from-purple-500/20 to-purple-100/20",
    icon: FaBrain,
    label: "AI & ML",
    textColor: "text-purple-600"
  },
  { 
    gradient: "from-cyan-500/20 to-cyan-100/20",
    icon: FaCloud,
    label: "Cloud Computing",
    textColor: "text-cyan-600"
  },
  { 
    gradient: "from-red-500/20 to-red-100/20",
    icon: FaShieldAlt,
    label: "Cybersecurity",
    textColor: "text-red-600"
  }
];

// Hàm lấy theme dựa trên ID của blog
const getBlogTheme = (blogId: number) => {
  const index = blogId % BLOG_THEMES.length;
  return BLOG_THEMES[index];
};

export default function HomeBlog() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await blogApiRequest.getBlogs();
      if (response.payload && Array.isArray(response.payload.data)) {
        setBlogs(response.payload.data);
      } else {
        Alert.error("Lỗi", "Dữ liệu blog không hợp lệ");
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      Alert.error("Lỗi", "Không thể tải danh sách blog");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (blogId: number) => {
    setBlogToDelete(blogId);
    setShowDeleteModal(true);
  };

  const handleDeleteBlog = async () => {
    if (!blogToDelete) return;

    try {
      await blogApiRequest.deleteBlog(blogToDelete);
      setBlogs(blogs.filter(blog => blog.blogId !== blogToDelete));
      Alert.success("Thành công", "Đã xóa blog");
      setShowDeleteModal(false);
    } catch (error) {
      Alert.error("Lỗi", "Không thể xóa blog");
    }
    setBlogToDelete(null);
  };

  const handleSort = (key: 'date' | 'title') => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  const sortedAndFilteredBlogs = blogs
    .filter(blog =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'date') {
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * order;
      }
      return a.title.localeCompare(b.title) * order;
    });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Blog</h1>
            <p className="text-gray-500 text-sm mt-1">
              Tổng số: {sortedAndFilteredBlogs.length} bài viết
            </p>
          </div>
          <Link
            href="/admin/blog/add"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Thêm Blog Mới
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề hoặc tác giả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleSort('date')}
              className={`px-4 py-2 rounded-lg border flex items-center ${
                sortBy === 'date' ? 'bg-purple-50 border-purple-200' : 'border-gray-200'
              }`}
            >
              <FaCalendarAlt className={`mr-2 ${sortBy === 'date' ? 'text-purple-600' : 'text-gray-400'}`} />
              <span className={`${sortBy === 'date' ? 'text-purple-600' : 'text-gray-600'}`}>
                Ngày đăng {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </span>
            </button>
            <button
              onClick={() => handleSort('title')}
              className={`px-4 py-2 rounded-lg border flex items-center ${
                sortBy === 'title' ? 'bg-purple-50 border-purple-200' : 'border-gray-200'
              }`}
            >
              <FaSortAmountDown className={`mr-2 ${sortBy === 'title' ? 'text-purple-600' : 'text-gray-400'}`} />
              <span className={`${sortBy === 'title' ? 'text-purple-600' : 'text-gray-600'}`}>
                Tiêu đề {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Blog List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="grid gap-px bg-gray-200">
          {sortedAndFilteredBlogs.map((blog) => {
            const theme = getBlogTheme(blog.blogId);
            const IconComponent = theme.icon;

            return (
              <div key={blog.blogId} className="bg-white p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Thumbnail */}
                  <div className="w-full sm:w-48 h-48 rounded-lg overflow-hidden shrink-0">
                    <div className={`w-full h-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center group`}>
                      <IconComponent className="text-4xl text-gray-600 transform transition-transform group-hover:scale-110" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/10 py-2 text-center">
                        <span className="text-sm text-white/90">{theme.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-xl font-semibold text-gray-900 line-clamp-1">
                        {blog.title}
                      </h2>
                      <div className="flex items-center gap-2 ml-4">
                        {/* <Link
                          href={`/blog/${blog.blogId}`}
                          className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors group"
                          target="_blank"
                        >
                          <FaExternalLinkAlt className="mr-1.5 group-hover:scale-110 transition-transform" />
                          <span>Xem</span>
                        </Link> */}
                        <Link
                          href={`/admin/blog/edit/${blog.blogId}`}
                          className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                        >
                          <FaEdit className="mr-1.5 group-hover:scale-110 transition-transform" />
                          <span>Sửa</span>
                        </Link>
                        <button
                          onClick={() => confirmDelete(blog.blogId)}
                          className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                        >
                          <FaTrash className="mr-1.5 group-hover:scale-110 transition-transform" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <FaUser className="mr-2 text-gray-400" />
                        {blog.author}
                      </div>
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2 text-gray-400" />
                        {new Date(blog.date).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex items-center">
                        <FaLink className="mr-2 text-gray-400" />
                        <a 
                          href={blog.origin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-purple-600 truncate max-w-[200px]"
                        >
                          {blog.origin}
                        </a>
                      </div>
                    </div>
                    <p className="text-gray-600 line-clamp-2">{blog.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {sortedAndFilteredBlogs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="text-gray-500 mb-2">Không tìm thấy blog nào</div>
          <button
            onClick={() => setSearchTerm("")}
            className="text-purple-600 hover:text-purple-700"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Xác nhận xóa
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa blog này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setBlogToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteBlog}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
