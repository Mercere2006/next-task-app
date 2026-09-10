"use client";

import Image from "next/image";
import AppName from "@/components/AppName";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Swal from "sweetalert2";

type Task = {
  id: string;
  created_at: string;
  title: string;
  detail: string;
  is_completed: boolean;
  image_url: string;
  update_at?: string;
};

function EditTaskForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("id");

  // State สำหรับเก็บข้อมูลและฟอร์ม
  const [initialData, setInitialData] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // ดึงข้อมูลเก่าของ Task มาแสดง
  useEffect(() => {
    if (!taskId) {
      Swal.fire({
        title: "ไม่พบรหัสงาน",
        text: "ไม่พบข้อมูลรหัสงานที่ต้องการแก้ไข กรุณาเลือกงานจากหน้าหลัก",
        icon: "warning",
        confirmButtonText: "กลับไปหน้าหลัก",
        confirmButtonColor: "#3b82f6",
      }).then(() => {
        router.push("/hometask");
      });
      return;
    }

    let isMounted = true;

    const fetchTask = async () => {
      const { data, error: fetchError } = await supabase
        .from("task_tb")
        .select("*")
        .eq("id", taskId)
        .single();

      if (!isMounted) return;

      if (fetchError || !data) {
        console.error("Error fetching task:", fetchError);
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถดึงข้อมูลงานได้ กรุณาลองใหม่อีกครั้ง",
          icon: "error",
          confirmButtonText: "กลับไปหน้าหลัก",
          confirmButtonColor: "#3b82f6",
        }).then(() => {
          router.push("/hometask");
        });
        return;
      }

      // นำข้อมูลเก่ามากำหนดลง State
      setInitialData(data);
      setTitle(data.title || "");
      setDetail(data.detail || "");
      setIsCompleted(Boolean(data.is_completed));
      setImagePreview(data.image_url || null);
      setIsLoading(false);
    };

    fetchTask();

    return () => {
      isMounted = false;
    };
  }, [taskId, router]);

  // ฟังก์ชันเลือกรูปใหม่ + แสดงตัวอย่าง Preview
  const handleSelectedImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ฟังก์ชันรีเซ็ตข้อมูลกลับเป็นค่าเดิมที่ดึงมาจากฐานข้อมูล
  const handleResetData = () => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDetail(initialData.detail || "");
      setIsCompleted(Boolean(initialData.is_completed));
      setImageFile(null);
      setImagePreview(initialData.image_url || null);
    }
  };

  // ฟังก์ชันบันทึกแก้ไขข้อมูลงาน
  const handleSaveData = async () => {
    if (!title.trim() || !detail.trim()) {
      Swal.fire({
        title: "คำเตือน",
        text: "กรุณากรอกหัวข้องานและรายละเอียดให้ครบถ้วน",
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

      let finalImageUrl = initialData?.image_url || "";

      // หากผู้ใช้เลือกรูปภาพใหม่ ให้อัปโหลดขึ้น Supabase Storage
      if (imageFile) {
        const newFileName = `dtisau_${Date.now()}_${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("task_bk")
          .upload(newFileName, imageFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from("task_bk")
          .getPublicUrl(newFileName);
        finalImageUrl = urlData.publicUrl;
      }

      // บันทึกอัปเดตลงตาราง task_tb (ใช้คอลัมน์ update_at)
      const { error: updateError } = await supabase
        .from("task_tb")
        .update({
          title: title.trim(),
          detail: detail.trim(),
          is_completed: isCompleted,
          image_url: finalImageUrl,
          update_at: new Date().toISOString(),
        })
        .eq("id", taskId);

      if (updateError) {
        throw updateError;
      }

      await Swal.fire({
        title: "ผลการทำงาน",
        text: "บันทึกแก้ไขข้อมูลงานเรียบร้อยแล้ว",
        icon: "success",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#3b82f6",
      });

      router.push("/hometask");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "กรุณาลองใหม่อีกครั้ง";
      console.error("Update error:", err);
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกแก้ไขข้อมูลงานได้: " + errorMessage,
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

        {/* ฟอร์มแก้ไขข้อมูลงาน */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-10">
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-6">
            แก้ไขข้อมูลงาน
          </h1>

          {isLoading ? (
            /* Loading State */
            <div className="py-16 text-center">
              <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-blue-500 border-t-transparent mb-4"></div>
              <p className="text-slate-500 text-sm font-medium">
                กำลังดึงข้อมูลงานเดิม...
              </p>
            </div>
          ) : (
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
                  <span>คลิกเพื่อเลือกรูปภาพใหม่</span>
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
                      <p className="font-semibold text-slate-700">
                        {imageFile ? "รูปภาพใหม่ที่เลือก" : "รูปภาพเดิมของงานนี้"}
                      </p>
                      <p>
                        {imageFile
                          ? imageFile.name
                          : "สามารถคลิกปุ่มด้านบนเพื่อเปลี่ยนรูปภาพได้"}
                      </p>
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

              {/* ปุ่มบันทึกแก้ไขข้อมูลงาน */}
              <button
                onClick={handleSaveData}
                disabled={isSaving}
                className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "กำลังบันทึก..." : "บันทึกแก้ไขข้อมูลงาน"}
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
          )}
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

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      }
    >
      <EditTaskForm />
    </Suspense>
  );
}
