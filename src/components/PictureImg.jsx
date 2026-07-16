export default function PictureImg({ src, alt, className, loading, fallback }) {
  const encode = (s) => s.replace(/ /g, '%20')
  const webpSrc = encode(src.replace(/\.(png|jpg|jpeg)$/i, '.webp'))
  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img src={encode(fallback || src)} alt={alt} className={className} loading={loading} />
    </picture>
  )
}
