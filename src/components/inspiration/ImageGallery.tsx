"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";

interface InspirationImage {
  id: number;
  src: string;
  prompt: string;
  height: number;
}

interface ImageGalleryProps {
  onPromptSelect: (prompt: string) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ onPromptSelect }) => {
  const [columns, setColumns] = useState(4);

  // 本地图片数据 - 不同高度创造瀑布流效果
  const images: InspirationImage[] = [
    {
      id: 1,
      src: "/inspiration/image-1.jpg",
      prompt:
        "A barefoot figure wearing a white long windbreaker stands alone on a peaceful beach, looking down at the glowing 'artificial moon' on the beach. The background is a blue sky and waves at night, and the main colors of the picture are deep blue and moon white. The composition is simple with a large amount of white space, creating a poetic, lonely, and dreamy atmosphere. The style blends photography poetics with surrealist visual language, creating a modern fable like sense of tranquility. The ratio is 9:16",
      height: 500,
    },
    {
      id: 2,
      src: "/inspiration/image-2.jpg",
      prompt:
        "Portrait photography style, girl next door, daytime urban street scene background, close-up of face, turning head, Canon film color series, khaki sweater, shawl long hair, sunlight shining on the left side of the hair with delicate and realistic light, ratio of 2:3",
      height: 600,
    },
    {
      id: 3,
      src: "/inspiration/image-3.jpg",
      prompt:
        "A woman wearing a deep red retro dress stands on a green field grass, holding up a huge red paper airplane. The grass is adorned with red poppies, and the background is a gray and white cloudy sky. The composition is highly dynamic and symbolic, with a fusion of conceptual fashion and visual poetry. The color contrast is strong, expressing themes of flight, dreams, and freedom, and has a surreal and cinematic texture. The ratio is 9:16",
      height: 520,
    },
    {
      id: 4,
      src: "/inspiration/image-4.jpg",
      prompt:
        "The style of 'portrait photography' is a black and white portrait of a woman, subtly using light and shadow. It was taken by photographer Rogerio Reis using a Leica M11 for close-up photography at a scale of '2:3'",
      height: 400,
    },
    {
      id: 5,
      src: "/inspiration/image-5.jpg",
      prompt:
        "Can you help me generate a picture: Rock Color Plate Painting, Luo Yang, Mark Roscoe, Turner, a quiet figure with contrasting colors, architectural reflection, Oriental beauty, minimalism, white space, artistic conception, color curves, ancient charm with white space, scale '9:16'",
      height: 350,
    },
    {
      id: 6,
      src: "/inspiration/image-6.jpg",
      prompt:
        "The image style is ukiyo-e illustration, poster, a girl and a cat playing a game, with a scale of 9:16",
      height: 480,
    },
    {
      id: 7,
      src: "/inspiration/image-7.jpg",
      prompt:
        "Anime style, a man in a white shirt and a dog looking at the clouds, ultra wide angle, shot from a distance, with a ratio of 2:3",
      height: 420,
    },
    {
      id: 8,
      src: "/inspiration/image-8.jpg",
      prompt:
        "The image style is an 80s animated illustration, with a woman wearing a black trench coat, rain, profile, neon sign, high contrast shadows, ultra-high details, close-up of the face, in a ratio of 2:3",
      height: 500,
    },
    {
      id: 9,
      src: "/inspiration/image-9.jpg",
      prompt:
        "The image style is '3D rendering', with a girl in a double ponytail lounging on the sofa, watching a movie, wearing a large black outfit, with area lighting, and a ratio of '2:3'",
      height: 450,
    },
    {
      id: 10,
      src: "/inspiration/image-10.jpg",
      prompt:
        "The image style is '3D rendering' felt art, featuring a cute cat, blue beige clothes, and ultra-high definition picture quality",
      height: 480,
    },
    {
      id: 11,
      src: "/inspiration/image-11.jpg",
      prompt:
        "Vintage style hand-held flowers, warm colored flowers paired with dried flowers, exude a classical charm. Classic and romantic elements coexist at weddings, with textured walls as the main background and warm candlelight as the backdrop, in a ratio of 2:3",
      height: 360,
    },
    {
      id: 12,
      src: "/inspiration/image-12.jpg",
      prompt:
        "The white bottle next to the magazine on the table has a simple and pure design, with a warm winter style. The surrounding plants and foreground plants fade, and the contrasting light is eye-catching. The scene style is full of light, full of brightness, tranquility, Japanese photography, sun drying masters, and formalist aesthetics, with a ratio of '2:3'",
      height: 500,
    },
  ];

  // 响应式列数设置
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 640) {
        setColumns(2); // 手机
      } else if (window.innerWidth < 1024) {
        setColumns(3); // 平板
      } else {
        setColumns(4); // 桌面
      }
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  // 获取当前列高度数组
  const getColumnHeights = () => {
    return Array.from({ length: columns }, () => 0);
  };

  // 分配图片到列的算法
  const distributeImages = () => {
    const columnHeights = getColumnHeights();
    const columnImages: InspirationImage[][] = Array.from(
      { length: columns },
      () => []
    );

    images.forEach((image) => {
      const shortestColumnIndex = columnHeights.indexOf(
        Math.min(...columnHeights)
      );
      columnImages[shortestColumnIndex].push(image);
      columnHeights[shortestColumnIndex] += image.height + 24; // 24px为gap
    });

    return columnImages;
  };

  const distributedImages = distributeImages();

  // 处理图片点击 - 直接应用prompt
  const handleImageClick = (prompt: string) => {
    onPromptSelect(prompt);
  };

  return (
    <div className="w-full">
      {/* 标题和描述 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-black mb-4 font-sans">
          Get Inspired
        </h2>
        <p className="text-gray-600 text-lg font-serif">
          Hover over images to view prompts and click to apply them to your
          generation
        </p>
      </div>

      {/* 瀑布流布局 */}
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
      >
        {distributedImages.map((columnImages, columnIndex) => (
          <div key={columnIndex} className="flex flex-col gap-6">
            {columnImages.map((image) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
                onClick={() => handleImageClick(image.prompt)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src}
                  alt={`Inspiration ${image.id}`}
                  className="w-full object-cover transition-transform duration-300"
                  style={{ height: `${image.height}px` }}
                />

                {/* 悬停覆盖层 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white text-sm font-medium leading-relaxed line-clamp-3 mb-2">
                      {image.prompt}
                    </p>
                    <div className="text-white/80 text-xs">
                      Click to use this prompt
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
