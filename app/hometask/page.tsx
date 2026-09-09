import Image from "next/image";
import AppName from "@/components/AppName";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Page() {
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
        <Link href="/addtask" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded">
          เพิ่ม TASK
        </Link>
      </div>
    </div>
  );
}
