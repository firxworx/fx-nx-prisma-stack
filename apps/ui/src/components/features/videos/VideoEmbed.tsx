export interface VideoEmbedProps {
  src: string
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({ src }) => {
  return (
    <div className="aspect-w-16 aspect-h-9">
      <iframe
        src={src} // e.g. "https://www.youtube.com/embed/5W5UIYTHb5E"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  )
}
