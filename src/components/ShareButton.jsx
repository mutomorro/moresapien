import { useState } from 'react';

// ──────────────────────────────────────────────
// Category colours (matching the main site design)
// ──────────────────────────────────────────────
const categoryColours = {
  'Cognitive Bias': '#c17f59',
  'Logical Fallacy': '#7b8a6e',
  'Mental Model': '#5b7a8a',
  'Political Theory': '#8a6e7b',
  'Rhetorical Device': '#6e7b8a',
  'Systems Thinking': '#7a8a5b',
};

export default function ShareButton({ title, oneLiner, url, category }) {
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = `${title}: ${oneLiner}`;
  const fullShareText = `${shareText}\n\n${url}`;
  const accentColour = categoryColours[category] || '#c17f59';

  const shareTargets = [
    {
      name: 'Bluesky',
      icon: (
        <svg viewBox="0 0 568 501" width="18" height="18" fill="currentColor">
          <path d="M123.121 33.664C188.241 82.553 258.281 181.68 284 234.873c25.719-53.192 95.759-152.32 160.879-201.21C491.866-1.611 568-28.906 568 57.947c0 17.346-9.945 145.713-15.778 166.555-20.275 72.453-94.155 90.933-159.875 79.748C507.222 323.8 536.444 388.56 473.333 453.32c-119.86 122.992-172.272-30.859-185.702-70.281-2.462-7.227-3.614-10.608-3.631-7.733-.017-2.875-1.169.506-3.631 7.733-13.43 39.422-65.842 193.273-185.702 70.28-63.111-64.76-33.89-129.52 80.986-149.07-65.72 11.185-139.6-7.295-159.875-79.748C9.945 203.659 0 75.291 0 57.946 0-28.906 76.135-1.612 123.121 33.664Z" />
        </svg>
      ),
      href: `https://bsky.app/intent/compose?text=${encodeURIComponent(fullShareText)}`,
      primary: true,
    },
    {
      name: 'X',
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
      primary: false,
    },
    {
      name: 'Facebook',
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      primary: false,
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="share-container" style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setShowOptions(!showOptions)}
        aria-label="Share this concept"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 1.25rem',
          background: 'transparent',
          border: `1.5px solid ${accentColour}`,
          borderRadius: '2rem',
          color: accentColour,
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 600,
          fontSize: '0.9rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = accentColour;
          e.currentTarget.style.color = '#faf8f5';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = accentColour;
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share
      </button>

      {showOptions && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 0.75rem)',
            left: '0',
            background: '#faf8f5',
            border: '1px solid #e8e0d8',
            borderRadius: '1rem',
            padding: '0.75rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            zIndex: 10,
            animation: 'fadeInUp 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {/* Bluesky -- prominent */}
          <a
            href={shareTargets[0].href}
            target="_blank"
            rel="noopener noreferrer"
            title="Share on Bluesky"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.875rem',
              background: '#0085ff',
              color: '#fff',
              borderRadius: '1.5rem',
              textDecoration: 'none',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 600,
              fontSize: '0.8rem',
              transition: 'opacity 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {shareTargets[0].icon}
            Bluesky
          </a>

          {/* Divider */}
          <div style={{ width: '1px', height: '1.5rem', background: '#e8e0d8' }} />

          {/* X and Facebook -- smaller, icon-only */}
          {shareTargets.slice(1).map((target) => (
            <a
              key={target.name}
              href={target.href}
              target="_blank"
              rel="noopener noreferrer"
              title={`Share on ${target.name}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2.25rem',
                height: '2.25rem',
                background: 'transparent',
                color: '#8a7f72',
                borderRadius: '50%',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0ebe4';
                e.currentTarget.style.color = '#5a524a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#8a7f72';
              }}
            >
              {target.icon}
            </a>
          ))}

          {/* Divider */}
          <div style={{ width: '1px', height: '1.5rem', background: '#e8e0d8' }} />

          {/* Copy link */}
          <button
            onClick={handleCopyLink}
            title="Copy link"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2.25rem',
              height: '2.25rem',
              background: 'transparent',
              border: 'none',
              color: copied ? '#7b8a6e' : '#8a7f72',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f0ebe4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {copied ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            )}
          </button>

          {/* Little arrow pointing down */}
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '2rem',
              transform: 'rotate(45deg)',
              width: '12px',
              height: '12px',
              background: '#faf8f5',
              borderRight: '1px solid #e8e0d8',
              borderBottom: '1px solid #e8e0d8',
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}