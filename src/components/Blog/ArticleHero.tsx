import Image from 'next/image'; // Import next/image

interface ArticleHeroProps {
  title: string;
  imageUrl: string;
}

export function ArticleHero({ title, imageUrl }: ArticleHeroProps) {
  return (
    <header className="relative h-72 md:h-96 lg:h-[400px] w-full overflow-hidden">
      <Image
        src={imageUrl}
        alt={title}
        fill // Use fill to cover the parent relative container
        className="object-cover transition-transform duration-700 hover:scale-105"
        // loading="eager" // next/image handles loading optimization, eager might be default for above-the-fold
        priority // Mark as priority as it's likely LCP
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="relative z-10 flex items-end h-full container mx-auto px-6 pb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white max-w-3xl leading-tight drop-shadow-lg">
          {title}
        </h1>
      </div>
    </header>
  );
} 