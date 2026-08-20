/**
 * A live thumbnail of a theme: the real route rendered in a scaled-down,
 * non-interactive iframe, wrapped in the same browser frame the design lab
 * uses. Nothing is faked — what you see is the page that ships.
 */
export function ThemePreview({
  path,
  label,
  height = 1180,
}: {
  path: string;
  label: string;
  height?: number;
}) {
  return (
    <div className="design-preview theme-preview">
      <div className="design-preview__chrome">
        <div>
          <span />
          <span />
          <span />
        </div>
        <p>{label}</p>
        <span className="design-preview__live">Live</span>
      </div>

      <div className="theme-preview__viewport">
        <iframe
          src={path}
          title={`${label} preview`}
          loading="lazy"
          tabIndex={-1}
          aria-hidden="true"
          scrolling="no"
          style={{ height: `${height}px` }}
        />
      </div>
    </div>
  );
}
