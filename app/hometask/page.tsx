"use client";

import Image from "next/image";
import AppName from "@/components/AppName";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Swal from "sweetalert2";

// สร้าง Type ที่มีรูปแบบข้อมูลตรงกับคอลัมน์ในตาราง
type Task = {
  id: string;
  created_at: string;
  title: string;
  detail: string;
  is_completed: boolean;
  image_url: string;
  update_at?: string;
};

export default function Page() {
  // สร้าง state สำหรับเก็บข้อมูลที่ดึงมาจาก supabase
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ดึงข้อมูลจาก supabase มาแสดงในตาราง
  useEffect(() => {
    let isMounted = true;

    const fetchTasks = async () => {
      const { data, error: fetchError } = await supabase
        .from("task_tb")
        .select("*")
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (fetchError) {
        console.error(fetchError?.message);
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถดึงข้อมูลได้ กรุณาตรวจสอบหรือลองใหม่อีกครั้ง",
          icon: "error",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#3b82f6",
        });
      } else {
        setTasks(data || []);
      }
      setIsLoading(false);
    };

    fetchTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  // ฟังก์ชันลบงาน พร้อมกล่องยืนยันและการแจ้งเตือนด้วย SweetAlert2
  const handleDeleteTask = async (task: Task) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบงาน?",
      html: `คุณแน่ใจหรือไม่ว่าต้องการลบงาน <strong>"${task.title}"</strong>?<br><span class="text-xs text-gray-500 mt-1 inline-block">เมื่อลบแล้วจะไม่สามารถกู้คืนข้อมูลได้</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
      focusCancel: true,
    });

    if (result.isConfirmed) {
      try {
        // แสดง Loading ขณะกำลังลบ
        Swal.fire({
          title: "กำลังลบข้อมูล...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const { error: deleteError } = await supabase
          .from("task_tb")
          .delete()
          .eq("id", task.id);

        if (deleteError) {
          throw deleteError;
        }

        // ลบออกจาก State ทันทีเพื่อให้ UI อัปเดตทันใจ
        setTasks((prev) => prev.filter((item) => item.id !== task.id));

        // แจ้งเตือนเมื่อลบสำเร็จตามที่โจทย์ต้องการ
        await Swal.fire({
          title: "ลบสำเร็จ!",
          text: `ลบงาน "${task.title}" เรียบร้อยแล้ว`,
          icon: "success",
          timer: 1800,
          showConfirmButton: false,
          timerProgressBar: true,
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "กรุณาลองใหม่อีกครั้ง";
        console.error("Delete error:", err);
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถลบงานได้: " + errorMessage,
          icon: "error",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#3b82f6",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-800 flex flex-col">
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header ส่วนหัว: Manage Task App อยู่ด้านบน โลโก้อยู่ถัดลงมา ไม่มีคำบรรยาย */}
        <header className="flex flex-col items-center justify-center mt-6 mb-8">
          <AppName />
          <Image
            src="https://xeqtggywsdyrqsmxkatb.supabase.co/storage/v1/object/public/task_bk/task_logo.png"
            alt="Task Logo"
            width={160}
            height={160}
            className="mt-6 drop-shadow-xs"
            priority
          />
        </header>

        {/* ส่วนปุ่มเปิดไปหน้า /addtask */}
        <div className="flex justify-end mb-6">
          <Link
            href="/addtask"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-sm py-2.5 px-5 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>เพิ่ม TASK</span>
          </Link>
        </div>

        {/* ตารางแสดงข้อมูลงาน */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/50 overflow-hidden">
          {isLoading ? (
            /* Skeleton Loading State */
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-blue-500 border-t-transparent mb-4"></div>
              <p className="text-slate-500 text-sm font-medium">กำลังโหลดข้อมูลงานจากระบบ...</p>
            </div>
          ) : tasks.length === 0 ? (
            /* Empty State */
            <div className="py-16 px-4 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
                📂
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">ไม่พบข้อมูลงาน</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                ยังไม่มีงานที่ถูกบันทึกในระบบ เริ่มต้นสร้างงานแรกของคุณเลย!
              </p>
              <Link
                href="/addtask"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-6 rounded-xl shadow-xs transition"
              >
                + เพิ่มงานใหม่
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table View (แสดงบนจอขนาดกลางขึ้นไป) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-4 px-4 w-20 text-center whitespace-nowrap">รูปงาน</th>
                      <th className="py-4 px-6 w-48 whitespace-nowrap">ชื่องาน</th>
                      <th className="py-4 px-6 min-w-[200px]">รายละเอียดงาน</th>
                      <th className="py-4 px-6 w-52 text-center whitespace-nowrap">สถานะงาน</th>
                      <th className="py-4 px-6 w-44 text-center whitespace-nowrap">ลบ/แก้ไข</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {tasks.map((task) => (
                      <tr
                        key={task.id}
                        className="hover:bg-slate-50/80 transition-colors duration-150 group"
                      >
                        {/* รูปงาน */}
                        <td className="py-4 px-4 text-center align-middle whitespace-nowrap">
                          <div className="w-14 h-14 mx-auto rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs relative flex items-center justify-center">
                            {task.image_url ? (
                              <Image
                                src={task.image_url}
                                alt={task.title || "Task image"}
                                fill
                                sizes="56px"
                                className="object-cover group-hover:scale-105 transition-transform duration-200"
                                unoptimized
                              />
                            ) : (
                              <span className="text-slate-400 text-xl">🖼️</span>
                            )}
                          </div>
                        </td>

                        {/* ชื่องาน */}
                        <td className="py-4 px-6 align-middle font-medium text-slate-800">
                          <p className="line-clamp-2 leading-relaxed font-semibold">{task.title}</p>
                          {task.created_at && (
                            <span className="text-[11px] text-slate-400 font-normal">
                              {new Date(task.created_at).toLocaleDateString("th-TH", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </td>

                        {/* รายละเอียดงาน */}
                        <td className="py-4 px-6 align-middle text-slate-600">
                          <p className="line-clamp-2 leading-relaxed">{task.detail || "-"}</p>
                        </td>

                        {/* สถานะงาน: จุดเด่นเรืองแสงสีเขียวเมื่อเสร็จ / สีแดงเมื่อยังไม่เสร็จ (ไม่ตัดบรรทัด) */}
                        <td className="py-4 px-6 align-middle text-center whitespace-nowrap">
                          {task.is_completed ? (
                            <span className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-emerald-500/15 text-emerald-700 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.35)] ring-1 ring-emerald-500/30">
                              <span className="relative flex h-2 w-2 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                              </span>
                              เสร็จแล้ว
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-rose-500/15 text-rose-700 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.35)] ring-1 ring-rose-500/30">
                              <span className="relative flex h-2 w-2 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-[0_0_8px_#f43f5e]"></span>
                              </span>
                              ยังไม่เสร็จ
                            </span>
                          )}
                        </td>

                        {/* ปุ่มลบ / แก้ไข */}
                        <td className="py-4 px-6 align-middle text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            {/* ปุ่มแก้ไข -> ไปหน้า /edittask พร้อมแนบ id */}
                            <Link
                              href={`/edittask?id=${task.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 shadow-xs transition active:scale-95 whitespace-nowrap"
                              title="แก้ไขงานนี้"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span>แก้ไข</span>
                            </Link>

                            {/* ปุ่มลบ -> เรียกฟังก์ชันลบ พร้อม SweetAlert2 */}
                            <button
                              onClick={() => handleDeleteTask(task)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
                              title="ลบงานนี้"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>ลบ</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (แสดงบนจอขนาดเล็กเพื่อให้อ่านง่ายไม่บีบตาราง) */}
              <div className="md:hidden divide-y divide-slate-100">
                {tasks.map((task) => (
                  <div key={task.id} className="p-4 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      {/* รูปงาน */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative flex items-center justify-center">
                        {task.image_url ? (
                          <Image
                            src={task.image_url}
                            alt={task.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="text-2xl">🖼️</span>
                        )}
                      </div>

                      {/* ข้อมูลงาน */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-slate-800 text-sm truncate">{task.title}</h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.detail || "ไม่มีรายละเอียด"}</p>
                        
                        {/* สถานะเรืองแสง */}
                        <div className="mt-2">
                          {task.is_completed ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.35)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
                              เสร็จแล้ว
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-700 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.35)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]"></span>
                              ยังไม่เสร็จ
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ปุ่มจัดการสำหรับมือถือ */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <Link
                        href={`/edittask?id=${task.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        แก้ไข
                      </Link>
                      <button
                        onClick={() => handleDeleteTask(task)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      {/* แสดง Footer */}
      <Footer />
    </div>
  );
}
