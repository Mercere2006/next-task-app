"use client";

import AppName from "@/components/AppName";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  // สร้าง state สำหรับเก็บข้อมูลที่ป้อน-เลือก
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // ฟังก์ชันเลือกรูป+preview
  const handleSelectedImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setImageFile(file); // กำหนดหนดค่าให้กับ imageFile เพื่อใช้อัปโหลดไปยัง supabase
      setImagePreview(URL.createObjectURL(file)); // กำหนดค่าให้กับ imagePreview เพื่อแสดงภาพ preview
    }
  };

  // ฟังก์ชันรีเซ็ตข้อมูล
  const handleResetData = () => {
    // เคลีย state ให้เป็นดังค่าเริ่มต้น
    setTitle("");
    setDetail("");
    setIsCompleted(false);
    setImageFile(null);
    setImagePreview(null);
  };

  // ฟังก์ชันบันทึกข้อมูล
  const handleSaveData = async () => {
    // Validate UI -------
    if (title === "" || detail === "" || imageFile === null) {
      Swal.fire({
        title: "คำเตือน",
        text: "กรุณากรอกข้อมูลให้ครบ และเลือกรูปด้วย",
        icon: "warning",
        confirmButtonText: "ตกลง",
      });

      return;
    }

    // Upload Image to Supabase Storage and get Image URL from Bucket -------
    // เปลี่ยนชื่อรูป
    const newFileName = `dtisau_${Date.now()}_${imageFile?.name}`;
    // อัปโหลดไฟล์รูป
    const { error: uploadError } = await supabase.storage
      .from("task_bk")
      .upload(newFileName, imageFile);
    // ตรวจสอบการอัปโหลด
    if (uploadError) {
      console.log(uploadError?.message);
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถอัปโหลดรูปได้ กรุณาตรวจสอบ หรือลองใหม่อีกครั้ง",
        icon: "error",
        confirmButtonText: "ตกลง",
      });

      return;
    }
    // เอาที่อยู่ของรูป (get image url) มาใส่ในตัวแปรเพื่อบันทึกลงตาราง
    const { data } = supabase.storage.from("task_bk").getPublicUrl(newFileName);
    const image_url = data.publicUrl;

    // Save Data to Supabase Database ------
    const { error: saveError } = await supabase.from("task_tb").insert({
      //ชื่อคอลัมน์: ค่าที่จะบันทึกเก็บ
      title: title,
      detail: detail,
      is_completed: isCompleted,
      image_url: image_url,
    });

    // ตรวจสอบการบันทึก
    if (saveError) {
      console.log(saveError?.message);
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกข้อมูลได้ กรุณาตรวจสอบ หรือลองใหม่อีกครั้ง",
        icon: "error",
        confirmButtonText: "ตกลง",
      });

      return;
    }

    // ตรวจสอบแล้วไม่มีข้อผิดพลาด แสดงข้อความแจ้ง และ redirect กลับไปหน้า /hometask
    await Swal.fire({
      title: "ผลการทำงาน",
      text: "บันทึกข้อมูลเรียบร้อยแล้ว",
      icon: "success",
      confirmButtonText: "ตกลง",
    });

    router.back(); // กลับไปหน้าก่อนหน้า
  };

  return (
    <div className="w-full">
      {/* แสดงชื่อแอปฯ  */}
      <div className="text-center mt-20">
        <AppName />
      </div>
      {/* แสดงรูป logo ของแอปฯ */}
      <Image
        src="https://xeqtggywsdyrqsmxkatb.supabase.co/storage/v1/object/public/task_bk/task_logo.png"
        alt="logo"
        width={100}
        height={100}
        className="mx-auto mt-10"
      />
      {/* ส่วนของการป้อน-เลือกข้อมูลเพื่อบันทึก */}
      <div className="w-200 mt-10 mx-auto border border-gray-400 rounded-xl px-20 py-10">
        <h1 className="text-center text-2xl font-bold">เพิ่มข้อมูลงาน</h1>

        <h3 className="mt-5 mb-2">ป้อนหัวข้องาน:</h3>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border rounded-md p-2 w-full bg-amber-50"
        />

        <h3 className="mt-5 mb-2">ป้อนรายละเอียดงาน:</h3>
        <textarea
          rows={5}
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          className="w-full border rounded-md p-2 bg-amber-50"
        ></textarea>

        <h3 className="mt-5 mb-2">เลือกรูป:</h3>
        <input
          type="file"
          id="selectImageFile"
          onChange={handleSelectedImage}
          className="hidden"
          accept="image/*"
        />
        <label
          htmlFor="selectImageFile"
          className="border rounded-md p-2 w-full bg-green-50
                                                      hover:bg-green-400 cursor-pointer"
        >
          คลิกเพื่อเลือกรูป
        </label>
        {/* -- ส่วนของ Image Preview --*/}
        {imagePreview && (
          <div className="mt-5">
            <Image src={imagePreview} alt="preview" width={120} height={120} />
          </div>
        )}
        {/* --------------------------- */}

        <h3 className="mt-5 mb-2">สถานะงาน:</h3>
        <select
          value={isCompleted == true ? "1" : "0"}
          onChange={(e) => setIsCompleted(e.target.value == "1")}
          className="border rounded-md p-2 w-full bg-amber-50"
        >
          <option value="1">✅ เสร็จ</option>
          <option value="0">❌ ยังไม่เสร็จ</option>
        </select>

        <button
          onClick={handleSaveData}
          className="block w-full mt-10 bg-blue-500 p-2 rounded-md text-white
                               hover:bg-blue-800 cursor-pointer"
        >
          บันทึกเพิ่มข้อมูลงาน
        </button>
        <button
          onClick={handleResetData}
          className="block w-full mt-3 bg-orange-500 p-2 rounded-md text-white
                               hover:bg-orange-800 cursor-pointer"
        >
          รีเซ็ตข้อมูล
        </button>
      </div>
      {/* ลิงค์กลับไปหน้า /hometask */}
      <Link
        href="/hometask"
        className="block w-full mt-10  text-gray-800 text-center"
      >
        [ กลับไปหน้าแรก ]
      </Link>
      {/* แสดง footer ของแอปฯ */}
      <Footer />
    </div>
  );
}
