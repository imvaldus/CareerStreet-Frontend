"use client";
import Image from "next/image";
import Link from "next/link";
import { Blog } from "@/app/schemaValidations/blog.schema";
import { FaUser, FaCalendarAlt, FaArrowRight, FaCode, FaLaptopCode, FaMobileAlt, FaBrain, FaCloud, FaShieldAlt, FaLink } from "react-icons/fa";

// Từ khóa cho mỗi chủ đề
export const THEME_KEYWORDS = {
  "Lập trình": ["code", "programming", "developer", "lập trình", "coding"],
  "Web Development": ["web", "frontend", "backend", "fullstack", "javascript", "html", "css"],
  "Mobile Development": ["mobile", "android", "ios", "flutter", "react native"],
  "AI & ML": ["ai", "machine learning", "deep learning", "neural network", "trí tuệ nhân tạo"],
  "Cloud Computing": ["cloud", "aws", "azure", "devops", "docker", "kubernetes"],
  "Cybersecurity": ["security", "bảo mật", "hacking", "cyber", "encryption"]
} as const;

// Mảng các gradient và icon cho từng chủ đề
export const BLOG_THEMES = [
  { 
    id: "programming",
    gradient: "from-blue-100 to-blue-50",
    icon: FaCode,
    label: "Lập trình"
  },
  { 
    id: "web",
    gradient: "from-green-100 to-green-50",
    icon: FaLaptopCode,
    label: "Web Development"
  },
  { 
    id: "mobile",
    gradient: "from-yellow-100 to-yellow-50",
    icon: FaMobileAlt,
    label: "Mobile Development"
  },
  { 
    id: "ai",
    gradient: "from-purple-100 to-purple-50",
    icon: FaBrain,
    label: "AI & ML"
  },
  { 
    id: "cloud",
    gradient: "from-cyan-100 to-cyan-50",
    icon: FaCloud,
    label: "Cloud Computing"
  },
  { 
    id: "security",
    gradient: "from-red-100 to-red-50",
    icon: FaShieldAlt,
    label: "Cybersecurity"
  }
];

// Hàm phát hiện chủ đề dựa trên nội dung
const detectTheme = (content: string, title: string) => {
  const lowercaseContent = content.toLowerCase();
  const lowercaseTitle = title.toLowerCase();
  
  // Tính điểm cho từng chủ đề
  const themeScores = BLOG_THEMES.reduce((acc, theme) => {
    const keywords = THEME_KEYWORDS[theme.label as keyof typeof THEME_KEYWORDS] || [];
    
    // Tính điểm cho tiêu đề (trọng số cao hơn)
    const titleMatches = keywords.filter(keyword => 
      lowercaseTitle.includes(keyword.toLowerCase())
    ).length * 3; // Tăng trọng số tiêu đề lên 3
    
    // Tính điểm cho nội dung
    const contentMatches = keywords.filter(keyword => 
      lowercaseContent.includes(keyword.toLowerCase())
    ).length;

    // Tổng điểm = điểm tiêu đề + điểm nội dung
    const totalScore = titleMatches + contentMatches;
    
    return { ...acc, [theme.id]: totalScore };
  }, {} as Record<string, number>);

  // Lấy 2 chủ đề có điểm cao nhất
  const topThemes = Object.entries(themeScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2);

  // Nếu không có điểm nào
  if (topThemes[0][1] === 0) {
    return BLOG_THEMES[0].id;
  }

  // Nếu chủ đề cao nhất có điểm gấp đôi chủ đề thứ 2, chọn chủ đề cao nhất
  if (topThemes[0][1] >= topThemes[1][1] * 2) {
    return topThemes[0][0];
  }

  // Nếu cả 2 chủ đề có điểm gần bằng nhau và một trong hai là AI
  const [firstTheme, secondTheme] = topThemes;
  if (Math.abs(firstTheme[1] - secondTheme[1]) <= 2) {
    if (firstTheme[0] === "ai" || secondTheme[0] === "ai") {
      return "ai"; // Ưu tiên AI nếu điểm gần bằng nhau
    }
  }

  return topThemes[0][0];
};

// Hàm lấy theme dựa trên blog
export function getBlogTheme(blog: Blog) {
  const themeId = detectTheme(blog.content, blog.title);
  return BLOG_THEMES.find(theme => theme.id === themeId) || BLOG_THEMES[0];
}

export function getThemeColor(themeId: string) {
  switch (themeId) {
    case 'programming': return 'text-blue-600';
    case 'web': return 'text-green-600';
    case 'mobile': return 'text-yellow-600';
    case 'ai': return 'text-purple-600';
    case 'cloud': return 'text-cyan-600';
    case 'security': return 'text-red-600';
    default: return 'text-blue-600';
  }
}

const formatOriginUrl = (url: string) => {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace('www.', '');
  } catch {
    return url;
  }
};

export default function BlogGrid({ blogs }: { blogs: Blog[] }) {
  if (!blogs?.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl text-gray-600 mb-4">Chưa có bài viết nào</h3>
        <p className="text-gray-500">Vui lòng quay lại sau.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {blogs.map((blog) => {
        const theme = getBlogTheme(blog);
        const IconComponent = theme.icon;
        const themeColor = getThemeColor(theme.id);
        
        return (
          <article 
            key={blog.blogId}
            className="group bg-white rounded-xl border border-gray-100 hover:border-purple-100 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className={`relative h-52 bg-gradient-to-br ${theme.gradient} flex items-center justify-center overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
              <IconComponent className="text-6xl text-gray-800/20 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-4 left-4">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm ${themeColor} text-sm font-medium shadow-sm`}>
                  <IconComponent className="text-sm" />
                  <span>{theme.label}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <Link href={`/blog/${blog.blogId}`} className="block group/link">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover/link:text-purple-600 transition-colors line-clamp-2">
                  {blog.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{blog.content}</p>
              </Link>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1.5">
                  <FaUser className={themeColor} />
                  <span>{blog.author}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaCalendarAlt className={themeColor} />
                  <span>{new Date(blog.date).toLocaleDateString("vi-VN")}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <Link
                  href={`/blog/${blog.blogId}`}
                  className={`${themeColor} hover:text-purple-700 inline-flex items-center gap-2 text-sm font-medium`}
                >
                  Xem chi tiết
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <FaLink className={themeColor} />
                  {blog.origin && (
                    <a 
                      href={blog.origin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`hover:text-purple-600 truncate max-w-[150px] ${themeColor}`}
                      title={blog.origin}
                    >
                      {formatOriginUrl(blog.origin)}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
} 