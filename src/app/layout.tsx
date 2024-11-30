"use client";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";

import localFont from "next/font/local";
import "./globals.css";
import { usePathname } from "next/navigation";

import Layout from "@/components/Layout";
import LayoutCandidate from "@/components/candidate/LayoutCandidate";
import ErrorPage from "@/components/ErrorPage";
import LayoutJobs from "@/components/jobs/LayoutJobs";
import LayoutEmployer from "@/components/employer/LayoutEmployer";
import LayoutLogin from "@/components/candidate/LayoutLogin";
import LayoutAdmin from "@/components/admin/LayoutAdmin";
import LayoutLoginAdmin from "@/components/admin/LayoutLoginAdmin";
import { JobProvider } from "./context/JobContext";
import { CandidateProvider } from "./context/CandidateContext";
import { ApplyProvider } from "./context/ApplyContext";
import { AccountProvider } from "./context/AccountContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname(); // Lấy đường dẫn hiện tại

  const isHomePage = pathname === "/";
  const isCandidatePage = pathname.startsWith("/candidate");
  const isJobsPage = pathname.startsWith("/jobs");
  const isEmployerPage = pathname.startsWith("/employer");
  const isLoginPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminLoginPage = pathname.startsWith("/admin/login");
  const isBlogPage = pathname.startsWith("/blog");

  // Suppress specific Grammarly extension warnings
  const suppressGrammarlyWarnings = {
    suppressHydrationWarning: true,
    'data-new-gr-c-s-check-loaded': undefined,
    'data-gr-ext-installed': undefined
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        {...suppressGrammarlyWarnings}
      >
        <div className="scroll-m-0">
          {isHomePage ? (
            <JobProvider>
              <Layout>{children}</Layout>
            </JobProvider>
          ) : isCandidatePage ? (
            <CandidateProvider>
              <ApplyProvider>
                <LayoutCandidate>{children}</LayoutCandidate>
              </ApplyProvider>
            </CandidateProvider>
          ) : isJobsPage ? (
            <ApplyProvider>
              <JobProvider>
                <LayoutJobs>{children}</LayoutJobs>
              </JobProvider>
            </ApplyProvider>
          ) : isEmployerPage ? (
            <ApplyProvider>
              <LayoutEmployer>{children}</LayoutEmployer>
            </ApplyProvider>
          ) : isAdminLoginPage ? (
            <LayoutLoginAdmin>{children}</LayoutLoginAdmin>
          ) : isAdminPage ? (
            <CandidateProvider>
              <AccountProvider>
                <JobProvider>
                  <LayoutAdmin>{children}</LayoutAdmin>
                </JobProvider>
              </AccountProvider>
            </CandidateProvider>
          ) : isLoginPage ? (
            <LayoutLogin>{children}</LayoutLogin>
          ) : isBlogPage ? (
            <Layout>{children}</Layout>
          ) : (
            <ErrorPage />
          )}
        </div>
      </body>
    </html>
  );
}
