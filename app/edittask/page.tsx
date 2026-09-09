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
      {/* ส่วนของการป้อน-เลือกข้อมูลเพื่อบันทึก */}
      <div className="w-200 mx-auto border border-gray-500 mt-10 px-20 py-10 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center ">เพิ่มข้อมูลงาน</h1>
        <h3 className="mb-2 mt-5">ป้อนหัวข้องาน :</h3>
        <input type="text" className="border border-gray-500 rounded-md p-2 w-full bg-blue-100"></input>
        <h3 className="mb-2 mt-5">ป้อนรายละเอียดงาน :</h3>
        <textarea rows={5} className="border border-gray-500 rounded-md p-2 w-full bg-blue-100"></textarea>
        <h3 className="mb-2 mt-5">เลือกรูป :</h3>
        <input type="file" id="selectImageFile" className="hidden" accept="image/*"></input>
        <label htmlFor="selectImageFile" className="border border-gray-500 rounded-md p-2 w-full bg-blue-100 hover:bg-blue-500 cursor-pointer">
          คลิกเพื่อเลือกรูปภาพ
        </label>

        <h3 className="mt-5 mb-2">สถานะงาน :</h3>
        <select className="border border-gray-500 rounded-md p-2 w-full bg-blue-100">
          <option value="1">✅ เสร็จ</option>
          <option value="0" selected>❎ ยังไม่เสร็จ</option>
        </select>

        <button className="block w-full mt-10 bg-blue-500 hover:bg-blue-700 text-white py-2 rounded-md cursor-pointer">
          บันทึกเพิ่มข้อมูลงาน
        </button>

        <button className="block w-full mt-4 bg-red-500 hover:bg-red-800 text-white py-2 rounded-md cursor-pointer">
          รีเซ็ตข้อมูล
        </button>
      </div>
      {/* ลิงก์กลับไปหน้า /hometask */}
      <Link href="/hometask" className="block text-center mt-10 text-gray-800 mb-10">
        [กลับไปหน้าหลัก]
      </Link>
      <Footer />
    </div>
  );
}
