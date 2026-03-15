"use client";

import Image from "next/image";
import { useState } from "react";

export default function ImageModal({
    src,
    alt,
}: {
    src: string;
    alt?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);

    if (!src) {
        return null;
    }

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    return (
        <>
            {/* Thumbnail or original image */}
            <div onClick={openModal} className="cursor-zoom-in w-full h-full">
                <Image
                    src={src}
                    alt={alt || ""}
                    width={800}
                    height={800}
                    className="w-full h-full object-contain rounded"
                />
            </div>

            {/* Modal overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 z-50 bg-background text-text-primary rounded-full px-3 py-1 text-sm font-semibold shadow hover:bg-gray-100"
                    >
                        ✕
                    </button>
                    <Image
                        src={src}
                        alt={alt || ""}
                        width={1000}
                        height={1000}
                        className="w-auto h-auto max-w-full max-h-full object-contain rounded"
                    />
                </div>
            )}
        </>
    );
}
