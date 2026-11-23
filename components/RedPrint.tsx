/**
 * A photo printed in one red ink on paper, with rough hand-printed edges.
 * Pass `warm` to show the photo in its real colours (used on "hold").
 */
export function RedPrint({
  src,
  alt,
  warm = false,
  className = "",
  loading,
}: {
  src: string;
  alt: string;
  warm?: boolean;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  return (
    <div className={`print ${warm ? "warm" : ""} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="printMono" src={src} alt={alt} draggable={false} loading={loading} />
      <div className="printRed" aria-hidden="true" />
      <div className="printPaper" aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="printColor" src={src} alt="" aria-hidden="true" draggable={false} loading={loading} />
    </div>
  );
}
