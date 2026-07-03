"use client";
import { CldUploadWidget } from "next-cloudinary";

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  label?: string;
}

export function ImageUpload({ onUploadSuccess, label = "Postavi sliku" }: ImageUploadProps) {
  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      onSuccess={(result) => {
        const info = result?.info;
        if (info && typeof info === 'object' && 'secure_url' in info) {
          onUploadSuccess(info.secure_url as string);
        }
      }}
      options={{
        maxFiles: 1,
        resourceType: "auto",
      }}
    >
      {({ open }) => (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            open();
          }}
          className="w-full py-3 bg-gray-800 text-white rounded-2xl font-bold hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
        >
          {label}
        </button>
      )}
    </CldUploadWidget>
  );
}