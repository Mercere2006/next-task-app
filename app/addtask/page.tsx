"use client";

import Image from "next/image";
import AppName from "@/components/AppName";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Swal from "sweetalert2";

export default function Page() {
  const router = useRouter();

  // สร้าง state สำหรับเก็บข้อมูลที่ป้อน-เลือก
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ฟังก์ชันเลือกรูป + แสดงตัวอย่าง Preview
  const handleSelectedImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ฟังก์ชันรีเซ็ตข้อมูล
  const handleResetData = () => {
    setTitle("");
    setDetail("");
    setIsCompleted(false);
    setImageFile(null);
    setImagePreview(null);
  };

  // ฟังก์ชันบันทึกข้อมูล
  const handleSaveData = async () => {
    // Validate UI
    if (!title.trim() || !detail.trim() || imageFile === null) {
      Swal.fire({
        title: "คำเตือน",
        text: "กรุณากรอกข้อมูลให้ครบ และเลือกรูปด้วย",
        icon: "warning",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    try {
      setIsSaving(true);
      Swal.fire({
        title: "กำลังบันทึกข้อมูล...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Upload Image to Supabase Storage
      const newFileName = `dtisau_${Date.now()}_${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("task_bk")
        .upload(newFileName, imageFile);

      if (uploadError) {
        throw uploadError;
      }

      // ดึง Image Public URL จาก Bucket
      const { data } = supabase.storage.from("task_bk").getPublicUrl(newFileName);
      const imageUrl = data.publicUrl;

      // Save Data to Supabase Database
      const { error: saveError } = await supabase.from("task_tb").insert({
        title: title.trim(),
        detail: detail.trim(),
        is_completed: isCompleted,
        image_url: imageUrl,
      });

      if (saveError) {
        throw saveError;
      }

      // ตรวจสอบแล้วไม่มีข้อผิดพลาด แสดงข้อความแจ้ง และ redirect กลับไปหน้า /hometask
      await Swal.fire({
        title: "ผลการทำงาน",
        text: "บันทึกข้อมูลเรียบร้อยแล้ว",
        icon: "success",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#3b82f6",
      });

      router.push("/hometask");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "กรุณาลองใหม่อีกครั้ง";
      console.error("Save task error:", err);
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกข้อมูลได้: " + errorMessage,
        icon: "error",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-800 flex flex-col">
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-10">
        {/* แสดงชื่อแอป และ โลโก้ */}
        <header className="flex flex-col items-center justify-center mt-6 mb-8">
          <AppName />
          <Image
            src="https://xeqtggywsdyrqsmxkatb.supabase.co/storage/v1/object/public/task_bk/task_logo.png"
            alt="logo"
            width={140}
            height={140}
            className="mt-6 drop-shadow-xs"
            priority
          />
        </header>

        {/* ฟอร์มเพิ่มข้อมูลงาน */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-10">
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-6">
            เพิ่มข้อมูลงาน
          </h1>

          <div className="space-y-5">
            {/* ป้อนหัวข้องาน */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                ป้อนหัวข้องาน :
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="กรอกหัวข้องาน..."
                className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* ป้อนรายละเอียดงาน */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                ป้อนรายละเอียดงาน :
              </label>
              <textarea
                rows={4}
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="กรอกรายละเอียดงาน..."
                className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
              ></textarea>
            </div>

            {/* เลือกรูปภาพ */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                เลือกรูป :
              </label>
              <input
                type="file"
                id="selectImageFile"
                className="hidden"
                accept="image/*"
                onChange={handleSelectedImage}
              />
              <label
                htmlFor="selectImageFile"
                className="flex items-center justify-center gap-2 border border-dashed border-slate-300 rounded-xl p-3.5 w-full bg-slate-50 hover:bg-slate-100 cursor-pointer text-sm font-medium text-slate-600 transition"
              >
                <svg
                  className="w-5 h-5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>คลิกเพื่อเลือกรูปภาพ</span>
              </label>

              {/* ตัวอย่างภาพ Preview */}
              {imagePreview && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                    <Image
                      src={imagePreview}
                      alt="Task Preview"
                      fill
                      sizes="64px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="text-xs text-slate-500">
                    <p className="font-semibold text-slate-700">รูปภาพที่เลือก</p>
                    <p>{imageFile?.name || "รูปภาพที่เลือกไว้"}</p>
                  </div>
                </div>
              )}
            </div>

            {/* สถานะงาน */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                สถานะงาน :
              </label>
              <select
                value={isCompleted ? "1" : "0"}
                onChange={(e) => setIsCompleted(e.target.value === "1")}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="1">✅ เสร็จ</option>
                <option value="0">❌ ยังไม่เสร็จ</option>
              </select>
            </div>

            {/* ปุ่มบันทึกเพิ่มข้อมูลงาน */}
            <button
              onClick={handleSaveData}
              disabled={isSaving}
              className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "กำลังบันทึก..." : "บันทึกเพิ่มข้อมูลงาน"}
            </button>

            {/* ปุ่มรีเซ็ตข้อมูล */}
            <button
              onClick={handleResetData}
              disabled={isSaving}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl transition cursor-pointer"
            >
              รีเซ็ตข้อมูล
            </button>
          </div>
        </div>

        {/* ลิงก์กลับไปหน้า /hometask */}
        <div className="text-center mt-8 mb-10">
          <Link
            href="/hometask"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition"
          >
            <span>[ กลับไปหน้าหลัก ]</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
