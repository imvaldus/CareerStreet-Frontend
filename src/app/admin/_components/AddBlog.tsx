"use client";
import { useState, useEffect, useRef } from "react";
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

// Từ điển các từ khóa chủ đề
const THEME_KEYWORDS = {
  programming: {
    primary: ["lập trình", "programming", "code", "coding"],
    secondary: ["algorithm", "function", "biến", "vòng lặp", "hàm", "thuật toán", "debug", "compiler"],
    frameworks: ["java", "python", "c++", "javascript", "php", "ruby", "swift", "golang"]
  },
  web: {
    primary: ["web", "frontend", "backend", "fullstack"],
    secondary: ["responsive", "website", "webapp", "server", "client"],
    frameworks: ["react", "angular", "vue", "nextjs", "nodejs", "express", "django", "laravel", "html", "css"]
  },
  mobile: {
    primary: ["mobile", "android", "ios", "app"],
    secondary: ["smartphone", "tablet", "ứng dụng di động", "mobile app"],
    frameworks: ["react native", "flutter", "kotlin", "swift", "xamarin", "ionic"]
  },
  ai: {
    primary: ["ai", "machine learning", "deep learning", "trí tuệ nhân tạo"],
    secondary: ["neural network", "học máy", "mạng neural", "training", "model", "dataset"],
    frameworks: ["tensorflow", "pytorch", "keras", "scikit-learn", "opencv", "nlp"]
  },
  cloud: {
    primary: ["cloud", "đám mây", "server", "hosting"],
    secondary: ["scale", "deployment", "container", "microservice", "serverless"],
    frameworks: ["aws", "azure", "gcp", "docker", "kubernetes", "devops", "ci/cd"]
  },
  security: {
    primary: ["security", "bảo mật", "hack", "cybersecurity", "an ninh mạng"],
    secondary: ["firewall", "encryption", "mã hóa", "bảo vệ", "vulnerability", "lỗ hổng"],
    frameworks: ["penetration testing", "cryptography", "ssl", "authentication", "authorization"]
  }
};

export default function AddBlogPage() {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState(BLOG_THEMES[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    author: "",
    title: "",
    content: "",
    date: new Date().toISOString().split('T')[0],
    origin: "",
    category: BLOG_THEMES[0].id,
    admin_id: 1,
  });

  const debounceTimer = useRef<NodeJS.Timeout>();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Use debounce for theme detection
    if (name === 'title' || name === 'content') {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        const newContent = name === 'content' ? value : formData.content;
        const newTitle = name === 'title' ? value : formData.title;
        const detectedTheme = detectTheme(newContent, newTitle);
        
        if (detectedTheme !== selectedTheme) {
          setSelectedTheme(detectedTheme);
          setFormData(prev => ({
            ...prev,
            category: detectedTheme
          }));
        }
      }, 300); // Wait for 300ms of no typing before updating theme
    }
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
      Alert.success("SUCCESS_BLOG_CREATE");
      router.push("/admin/blog");
    } catch (error) {
      console.error("Error creating blog:", error);
      Alert.error("ERROR_BLOG_CREATE");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTheme = BLOG_THEMES.find(theme => theme.id === selectedTheme) || BLOG_THEMES[0];

  // Hàm phát hiện chủ đề dựa trên nội dung
  const detectTheme = (content: string, title: string) => {
    const lowercaseContent = content.toLowerCase();
    const lowercaseTitle = title.toLowerCase();
    const combinedText = `${lowercaseTitle} ${lowercaseContent}`;
    
    // Calculate scores for each theme
    const themeScores = Object.entries(THEME_KEYWORDS).reduce((scores, [theme, keywords]) => {
      let score = 0;
      
      // Check title matches (higher weight)
      const titleScore = 
        keywords.primary.filter(word => lowercaseTitle.includes(word)).length * 5 +
        keywords.secondary.filter(word => lowercaseTitle.includes(word)).length * 3 +
        keywords.frameworks.filter(word => lowercaseTitle.includes(word)).length * 4;
      
      // Check content matches
      const contentScore = 
        keywords.primary.filter(word => lowercaseContent.includes(word)).length * 3 +
        keywords.secondary.filter(word => lowercaseContent.includes(word)).length * 2 +
        keywords.frameworks.filter(word => lowercaseContent.includes(word)).length * 2.5;
      
      // Additional points for exact phrase matches
      const exactPhraseBonus = keywords.primary
        .filter(phrase => combinedText.includes(phrase))
        .length * 2;
      
      // Calculate final score
      score = titleScore + contentScore + exactPhraseBonus;
      
      // Bonus points for multiple keyword matches from the same category
      const uniqueMatches = new Set([
        ...keywords.primary.filter(word => combinedText.includes(word)),
        ...keywords.secondary.filter(word => combinedText.includes(word)),
        ...keywords.frameworks.filter(word => combinedText.includes(word))
      ]).size;
      
      if (uniqueMatches > 2) {
        score *= 1.5; // 50% bonus for diverse keyword matches
      }
      
      return { ...scores, [theme]: score };
    }, {} as Record<string, number>);
    
    // Get top 2 themes
    const sortedThemes = Object.entries(themeScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2);
    
    // Debug log for theme scores
    console.log('Theme Scores:', themeScores);
    
    // If no significant matches, return default
    if (sortedThemes[0][1] === 0) {
      return BLOG_THEMES[0].id;
    }
    
    // If the top theme has a significantly higher score
    if (sortedThemes[0][1] >= sortedThemes[1][1] * 1.5) {
      return sortedThemes[0][0];
    }
    
    // Special case: AI-related content with multiple themes
    if (sortedThemes.some(([theme]) => theme === 'ai') && 
        Math.abs(sortedThemes[0][1] - sortedThemes[1][1]) < 5) {
      return 'ai';
    }
    
    // Return the highest scoring theme
    return sortedThemes[0][0];
  };

  // Add theme descriptions
  const getThemeDescription = (themeId: string) => {
    switch (themeId) {
      case 'programming': return 'Các bài viết về lập trình cơ bản';
      case 'web': return 'Phát triển ứng dụng web';
      case 'mobile': return 'Phát triển ứng dụng di động';
      case 'ai': return 'Trí tuệ nhân tạo và máy học';
      case 'cloud': return 'Điện toán đám mây';
      case 'security': return 'Bảo mật và an ninh mạng';
      default: return '';
    }
  };

  // Add theme colors
  const getBgColor = (themeId: string) => {
    switch (themeId) {
      case 'programming': return 'bg-blue-50';
      case 'web': return 'bg-green-50';
      case 'mobile': return 'bg-yellow-50';
      case 'ai': return 'bg-purple-50';
      case 'cloud': return 'bg-cyan-50';
      case 'security': return 'bg-red-50';
      default: return 'bg-blue-50';
    }
  };

  const getBorderColor = (themeId: string) => {
    switch (themeId) {
      case 'programming': return 'border-blue-500';
      case 'web': return 'border-green-500';
      case 'mobile': return 'border-yellow-500';
      case 'ai': return 'border-purple-500';
      case 'cloud': return 'border-cyan-500';
      case 'security': return 'border-red-500';
      default: return 'border-blue-500';
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

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
                const bgColor = getBgColor(theme.id);
                const borderColor = getBorderColor(theme.id);
                
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      isSelected 
                        ? `${bgColor} border-2 ${borderColor}` 
                        : 'bg-white hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className={`shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
                      <IconComponent className={`text-xl ${isSelected ? theme.textColor : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`text-sm font-medium ${isSelected ? theme.textColor : 'text-gray-700'}`}>
                        {theme.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getThemeDescription(theme.id)}
                      </div>
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
