"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation"; // Đã thay đổi thành "next/router"
import { useState } from "react";
import { deleteCookie } from "cookies-next"; // Import hàm deleteCookie
import { LoginBody, LoginBodyType } from "../schemaValidations/auth.schema";
import authApiRequest from "@/app/apiRequest/auth";
import Alert from "@/components/Alert";

export default function LoginForm() {
  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(values: LoginBodyType) {
    setIsLoading(true);
    try {
      // Gọi API đăng nhập
      const data = await authApiRequest.login(values);
      console.log("username dang nhap: " + data.payload.data.username);

      // Gọi API xác thực
      await authApiRequest.auth({
        sessionToken: data.payload.data.token,
        username: data.payload.data.username,
        userId: data.payload.data.userId,
      });

      // Gọi API để lấy vai trò của người dùng
      try {
        const roleData = await authApiRequest.roleid(
          data.payload.data.username,
          data.payload.data.token
        );
        console.log("Role response: ", roleData); // In ra phản hồi từ API roleid

        const userRole = roleData.payload.data;

        // Kiểm tra vai trò người dùng và chuyển hướng
        if (userRole === 3) {
          console.log("Dang nhap Candidate thanh cong");
          router.push("/"); // Trang dành cho Candidate
        } else if (userRole === 2) {
          console.log("Dang nhap Employer thanh cong");
          router.push("/employer/home"); // Trang dành cho Employer
        } else if (userRole === 1) {
          deleteCookie("username"); // Xóa cookie
          deleteCookie("userId"); // Xóa cookie
          deleteCookie("sessionToken"); // Xóa cookie
          console.log("Vai trò là admin, không hỗ trợ đăng nhập.");
          Alert.error("Lỗi:", "Không được phép đăng nhập.");
          return; // Dừng lại và không tiếp tục các bước sau
        } else {
          console.log("Vai trò không hợp lệ hoặc không hỗ trợ");
          Alert.error("Lỗi", "Vai trò không hợp lệ.");
          return; // Dừng lại và không tiếp tục các bước sau
        }
      } catch (roleError) {
        console.error("Error fetching role:", roleError);
        // Xử lý lỗi lấy vai trò, ví dụ: thông báo lỗi cho người dùng
        Alert.error("Lỗi", "Lỗi khi lấy vai trò người dùng.");
      }
    } catch (error) {
      Alert.error("Đăng nhập thất bại", "Sai tên đăng nhập hoặc mật khẩu");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-2 py-10 lg:px-8 bg-gray-100">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm ">
          <img
            alt="Your Company"
            src="images/logo.png"
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Username
              </label>
              <div className="mt-2">
                <input
                  {...form.register("username")}
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  {...form.register("password")}
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {isLoading ? "Loading..." : "Sign in"}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            Chưa có tài khoản?{" "}
            <a
              href="/register"
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            >
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
