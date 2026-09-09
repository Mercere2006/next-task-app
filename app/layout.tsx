import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Task App",
  description: "เว็บแอปพลิเคชันบันทึกงานที่ต้องทำ",
  keywords: ["Task", "App", "To-Do List", "Task Management", "Productivity" , "งานที่ต้องทำ", "การจัดการงาน", "เพิ่มงาน", "ลบงาน", "แก้ไขงาน", "เครื่องมือเพิ่มประสิทธิภาพ"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${prompt.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
