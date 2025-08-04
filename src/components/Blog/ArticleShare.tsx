"use client";

interface ArticleShareProps {
  title: string;
  url: string;
}

/**
 * 文章分享按钮组
 */
export function ArticleShare({ title, url }: ArticleShareProps) {
  // 对URL编码处理
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  // 处理分享点击
  const handleShare = (platform: string) => {
    const windowFeatures = 'width=600,height=400,scrollbars=yes,resizable=yes,toolbar=no,menubar=no';
    
    switch (platform) {
      case 'twitter':
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        window.open(twitterUrl, '_blank', windowFeatures);
        break;
        
      case 'facebook':
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        window.open(facebookUrl, '_blank', windowFeatures);
        break;
        
      case 'whatsapp':
        const whatsappUrl = `https://wa.me/?text=${encodedTitle} ${encodedUrl}`;
        window.open(whatsappUrl, '_blank', windowFeatures);
        break;
        
      case 'telegram':
        const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        window.open(telegramUrl, '_blank', windowFeatures);
        break;
        
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          // 创建一个临时的成功提示
          const button = document.querySelector('[aria-label="Copy link"]') as HTMLElement;
          if (button) {
            const originalText = button.getAttribute('aria-label');
            button.setAttribute('aria-label', 'Link copied!');
            button.style.color = '#10b981'; // green color
            setTimeout(() => {
              button.setAttribute('aria-label', originalText || 'Copy link');
              button.style.color = '';
            }, 2000);
          }
        }).catch(() => {
          alert('无法复制链接，请手动复制地址栏中的URL');
        });
        break;
    }
  };

  return (
    <aside className="my-8">
      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-4 sm:mb-0">
            Share this article:
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => handleShare('twitter')}
              className="text-gray-500 hover:text-blue-500 transition-colors duration-200 transform hover:scale-110"
              aria-label="Share on Twitter"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.016 10.016 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z" />
              </svg>
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="text-gray-500 hover:text-blue-600 transition-colors duration-200 transform hover:scale-110"
              aria-label="Share on Facebook"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="text-gray-500 hover:text-green-500 transition-colors duration-200 transform hover:scale-110"
              aria-label="Share on WhatsApp"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
              </svg>
            </button>
            <button
              onClick={() => handleShare('telegram')}
              className="text-gray-500 hover:text-blue-400 transition-colors duration-200 transform hover:scale-110"
              aria-label="Share on Telegram"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200 transform hover:scale-110"
              aria-label="Copy link"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
