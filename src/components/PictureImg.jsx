export default function PictureImg({ src, alt, className, loading, fallback }) {
  const webpSrc = src.replace(/\.(png|jpg|jpeg)$/i, '.webp')
  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img src={fallback || src} alt={alt} className={className} loading={loading} />
    </picture>
  )
}
