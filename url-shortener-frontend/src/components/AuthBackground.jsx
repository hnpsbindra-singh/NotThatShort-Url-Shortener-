/**
 * AuthBackground
 * Renders bold, giant background watermark typography for all auth pages.
 * Fully non-interactive (pointer-events: none, user-select: none) and responsive.
 */
export default function AuthBackground() {
  return (
    <div className="auth-bg-watermark" aria-hidden="true">
      <span className="auth-bg-line auth-bg-line-stroke">
        NOT THAT SHORT
      </span>
      <span className="auth-bg-line auth-bg-line-solid">
        NOT THAT SHORT
      </span>
      <span className="auth-bg-line auth-bg-line-accent">
        NOT THAT SHORT
      </span>
      <span className="auth-bg-line auth-bg-line-stroke">
        NOT THAT SHORT
      </span>
    </div>
  );
}
