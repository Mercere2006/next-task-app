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
  updated_at: string;
};

export default function Page() {
  // สร้าง state สำหรับเก็บข้อมูลที่ดึงมาจาก supabase ทั้งนี้เป็น array
  const [tasks, setTasks] = useState<Task[]>([]);

  // ดึงข้อมูลจาก supabase มาแสดงในตาราง
  useEffect(() => {
    // ฟังก์ชันดึงข้อมูล
    const fetchTasks = async () => {
      // ดึงข้อมูล
      const { data, error: fetchError } = await supabase
        .from("task_tb")
        .select("*");
      // ตรวจสอบ error และกำหนดค่าให้กับ state tasks
      if (fetchError) {
        console.log(fetchError?.message);
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถดึงข้อมูลได้ กรุณาตรวจสอบ หรือลองใหม่อีกครั้ง",
          icon: "error",
          confirmButtonText: "ตกลง",
        });

        return;
      }
      setTasks(data || []);
    };
    fetchTasks(); // เรียกใช้ฟังก์ชันดึงข้อมูล
  }, []);

  return (
    <div className="w-full">
      {/* แสดงชื่อแอป */}
      <div className="text-center mt-20">
        <AppName />
      </div>
      {/* แสดงรูป logo ของแอป */}
      <Image
        src="https://xeqtggywsdyrqsmxkatb.supabase.co/storage/v1/object/public/task_tb/task_logo.png"
        alt="logo"
        width={200}
        height={200}
        className="mx-auto mt-10"
      />
      {/* ปุ่มเปิดไปหน้า /addtask */}
      <div className="w-4/5 text-end mt-10 mr-50">
        <Link
          href="/addtask"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
        >
          เพิ่ม TASK
        </Link>
      </div>

      {/* แสดงข้อมูลงานทั้งหมดที่ดึงมาจาก supabase */}
      <table className="w-4/5 mt-10 mx-auto border border-gray-500 bg-gray-200">
        <thead>
          <tr>
            <th className="border border-gray-500 px-4 py-2">รูปงาน</th>
            <th className="border border-gray-500 px-4 py-2">ชื่องาน</th>
            <th className="border border-gray-500 px-4 py-2">รายละเอียดงาน</th>
            <th className="border border-gray-500 px-4 py-2">สถานะงาน</th>
            <th className="border border-gray-500 px-4 py-2">ลบ/แก้ไข</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <th className="border border-gray-500"></th>
              <th className="border border-gray-500">{task.title}</th>
              <th className="border border-gray-500">{task.detail}</th>
              <th className="border border-gray-500">{task.is_completed ? "เสร็จแล้ว" : "ยังไม่เสร็จ"}</th>
              <th className="border border-gray-500">ลบ/แก้ไข</th>
            </tr>
          ))}
        </tbody>
      </table>
      {/* แสดง Footer */}
      <Footer />
    </div>
  );
}
