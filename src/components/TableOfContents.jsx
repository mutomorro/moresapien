import { useState, useEffect, useRef } from 'react';

/**
 * TableOfContents - sticky sidebar nav with scroll-spy.
 *
 * Props:
 *   headings - array of { slug, text } from Markdown H2s
 *   fixedSections - array of { slug, text } for the template-level sections
 *   accentColor - the category accent colour (CSS value)
 */
export default function TableOfContents({ headings = [], fixedSections = [], accentColor = 'var(--page-accent)' }) {
  const [activeId, setActiveId] = useState('');
  const observerRef = useRef(null);

  useEffect(() => {
    const allIds = [
      ...headings.map((h) => h.slug),
      ...fixedSections.map((s) => s.slug),
    ];

    const handleIntersect = (entries) => {
      // Find the topmost visible heading
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible.length > 0) {
        setActiveId(visible[0].target.id);
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0,
    });

    // Small delay so the DOM has rendered all headings
    const timer = setTimeout(() => {
      allIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observerRef.current.observe(el);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [headings, fixedSections]);

  if (headings.length === 0 && fixedSections.length === 0) return null;

  const handleClick = (e, slug) => {
    e.preventDefault();
    const el = document.getElementById(slug);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
      // Update URL hash without jumping
      history.replaceState(null, '', '#' + slug);
      setActiveId(slug);
    }
  };

  return (
    <nav className="toc" aria-label="On this page">
      <p className="toc-label">On this page</p>
      <ol className="toc-list">
        {headings.map((h) => (
          <li
            key={h.slug}
            className={'toc-item' + (activeId === h.slug ? ' toc-item--active' : '')}
            style={activeId === h.slug ? { borderLeftColor: accentColor } : undefined}
          >
            <a
              href={'#' + h.slug}
              onClick={(e) => handleClick(e, h.slug)}
              className="toc-link"
              style={activeId === h.slug ? { color: accentColor, fontWeight: 500 } : undefined}
            >
              {h.text}
            </a>
          </li>
        ))}

        {fixedSections.length > 0 && (
          <>
            <li className="toc-divider" aria-hidden="true" />
            {fixedSections.map((s) => (
              <li
                key={s.slug}
                className={'toc-item toc-item--fixed' + (activeId === s.slug ? ' toc-item--active' : '')}
                style={activeId === s.slug ? { borderLeftColor: accentColor } : undefined}
              >
                <a
                  href={'#' + s.slug}
                  onClick={(e) => handleClick(e, s.slug)}
                  className="toc-link toc-link--fixed"
                  style={activeId === s.slug ? { color: accentColor, fontWeight: 500 } : undefined}
                >
                  {s.text}
                </a>
              </li>
            ))}
          </>
        )}
      </ol>
    </nav>
  );
}
