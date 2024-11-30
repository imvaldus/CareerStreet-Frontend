"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import blogApiRequest from "@/app/apiRequest/blog";
import Alert from "@/components/Alert";
import { 
  FaCode, 
  FaLaptopCode, 
  FaMobileAlt, 
  FaBrain, 
  FaCloud, 
  FaShieldAlt,
  FaArrowLeft,
  FaSave,
  FaUser,
  FaCalendarAlt,
  FaLink
} from "react-icons/fa";

// Mảng các chủ đề blog
const BLOG_THEMES = [
  { 
    id: 'programming',
    gradient: "from-blue-500/20 to-blue-100/20",
    icon: FaCode,
    label: "Lập trình",
    textColor: "text-blue-600"
  },
  { 
    id: 'web',
    gradient: "from-green-500/20 to-green-100/20",
    icon: FaLaptopCode,
    label: "Web Development",
    textColor: "text-green-600"
  },
  { 
    id: 'mobile',
    gradient: "from-yellow-500/20 to-yellow-100/20",
    icon: FaMobileAlt,
    label: "Mobile Development",
    textColor: "text-yellow-600"
  },
  { 
    id: 'ai',
    gradient: "from-purple-500/20 to-purple-100/20",
    icon: FaBrain,
    label: "AI & ML",
    textColor: "text-purple-600"
  },
  { 
    id: 'cloud',
    gradient: "from-cyan-500/20 to-cyan-100/20",
    icon: FaCloud,
    label: "Cloud Computing",
    textColor: "text-cyan-600"
  },
  { 
    id: 'security',
    gradient: "from-red-500/20 to-red-100/20",
    icon: FaShieldAlt,
    label: "Cybersecurity",
    textColor: "text-red-600"
  }
];

export default function AddBlogPage() {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState(BLOG_THEMES[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    author: "",
    title: "",
    content: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    origin: "",
    category: BLOG_THEMES[0].id,
    admin_id: 1,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    setFormData(prev => ({
      ...prev,
      category: themeId
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await blogApiRequest.createBlog(formData);
      Alert.success("Thành công", "Blog đã được tạo");
      router.push("/admin/blog");
    } catch (error) {
      console.error("Error creating blog:", error);
      Alert.error("Lỗi", "Không thể tạo blog");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTheme = BLOG_THEMES.find(theme => theme.id === selectedTheme) || BLOG_THEMES[0];

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Tạo Blog Mới</h1>
          </div>
          <button
            type="submit"
            form="blog-form"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <FaSave className="mr-2" />
            {isSubmitting ? 'Đang lưu...' : 'Lưu blog'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  required
                  placeholder="Nhập tiêu đề blog..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tác giả</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    required
                    placeholder="Tên tác giả..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nguồn</label>
                  <input
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    required
                    placeholder="URL nguồn bài viết..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả ngắn</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent h-24"
                  required
                  placeholder="Mô tả ngắn về nội dung blog..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent h-64"
                  required
                  placeholder="Nội dung chi tiết của blog..."
                />
              </div>
            </form>
          </div>
        </div>

        {/* Preview & Theme Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Chọn chủ đề</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {BLOG_THEMES.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                const IconComponent = theme.icon;
                
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected 
                        ? `${theme.textColor} border-current bg-opacity-10 bg-current` 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-full aspect-square rounded-lg mb-3 bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
                      <IconComponent className={`text-2xl ${isSelected ? 'text-current' : 'text-gray-600'}`} />
                    </div>
                    <div className="text-sm font-medium truncate">
                      {theme.label}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Preview */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Xem trước</h2>
              
              {/* Theme Preview */}
              <div className="bg-white border rounded-xl overflow-hidden mb-6">
                <div className={`w-full aspect-video bg-gradient-to-br ${currentTheme.gradient} flex items-center justify-center relative`}>
                  <currentTheme.icon className="text-5xl text-gray-600" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/10 py-2 text-center">
                    <span className="text-sm text-white/90">{currentTheme.label}</span>
                  </div>
                </div>

                <div className="p-4">
                  {/* Meta info */}
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <FaUser className="mr-1.5 text-gray-400" />
                      {formData.author || "Tác giả"}
                    </div>
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-1.5 text-gray-400" />
                      {new Date(formData.date).toLocaleDateString("vi-VN")}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {formData.title || "Tiêu đề blog"}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {formData.description || "Mô tả sẽ xuất hiện ở đây..."}
                  </p>

                  {/* Content Preview */}
                  <div className="border-t pt-3">
                    <div className="prose prose-sm max-w-none">
                      <div className="text-sm text-gray-600 line-clamp-3">
                        {formData.content || "Nội dung blog sẽ xuất hiện ở đây..."}
                      </div>
                    </div>
                  </div>

                  {/* Source */}
                  <div className="flex items-center mt-4 text-sm text-gray-500">
                    <FaLink className="mr-1.5 text-gray-400" />
                    <span className="truncate">
                      {formData.origin || "Nguồn bài viết"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  Lưu ý khi viết blog
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Tiêu đề nên ngắn gọn và hấp dẫn</li>
                  <li>• Mô tả nên tóm tắt được nội dung chính</li>
                  <li>• Nội dung nên chia thành các đoạn rõ ràng</li>
                  <li>• Luôn ghi rõ nguồn tham khảo</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
