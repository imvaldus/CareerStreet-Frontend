"use client";
import Link from "next/link";
import Image from "next/image";
import logo from "/public/images/logo.png";
import { ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons";

export default function Header() {

  return (
    <header className="bg-slate-200 py-2 shadow-md sticky top-0 z-50">
      <nav className="flex justify-between items-center w-[92%] mx-auto">
        <div className="flex items-center">
          <Link href="/">
            <Image
              className="w-12 h-auto cursor-pointer"
              src={logo}
              alt="Logo"
            />
          </Link>

          <div className="nav-links duration-500 md:static absolute bg-slate-200 md:min-h-fit min-h-[60vh] left-0 top-[-100%] md:w-auto w-full flex items-center px-5">
            <ul className="flex md:flex-row flex-col md:items-center md:gap-8 gap-4 p-4 border-t border-gray-200 md:border-t-0 md:space-x-4 space-y-4 md:space-y-0 z-50">
              {/* Các menu item */}
              <li className="relative group">
                <Link
                  className="text-gray-800 text-xs hover:text-blue-600 transition-colors duration-300 flex items-center"
                  href="/jobs"
                >
                  Việc làm IT
                </Link>
              </li>

              <li className="relative group">
                <Link
                  className="text-xs text-gray-800 hover:text-blue-600 transition-colors duration-300 flex items-center"
                  href="/blog"
                >
                  Blog IT
                </Link>             
              </li>
            </ul>
          </div>
        </div>

        {/* kiểm tra đăng nhập */}
        <div className="text-xs">
          {/* Giao diện khi người dùng chưa đăng nhập */}
        </div>
      </nav>
    </header>
  );
}
