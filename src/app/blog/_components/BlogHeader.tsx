"use client";
import { FaLaptopCode, FaSearch } from 'react-icons/fa';
import { useState } from 'react';

export default function BlogHeader() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="relative overflow-hidden">
      {/* Background với gradient và pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 to-blue-600/90">
        <div className="absolute inset-0 bg-grid-white/[0.1] bg-[length:16px_16px]"></div>
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div>

      {/* Content */}
      <div className="relative">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm">
                <FaLaptopCode className="text-4xl text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Blog IT
              <span className="block text-lg sm:text-xl md:text-2xl font-normal mt-2 text-purple-100/80">
                Khám phá thế giới công nghệ
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg text-purple-100/90 max-w-2xl mx-auto mb-8 leading-relaxed">
              Cập nhật những kiến thức mới nhất về công nghệ, lập trình và phát triển sự nghiệp trong ngành IT
            </p>

            {/* Search bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 rounded-full bg-white/10 backdrop-blur-sm text-white placeholder-purple-100/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-all">
                  <FaSearch className="text-white text-xl" />
                </button>
              </div>
            </div>           
          </div>
        </div>
      </div>
    </div>
  );
} 