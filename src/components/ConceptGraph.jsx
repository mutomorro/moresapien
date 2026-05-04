// ==============================================
// ConceptGraph.jsx
// Interactive D3 force-directed graph of all
// Moresapien concepts and their connections.
// ==============================================

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

// -------------------------------------------------
// Constants
// -------------------------------------------------
const TOOLTIP_OFFSET = 12;
const MIN_NODE_RADIUS = 6;
const MAX_NODE_RADIUS = 22;
const LINK_COLOUR = 'rgba(160, 140, 120, 0.25)';
const LINK_HIGHLIGHT_COLOUR = 'rgba(160, 140, 120, 0.7)';
const LABEL_COLOUR = '#5C4B3A';
const FADE_OPACITY = 0.08;

export default function ConceptGraph() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const simulationRef = useRef(null);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategories, setActiveCategories] = useState(null); // null = all active
  const [hoveredNode, setHoveredNode] = useState(null);
  const [stats, setStats] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // -------------------------------------------------
  // Load data
  // -------------------------------------------------
  useEffect(() => {
    fetch('/graph-data.json')
      .then((res) => {
        if (!res.ok) throw new Error('Could not load graph data');
        return res.json();
      })
      .then((data) => {
        setGraphData(data);
        setStats(data.meta);
        // Initialise all categories as active
        const cats = [...new Set(data.nodes.map((n) => n.category))];
        setActiveCategories(new Set(cats));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // -------------------------------------------------
  // Track container dimensions
  // -------------------------------------------------
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [loading]);

  // -------------------------------------------------
  // Category filter toggle
  // -------------------------------------------------
  const toggleCategory = useCallback(
    (cat) => {
      setActiveCategories((prev) => {
        const next = new Set(prev);
        if (next.has(cat)) {
          next.delete(cat);
        } else {
          next.add(cat);
        }
        return next;
      });
    },
    []
  );

  const resetFilters = useCallback(() => {
    if (graphData) {
      const allCats = [...new Set(graphData.nodes.map((n) => n.category))];
      setActiveCategories(new Set(allCats));
    }
    setSearchTerm('');
  }, [graphData]);

  // -------------------------------------------------
  // Compute filtered and search-matched data
  // -------------------------------------------------
  const getFilteredData = useCallback(() => {
    if (!graphData || !activeCategories) return null;

    const visibleSlugs = new Set(
      graphData.nodes
        .filter((n) => activeCategories.has(n.category))
        .map((n) => n.slug)
    );

    const nodes = graphData.nodes.filter((n) => visibleSlugs.has(n.slug));
    const edges = graphData.edges.filter(
      (e) => visibleSlugs.has(e.source) || visibleSlugs.has(e.source?.slug || e.source)
    );

    // Search matching
    const term = searchTerm.toLowerCase().trim();
    const searchMatches = term
      ? new Set(
          graphData.nodes
            .filter(
              (n) =>
                n.title.toLowerCase().includes(term) ||
                n.oneLiner.toLowerCase().includes(term) ||
                (n.tags && n.tags.some((t) => t.toLowerCase().includes(term)))
            )
            .map((n) => n.slug)
        )
      : null;

    return { nodes, edges, searchMatches, visibleSlugs };
  }, [graphData, activeCategories, searchTerm]);

  // -------------------------------------------------
  // D3 rendering
  // -------------------------------------------------
  useEffect(() => {
    if (!graphData || !activeCategories || dimensions.width === 0) return;

    const filtered = getFilteredData();
    if (!filtered) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Deep-clone nodes and edges so D3 can mutate them
    const nodes = filtered.nodes.map((n) => ({ ...n }));
    const nodeMap = new Map(nodes.map((n) => [n.slug, n]));

    const edges = graphData.edges
      .filter(
        (e) =>
          nodeMap.has(typeof e.source === 'string' ? e.source : e.source.slug) &&
          nodeMap.has(typeof e.target === 'string' ? e.target : e.target.slug)
      )
      .map((e) => ({
        ...e,
        source: typeof e.source === 'string' ? e.source : e.source.slug,
        target: typeof e.target === 'string' ? e.target : e.target.slug,
      }));

    // Radius scale based on connection count
    const maxConnections = d3.max(nodes, (d) => d.connections) || 1;
    const radiusScale = d3
      .scaleSqrt()
      .domain([0, maxConnections])
      .range([MIN_NODE_RADIUS, MAX_NODE_RADIUS]);

    // ----- Zoom -----
    const g = svg.append('g');

    const zoom = d3
      .zoom()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Centre the view initially
    const initialTransform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(0.85);
    svg.call(zoom.transform, initialTransform);

    // ----- Links -----
    const linkGroup = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke', LINK_COLOUR)
      .attr('stroke-width', 1.2);

    // ----- Nodes -----
    const nodeGroup = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes, (d) => d.slug)
      .join('g')
      .attr('cursor', 'pointer')
      .call(
        d3
          .drag()
          .on('start', (event, d) => {
            if (!event.active) simulationRef.current.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulationRef.current.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Node circles
    nodeGroup
      .append('circle')
      .attr('r', (d) => radiusScale(d.connections))
      .attr('fill', (d) => d.colour)
      .attr('stroke', '#FFFBF5')
      .attr('stroke-width', 1.5);

    // Node labels
    nodeGroup
      .append('text')
      .text((d) => d.title)
      .attr('dy', (d) => radiusScale(d.connections) + 14)
      .attr('text-anchor', 'middle')
      .attr('fill', LABEL_COLOUR)
      .attr('font-size', (d) => (d.connections > maxConnections * 0.6 ? '12px' : '10px'))
      .attr('font-family', "'Nunito', sans-serif")
      .attr('font-weight', (d) => (d.connections > maxConnections * 0.6 ? '700' : '600'))
      .attr('pointer-events', 'none');

    // ----- Hover interactions -----
    const connectedTo = new Map();
    for (const edge of edges) {
      const s = typeof edge.source === 'string' ? edge.source : edge.source.slug;
      const t = typeof edge.target === 'string' ? edge.target : edge.target.slug;
      if (!connectedTo.has(s)) connectedTo.set(s, new Set());
      if (!connectedTo.has(t)) connectedTo.set(t, new Set());
      connectedTo.get(s).add(t);
      connectedTo.get(t).add(s);
    }

    nodeGroup
      .on('mouseenter', (event, d) => {
        const neighbours = connectedTo.get(d.slug) || new Set();

        // Fade everything
        nodeGroup.style('opacity', (n) =>
          n.slug === d.slug || neighbours.has(n.slug) ? 1 : FADE_OPACITY
        );
        linkGroup
          .attr('stroke', (l) => {
            const ls = typeof l.source === 'string' ? l.source : l.source.slug;
            const lt = typeof l.target === 'string' ? l.target : l.target.slug;
            return ls === d.slug || lt === d.slug ? LINK_HIGHLIGHT_COLOUR : LINK_COLOUR;
          })
          .attr('stroke-width', (l) => {
            const ls = typeof l.source === 'string' ? l.source : l.source.slug;
            const lt = typeof l.target === 'string' ? l.target : l.target.slug;
            return ls === d.slug || lt === d.slug ? 2 : 1.2;
          })
          .style('opacity', (l) => {
            const ls = typeof l.source === 'string' ? l.source : l.source.slug;
            const lt = typeof l.target === 'string' ? l.target : l.target.slug;
            return ls === d.slug || lt === d.slug ? 1 : FADE_OPACITY;
          });

        setHoveredNode(d);
      })
      .on('mouseleave', () => {
        nodeGroup.style('opacity', 1);
        linkGroup
          .attr('stroke', LINK_COLOUR)
          .attr('stroke-width', 1.2)
          .style('opacity', 1);
        setHoveredNode(null);
      })
      .on('click', (event, d) => {
        window.location.href = `/${d.slug}/`;
      });

    // ----- Search highlighting -----
    if (filtered.searchMatches) {
      nodeGroup.style('opacity', (n) =>
        filtered.searchMatches.has(n.slug) ? 1 : FADE_OPACITY
      );
      linkGroup.style('opacity', FADE_OPACITY);

      // Pulse effect on matched nodes
      nodeGroup
        .filter((n) => filtered.searchMatches.has(n.slug))
        .select('circle')
        .attr('stroke', '#5C4B3A')
        .attr('stroke-width', 2.5);
    }

    // ----- Force simulation -----
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(edges)
          .id((d) => d.slug)
          .distance(200)
          .strength(0.2)
      )
      .force('charge', d3.forceManyBody().strength(-370).distanceMax(900))
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide().radius((d) => radiusScale(d.connections) + 8))
      .force('x', d3.forceX(0).strength(0.05))
      .force('y', d3.forceY(0).strength(0.05))
      .on('tick', () => {
        linkGroup
          .attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y);

        nodeGroup.attr('transform', (d) => `translate(${d.x},${d.y})`);
      });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [graphData, activeCategories, searchTerm, dimensions, getFilteredData]);

  // -------------------------------------------------
  // Render
  // -------------------------------------------------
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#FFFBF5',
          fontFamily: "'Nunito', sans-serif",
          color: '#5C4B3A',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🕸️</div>
          <p>Loading the concept map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#FFFBF5',
          fontFamily: "'Nunito', sans-serif",
          color: '#5C4B3A',
        }}
      >
        <p>Something went wrong: {error}</p>
      </div>
    );
  }

  const categories = graphData
    ? [...new Set(graphData.nodes.map((n) => n.category))].sort()
    : [];

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        background: '#FFFBF5',
        overflow: 'hidden',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* ---- Header bar ---- */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          padding: '16px 20px 12px',
          background: 'linear-gradient(to bottom, #FFFBF5 60%, transparent)',
          pointerEvents: 'none',
        }}
      >
        <div style={{ pointerEvents: 'auto', maxWidth: '1000px', margin: '0 auto' }}>
          {/* Title row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            <div>
              <a
                href="/"
                style={{
                  textDecoration: 'none',
                  color: '#5C4B3A',
                  fontFamily: "'Lora', serif",
                  fontSize: '1.3rem',
                  fontWeight: 600,
                }}
              >
                Moresapien
              </a>
              <span
                style={{
                  color: '#A0937D',
                  fontSize: '0.85rem',
                  marginLeft: '12px',
                }}
              >
                Connections
              </span>
            </div>
            {stats && (
              <div style={{ fontSize: '0.8rem', color: '#A0937D' }}>
                {stats.totalEntries} concepts · {stats.totalConnections} connections
              </div>
            )}
          </div>

          {/* Search and filters */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <input
              type="text"
              placeholder="Search concepts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '6px 12px',
                border: '1px solid #DDD5C8',
                borderRadius: '6px',
                background: '#FFFBF5',
                color: '#5C4B3A',
                fontSize: '0.85rem',
                fontFamily: "'Nunito', sans-serif",
                outline: 'none',
                width: '200px',
              }}
            />

            <div
              style={{
                display: 'flex',
                gap: '4px',
                flexWrap: 'wrap',
              }}
            >
              {categories.map((cat) => {
                const isActive = activeCategories?.has(cat);
                const colour = graphData.categoryColours[cat] || '#999';
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    title={cat}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      border: `1.5px solid ${colour}`,
                      borderRadius: '12px',
                      background: isActive ? colour + '22' : 'transparent',
                      color: isActive ? '#5C4B3A' : '#A0937D',
                      fontSize: '0.72rem',
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: isActive ? 600 : 400,
                      cursor: 'pointer',
                      opacity: isActive ? 1 : 0.5,
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: colour,
                        opacity: isActive ? 1 : 0.3,
                        flexShrink: 0,
                      }}
                    />
                    {cat}
                  </button>
                );
              })}
            </div>

            {(searchTerm || (activeCategories && activeCategories.size < categories.length)) && (
              <button
                onClick={resetFilters}
                style={{
                  padding: '3px 10px',
                  border: '1px solid #DDD5C8',
                  borderRadius: '12px',
                  background: 'transparent',
                  color: '#A0937D',
                  fontSize: '0.72rem',
                  fontFamily: "'Nunito', sans-serif",
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---- Graph SVG ---- */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ display: 'block' }}
      />

      {/* ---- Hover tooltip ---- */}
      {hoveredNode && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            background: '#FFFBF5',
            border: '1px solid #DDD5C8',
            borderRadius: '10px',
            padding: '12px 16px',
            maxWidth: '360px',
            boxShadow: '0 4px 20px rgba(92, 75, 58, 0.12)',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '4px',
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: hoveredNode.colour,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "'Lora', serif",
                fontWeight: 600,
                fontSize: '0.95rem',
                color: '#5C4B3A',
              }}
            >
              {hoveredNode.title}
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                color: '#A0937D',
                marginLeft: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              {hoveredNode.connections} connections
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: '0.82rem',
              color: '#7A6B5A',
              lineHeight: 1.45,
            }}
          >
            {hoveredNode.oneLiner}
          </p>
          <div
            style={{
              marginTop: '6px',
              fontSize: '0.68rem',
              color: '#A0937D',
            }}
          >
            {hoveredNode.category} · Click to read more
          </div>
        </div>
      )}

      {/* ---- Help hint ---- */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 10,
          fontSize: '0.7rem',
          color: '#C4B9A8',
          textAlign: 'right',
          lineHeight: 1.5,
          pointerEvents: 'none',
        }}
      >
        Scroll to zoom · Drag to pan · Click a concept to read more
      </div>
    </div>
  );
}
