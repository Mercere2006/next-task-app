import AppName from "@/components/AppName";
import Footer from "@/components/Footer";
import Image from "next/image";

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
      {/* การป้อน secure code เพื่อเข้าใช้งานแอป */}
      <input
        type="text"
        placeholder="Enter secure code"
        className="w-100 mx-auto mt-10 p-2 border rounded border-gray-400 flex"
      />
      {/* ปุ่มเข้าใช้งานแอป */}
      <button className="w-100 mx-auto mt-5 p-2 bg-blue-600 text-white rounded flex hover:bg-blue-700 mb-10">
        <span className="mx-auto">เข้าใช้งาน</span>
      </button>
      {/* Footer */}
      <Footer />
    </div>
  );
}
