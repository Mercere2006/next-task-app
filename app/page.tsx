"use client";
import AppName from "@/components/AppName";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function Page() {
  // สร้าง state สำหรับค่าจาก input ของ secure code
  const [secureCode, setSecureCode] = useState("");

  // สร้าง router สำหรับการนำทางไปยังหน้าอื่น
  const router = useRouter();

  // ฟังก์ชันสำหรับตรวจสอบ secure code และนำผู้ใช้ไปยังหน้า HomeTask
  const handleAccessTask = () => {
    if (secureCode === '') {
      Swal.fire({
        icon: 'warning',
        title: 'คำเตือน',
        text: 'กรุณากรอก secure code',
      });

      return;
    }

    // Check secure code
    if (secureCode.toLocaleLowerCase() === 'dtisau') {
      // เปิดไปหน้า /homeTask
      // push() เปิดไปแล้วย้อนกลับได้ , replace() เปิดไปแล้วย้อนกลับไม่ได้
      router.push('/hometask');
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'ผิดพลาด',
        // text: 'กรุณากรอกรหัสผ่านให้ถูกต้อง',
        html: `<strong><u style="color:red">รหัสผ่านไม่ถูกต้อง</u></strong><br>กรุณากรอกรหัสผ่านให้ถูกต้อง`,
      });
    }
  }
  
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
      {/* การป้อน secure code เพื่อเข้าใช้งานแอป */}
      <input
        type="text"
        placeholder="Enter secure code"
        className="w-100 mx-auto mt-10 p-2 border rounded border-gray-400 flex"
        value={secureCode}
        onChange={(e) => setSecureCode(e.target.value)}
      />
      {/* ปุ่มเข้าใช้งานแอป */}
      <button className="w-100 mx-auto mt-5 p-2 bg-blue-600 text-white rounded flex hover:bg-blue-700 mb-10"
        onClick={handleAccessTask}
        >
        <span className="mx-auto">เข้าใช้งาน</span>
      </button>
      {/* Footer */}
      <Footer />
    </div>
  );
}
