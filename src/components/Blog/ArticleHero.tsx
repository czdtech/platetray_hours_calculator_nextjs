import Image, { type StaticImageData } from "next/image";

interface ArticleHeroProps {
  title: string;
  imageUrl: string | StaticImageData;
}

export function ArticleHero({ title, imageUrl }: ArticleHeroProps) {
  return (
    <header className="relative h-72 md:h-96 lg:h-[400px] w-full overflow-hidden">
      <Image
        src={imageUrl}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 1200px"
        placeholder="blur"
        className="object-cover transition-transform duration-700 hover:scale-105"
        priority
        quality={85}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="relative z-10 flex items-end h-full container mx-auto px-6 pb-16">
        {/* 降低底部内边距，为内容区域重叠留出空间 */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white max-w-3xl leading-tight drop-shadow-lg">
          {title}
        </h1>
      </div>
    </header>
  );
}
