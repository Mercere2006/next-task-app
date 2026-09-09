import React from "react";
import dev from "@/assets/images/dev.png";
import Image from "next/image";

export default function Footer() {
  return (
    <div>
      <hr />
      <p className="text-center text-gray-500 text-sm mt-10 mb-5 mx-auto">
        Copyright &copy; 2026 by Mercere. All rights reserved.
        <br />
        <Image 
            src={dev} 
            alt="dev" 
            width={20} 
            height={20}
            className="mx-auto mt-3"
        />
      </p>
    </div>
  );
}
