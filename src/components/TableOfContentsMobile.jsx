import { useState } from 'react';

/**
 * TableOfContentsMobile - collapsible "On this page" for mobile.
 * Only visible below 960px (controlled by CSS in the page template).
 *
 * Props:
 *   headings - array of { slug, text } from Markdown H2s
 *   fixedSections - array of { slug, text } for template-level sections
 *   accentColor - the category accent colour (CSS value)
 */
export default function TableOfContentsMobile({ headings = [], fixedSections = [], accentColor = 'var(--page-accent)' }) {
  const [open, setOpen] = useState(false);

  if (headings.length === 0 && fixedSections.length === 0) return null;

  const handleClick = (e, slug) => {
    e.preventDefault();
    const el = document.getElementById(slug);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
      history.replaceState(null, '', '#' + slug);
      setOpen(false);
    }
  };

  return (
    <nav className="toc-mobile" aria-label="On this page">
      <button
        className="toc-mobile-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{ borderColor: open ? accentColor : undefined }}
      >
        <span className="toc-mobile-toggle-label">On this page</span>
        <svg
          className={'toc-mobile-chevron' + (open ? ' toc-mobile-chevron--open' : '')}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="4 6 8 10 12 6" />
        </svg>
      </button>

      {open && (
        <ol className="toc-mobile-list">
          {headings.map((h) => (
            <li key={h.slug} className="toc-mobile-item">
              <a
                href={'#' + h.slug}
                onClick={(e) => handleClick(e, h.slug)}
                className="toc-mobile-link"
              >
                {h.text}
              </a>
            </li>
          ))}
          {fixedSections.length > 0 && (
            <>
              <li className="toc-mobile-divider" aria-hidden="true" />
              {fixedSections.map((s) => (
                <li key={s.slug} className="toc-mobile-item">
                  <a
                    href={'#' + s.slug}
                    onClick={(e) => handleClick(e, s.slug)}
                    className="toc-mobile-link toc-mobile-link--fixed"
                  >
                    {s.text}
                  </a>
                </li>
              ))}
            </>
          )}
        </ol>
      )}
    </nav>
  );
}
