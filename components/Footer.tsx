import { site } from "@/site.config";

export function Footer() {
  return (
    <footer className="roadFooter">
      <svg viewBox="0 0 300 40" aria-hidden="true">
        <path d="M0 22 q12 -10 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0" />
      </svg>
      <div className="hand rfNames">
        {site.names.first} <span>&amp;</span> {site.names.second}
      </div>
      <div className="rfLine">{site.text.footer}</div>
    </footer>
  );
}
