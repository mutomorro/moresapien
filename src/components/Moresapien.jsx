import { useState, useMemo } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Nunito:wght@300;400;500;600&display=swap');`;

const CATEGORIES = {
  "Cognitive Bias":          { color: "#C4622D", light: "#FDF0E8", dot: "#E8875A" },
  "Logical Fallacy":         { color: "#7A3B69", light: "#F5EDF4", dot: "#B06EA0" },
  "Mental Model":            { color: "#2D6E5E", light: "#E8F4F1", dot: "#4EA898" },
  "Rhetorical Device":       { color: "#5C5200", light: "#F5F2DC", dot: "#A89C3A" },
  "Systems Thinking":        { color: "#1F4B7A", light: "#E8EFF7", dot: "#4A82B8" },
  "Political Theory":        { color: "#5A3728", light: "#F4EDE9", dot: "#9B6452" },
  "Manipulation Tactic":     { color: "#8B2E2E", light: "#F8ECEC", dot: "#C45A5A" },
  "Psychological Phenomenon":{ color: "#5B4399", light: "#F0ECF7", dot: "#8B73C4" },
  "Psychological Defence":   { color: "#2E6B6B", light: "#ECF4F4", dot: "#5A9E9E" },
};

const ConceptIllustration = ({ category, color, size = 48 }) => {
  const c = color;
  const s = size;
  const illustrations = {
    "Cognitive Bias": (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" stroke={c} strokeWidth="1.2" opacity="0.15"/>
        <circle cx="24" cy="24" r="14" stroke={c} strokeWidth="1.2" opacity="0.25"/>
        <circle cx="24" cy="24" r="8"  stroke={c} strokeWidth="1.2" opacity="0.45"/>
        <circle cx="24" cy="24" r="3"  fill={c} opacity="0.7"/>
        <path d="M24 4 Q28 10 24 10" stroke={c} strokeWidth="1.2" fill="none" opacity="0.4" strokeLinecap="round"/>
        <path d="M44 24 Q38 28 38 24" stroke={c} strokeWidth="1.2" fill="none" opacity="0.4" strokeLinecap="round"/>
      </svg>
    ),
    "Logical Fallacy": (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <path d="M24 6 L42 38 L6 38 Z" stroke={c} strokeWidth="1.2" opacity="0.25" strokeLinejoin="round"/>
        <path d="M24 13 L37 35 L11 35 Z" stroke={c} strokeWidth="1.2" opacity="0.45" strokeLinejoin="round"/>
        <line x1="24" y1="20" x2="24" y2="28" stroke={c} strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
        <circle cx="24" cy="31.5" r="1.5" fill={c} opacity="0.8"/>
      </svg>
    ),
    "Mental Model": (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <rect x="8"  y="8"  width="32" height="32" rx="3" stroke={c} strokeWidth="1.2" opacity="0.2"/>
        <rect x="14" y="14" width="20" height="20" rx="2" stroke={c} strokeWidth="1.2" opacity="0.35"/>
        <rect x="20" y="20" width="8"  height="8"  rx="1" fill={c} opacity="0.55"/>
        <path d="M8 16 L8 8 L16 8"  stroke={c} strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M40 32 L40 40 L32 40" stroke={c} strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    "Rhetorical Device": (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <path d="M8 10 Q8 6 12 6 L36 6 Q40 6 40 10 L40 28 Q40 32 36 32 L20 32 L12 40 L14 32 L12 32 Q8 32 8 28 Z"
          stroke={c} strokeWidth="1.2" fill="none" opacity="0.4" strokeLinejoin="round"/>
        <line x1="15" y1="15" x2="33" y2="15" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.65"/>
        <line x1="15" y1="21" x2="33" y2="21" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.65"/>
        <line x1="15" y1="27" x2="25" y2="27" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.65"/>
      </svg>
    ),
    "Systems Thinking": (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="9"  r="4.5" stroke={c} strokeWidth="1.2" opacity="0.6"/>
        <circle cx="10" cy="36" r="4.5" stroke={c} strokeWidth="1.2" opacity="0.6"/>
        <circle cx="38" cy="36" r="4.5" stroke={c} strokeWidth="1.2" opacity="0.6"/>
        <path d="M21 12 L13 32"  stroke={c} strokeWidth="1.2" opacity="0.4" strokeLinecap="round"/>
        <path d="M14 37 L34 37"  stroke={c} strokeWidth="1.2" opacity="0.4" strokeLinecap="round"/>
        <path d="M35 32 L27 12"  stroke={c} strokeWidth="1.2" opacity="0.4" strokeLinecap="round"/>
        <path d="M13 32 L10.5 29.5 M13 32 L15.5 30" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
        <path d="M34 37 L31 34.5 M34 37 L31 39.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
        <path d="M27 12 L29.5 14.5 M27 12 L24.5 14.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    "Political Theory": (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <line x1="24" y1="8" x2="24" y2="40" stroke={c} strokeWidth="1.2" opacity="0.4" strokeLinecap="round"/>
        <line x1="12" y1="40" x2="36" y2="40" stroke={c} strokeWidth="1.5" opacity="0.3" strokeLinecap="round"/>
        <line x1="24" y1="16" x2="10" y2="24" stroke={c} strokeWidth="1.2" opacity="0.55" strokeLinecap="round"/>
        <line x1="24" y1="16" x2="38" y2="20" stroke={c} strokeWidth="1.2" opacity="0.55" strokeLinecap="round"/>
        <path d="M6 24 Q10 20 14 24 Q10 28 6 24 Z" fill={c} opacity="0.45"/>
        <path d="M34 20 Q38 16 42 20 Q38 24 34 20 Z" fill={c} opacity="0.3"/>
        <circle cx="24" cy="14" r="2.5" fill={c} opacity="0.6"/>
      </svg>
    ),
    "Manipulation Tactic": (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="18" r="10" stroke={c} strokeWidth="1.2" opacity="0.3"/>
        <path d="M18 32 L14 42" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <path d="M30 32 L34 42" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <path d="M24 28 L24 38" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <line x1="14" y1="10" x2="34" y2="10" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
        <path d="M14 10 L10 4" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
        <path d="M34 10 L38 4" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
        <circle cx="24" cy="18" r="3" fill={c} opacity="0.6"/>
      </svg>
    ),
    "Psychological Phenomenon": (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="18" stroke={c} strokeWidth="1.2" opacity="0.15"/>
        <path d="M12 24 Q18 14 24 24 Q30 34 36 24" stroke={c} strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round"/>
        <circle cx="24" cy="24" r="4" fill={c} opacity="0.5"/>
        <circle cx="12" cy="24" r="2" fill={c} opacity="0.3"/>
        <circle cx="36" cy="24" r="2" fill={c} opacity="0.3"/>
      </svg>
    ),
    "Psychological Defence": (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <path d="M24 6 L38 14 L38 30 L24 42 L10 30 L10 14 Z" stroke={c} strokeWidth="1.2" opacity="0.25" strokeLinejoin="round"/>
        <path d="M24 12 L33 18 L33 28 L24 36 L15 28 L15 18 Z" stroke={c} strokeWidth="1.2" opacity="0.45" strokeLinejoin="round"/>
        <circle cx="24" cy="24" r="4" fill={c} opacity="0.6"/>
      </svg>
    ),
  };
  return illustrations[category] || (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="16" stroke={c} strokeWidth="1.2" opacity="0.4"/>
      <circle cx="24" cy="24" r="4" fill={c} opacity="0.6"/>
    </svg>
  );
};

export default function Moresapien({ entries = [], collections = [] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const [showAllTags, setShowAllTags] = useState(false);

  const allTags = useMemo(() => {
    const t = new Set();
    entries.forEach(e => e.tags.forEach(tag => t.add(tag)));
    return [...t].sort();
  }, [entries]);

  const topTags = useMemo(() => {
    const counts = {};
    entries.forEach(e => e.tags.forEach(tag => {
      counts[tag] = (counts[tag] || 0) + 1;
    }));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag]) => tag)
      .sort();
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter(e => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        e.title.toLowerCase().includes(q) ||
        e.oneLiner.toLowerCase().includes(q) ||
        e.tags.some(t => t.includes(q));
      const matchCat = !activeCategory || e.category === activeCategory;
      const matchTag = !activeTag || e.tags.includes(activeTag);
      return matchSearch && matchCat && matchTag;
    });
  }, [search, activeCategory, activeTag, entries]);

  // Hide collections when user is actively filtering/searching
  const showCollections = collections.length > 0 && !search && !activeCategory && !activeTag;

  return (
    <>
      <style>{`
        ${FONTS}
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ms {
          min-height: 100vh;
          background: #FAF7F2;
          color: #2C2825;
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
        }

        .ms-controls {
          max-width: 860px;
          margin: 0 auto;
          padding: 2rem 2rem 0.5rem;
        }

        .ms-search-wrap {
          position: relative;
          margin-bottom: 1.25rem;
        }

        .ms-search {
          width: 100%;
          background: #fff;
          border: 1.5px solid #DDD6CC;
          border-radius: 40px;
          padding: 0.8rem 1.25rem 0.8rem 2.75rem;
          font-family: 'Nunito', sans-serif;
          font-size: 0.95rem;
          font-weight: 400;
          color: #2C2825;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .ms-search::placeholder { color: #B0A89E; }

        .ms-search:focus {
          border-color: #C4622D;
          box-shadow: 0 0 0 3px rgba(196,98,45,0.08);
        }

        .ms-search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #B0A89E;
          font-size: 1rem;
          pointer-events: none;
        }

        .ms-filter-label {
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #B0A89E;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .ms-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-bottom: 1rem;
        }

        .ms-pill {
          padding: 0.3rem 0.8rem;
          border-radius: 100px;
          border: 1.5px solid #DDD6CC;
          background: #fff;
          color: #6B6059;
          font-family: 'Nunito', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }

        .ms-pill:hover {
          border-color: #C4C0B8;
          color: #2C2825;
        }

        .ms-pill.active {
          border-color: transparent;
          font-weight: 600;
          color: #fff;
        }

        .ms-show-more {
          border-style: dashed;
          color: #B0A89E;
          font-style: italic;
        }

        .ms-show-more:hover {
          border-style: dashed;
          color: #C4622D;
          border-color: #C4622D;
        }

        .ms-collections {
          margin-top: 0.25rem;
          margin-bottom: 1.25rem;
        }

        .ms-collections-grid {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          padding-bottom: 0.25rem;
          scrollbar-width: thin;
          scrollbar-color: #DDD6CC transparent;
        }

        .ms-collections-grid::-webkit-scrollbar {
          height: 4px;
        }

        .ms-collections-grid::-webkit-scrollbar-track {
          background: transparent;
        }

        .ms-collections-grid::-webkit-scrollbar-thumb {
          background: #DDD6CC;
          border-radius: 4px;
        }

        .ms-collection-card {
          flex: 0 0 auto;
          width: 240px;
          background: #fff;
          border: 1.5px solid #EAE4DA;
          border-radius: 10px;
          padding: 1rem 1.15rem;
          text-decoration: none;
          color: inherit;
          transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          position: relative;
          overflow: hidden;
        }

        .ms-collection-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2.5px;
          border-radius: 10px 10px 0 0;
        }

        .ms-collection-card.pathway::before {
          background: linear-gradient(90deg, #C4622D, #D4A574);
        }

        .ms-collection-card.toolkit::before {
          background: linear-gradient(90deg, #2E6B6B, #5A9E9E);
        }

        .ms-collection-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(44,40,37,0.07);
          border-color: #D4CCC0;
        }

        .ms-collection-type {
          display: inline-block;
          font-size: 0.6rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #fff;
          padding: 0.1rem 0.45rem;
          border-radius: 0.3rem;
          align-self: flex-start;
        }

        .ms-collection-type.pathway { background: #C4622D; }
        .ms-collection-type.toolkit { background: #2E6B6B; }

        .ms-collection-title {
          font-family: 'Lora', serif;
          font-size: 0.95rem;
          font-weight: 600;
          color: #2C2825;
          line-height: 1.3;
        }

        .ms-collection-meta {
          font-size: 0.72rem;
          color: #B0A89E;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-top: auto;
        }

        .ms-results-meta {
          font-size: 0.8rem;
          color: #B0A89E;
          padding-bottom: 1rem;
        }

        .ms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 1rem;
          padding: 1.5rem 2rem 5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .ms-card {
          background: #fff;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1.5px solid #EAE4DA;
          transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          opacity: 0;
          animation: fadeUp 0.35s forwards;
          text-decoration: none;
          color: inherit;
        }

        .ms-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(44,40,37,0.08);
          border-color: #D4CCC0;
        }

        .ms-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .ms-card-svg {
          width: 48px;
          height: 48px;
          margin-bottom: 0.25rem;
        }

        .ms-cat-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .ms-cat-label {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          flex: 1;
        }

        .ms-card-title {
          font-family: 'Lora', serif;
          font-size: 1.2rem;
          font-weight: 600;
          color: #2C2825;
          line-height: 1.25;
        }

        .ms-card-oneliner {
          font-size: 0.875rem;
          color: #6B6059;
          line-height: 1.55;
          font-style: italic;
          font-family: 'Lora', serif;
        }

        .ms-card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          margin-top: auto;
          padding-top: 0.75rem;
          border-top: 1px solid #F0EAE0;
        }

        .ms-tag {
          font-size: 0.7rem;
          color: #B0A89E;
          font-weight: 500;
        }

        .ms-tag::before { content: '#'; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ms-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem 2rem;
          color: #B0A89E;
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 1rem;
        }

        @media (max-width: 640px) {
          .ms-collection-card {
            width: 200px;
          }
        }
      `}</style>

      <div className="ms">

        <div className="ms-controls">
          <div className="ms-search-wrap">
            <span className="ms-search-icon">🔍</span>
            <input
              className="ms-search"
              placeholder="Search for an idea, a feeling, a term..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="ms-filter-label">Browse by type</div>
          <div className="ms-filters">
            {Object.entries(CATEGORIES).map(([cat, c]) => (
              <button
                key={cat}
                className={`ms-pill${activeCategory === cat ? " active" : ""}`}
                style={activeCategory === cat ? { background: c.color } : {}}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="ms-filter-label">Browse by topic</div>
          <div className="ms-filters">
            {(showAllTags ? allTags : topTags).map(tag => (
              <button
                key={tag}
                className={`ms-pill${activeTag === tag ? " active" : ""}`}
                style={activeTag === tag ? { background: "#6B6059" } : {}}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              >
                #{tag}
              </button>
            ))}
            {!showAllTags && allTags.length > topTags.length && (
              <button
                className="ms-pill ms-show-more"
                onClick={() => setShowAllTags(true)}
              >
                + {allTags.length - topTags.length} more topics
              </button>
            )}
            {showAllTags && (
              <button
                className="ms-pill ms-show-more"
                onClick={() => setShowAllTags(false)}
              >
                Show fewer
              </button>
            )}
          </div>

          {showCollections && (
            <div className="ms-collections">
              <div className="ms-filter-label">Collections</div>
              <div className="ms-collections-grid">
                {collections.map((col) => (
                  <a
                    key={col.slug}
                    className={`ms-collection-card ${col.type}`}
                    href={"/collections/" + col.slug}
                  >
                    <span className={`ms-collection-type ${col.type}`}>
                      {col.type === "pathway" ? "Learning pathway" : "Toolkit"}
                    </span>
                    <div className="ms-collection-title">{col.title}</div>
                    <div className="ms-collection-meta">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <rect x="1" y="1" width="14" height="14" rx="2" stroke="#B0A89E" strokeWidth="1.2"/>
                        <path d="M4.5 5h7M4.5 8h7M4.5 11h4" stroke="#B0A89E" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                      <span>{col.entryCount} {col.entryCount === 1 ? "concept" : "concepts"}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="ms-results-meta">
            Showing {filtered.length} of {entries.length} concepts
            {(activeCategory || activeTag || search) && (
              <button
                onClick={() => { setSearch(""); setActiveCategory(null); setActiveTag(null); }}
                style={{ marginLeft: "0.75rem", background: "none", border: "none", color: "#C4622D", cursor: "pointer", fontSize: "0.8rem", fontFamily: "Nunito, sans-serif", fontWeight: 600 }}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="ms-grid">
          {filtered.length === 0 && (
            <div className="ms-empty">Nothing found. Try a different search or clear your filters.</div>
          )}
          {filtered.map((entry, i) => {
            const c = CATEGORIES[entry.category] || { color: "#aaa", dot: "#aaa" };
            return (
              <a
                key={entry.slug}
                className="ms-card"
                style={{ animationDelay: `${i * 0.035}s` }}
                href={"/" + entry.slug}
              >
                <div className="ms-card-svg">
                  <ConceptIllustration category={entry.category} color={c.dot} size={48} />
                </div>
                <div className="ms-card-header">
                  <span className="ms-cat-dot" style={{ background: c.dot }} />
                  <span className="ms-cat-label" style={{ color: c.color }}>{entry.category}</span>
                </div>
                <div className="ms-card-title">{entry.title}</div>
                <div className="ms-card-oneliner">{entry.oneLiner}</div>
                <div className="ms-card-tags">
                  {entry.tags.map(t => <span key={t} className="ms-tag">{t}</span>)}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
}