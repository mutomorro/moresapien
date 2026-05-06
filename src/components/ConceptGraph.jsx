// ==============================================
// ConceptGraph.jsx
// Interactive D3 force-directed graph of all
// Moresapien concepts and their connections.
// Restyled to the new design system: ink/paper, mute lines,
// category colours per node, DM Mono UI labels.
// ==============================================

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

// -------------------------------------------------
// Constants (matched to design tokens)
// -------------------------------------------------
const MIN_NODE_RADIUS = 6;
const MAX_NODE_RADIUS = 22;
const PAPER = '#F5F1E8';
const INK = '#15140F';
const MUTE = '#6B6655';
const RULE = '#DCD5C2';
const CORAL = '#FF5D4A';
const LINK_COLOUR = 'rgba(107, 102, 85, 0.3)';   // mute @ 30%
const LINK_HIGHLIGHT_COLOUR = 'rgba(107, 102, 85, 0.85)';
const FADE_OPACITY = 0.08;

const FONT_UI = "'Space Grotesk', system-ui, sans-serif";
const FONT_DISPLAY = "'Newsreader', Georgia, serif";
const FONT_MONO = "'DM Mono', ui-monospace, monospace";

export default function ConceptGraph() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const simulationRef = useRef(null);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategories, setActiveCategories] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [stats, setStats] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    fetch('/graph-data.json')
      .then((res) => {
        if (!res.ok) throw new Error('Could not load graph data');
        return res.json();
      })
      .then((data) => {
        setGraphData(data);
        setStats(data.meta);
        const cats = [...new Set(data.nodes.map((n) => n.category))];
        setActiveCategories(new Set(cats));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

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

  const toggleCategory = useCallback((cat) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const resetFilters = useCallback(() => {
    if (graphData) {
      const allCats = [...new Set(graphData.nodes.map((n) => n.category))];
      setActiveCategories(new Set(allCats));
    }
    setSearchTerm('');
  }, [graphData]);

  const getFilteredData = useCallback(() => {
    if (!graphData || !activeCategories) return null;

    const visibleSlugs = new Set(
      graphData.nodes
        .filter((n) => activeCategories.has(n.category))
        .map((n) => n.slug),
    );

    const nodes = graphData.nodes.filter((n) => visibleSlugs.has(n.slug));
    const edges = graphData.edges.filter(
      (e) =>
        visibleSlugs.has(e.source) ||
        visibleSlugs.has(e.source?.slug || e.source),
    );

    const term = searchTerm.toLowerCase().trim();
    const searchMatches = term
      ? new Set(
          graphData.nodes
            .filter(
              (n) =>
                n.title.toLowerCase().includes(term) ||
                n.oneLiner.toLowerCase().includes(term) ||
                (n.tags && n.tags.some((t) => t.toLowerCase().includes(term))),
            )
            .map((n) => n.slug),
        )
      : null;

    return { nodes, edges, searchMatches, visibleSlugs };
  }, [graphData, activeCategories, searchTerm]);

  useEffect(() => {
    if (!graphData || !activeCategories || dimensions.width === 0) return;

    const filtered = getFilteredData();
    if (!filtered) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const nodes = filtered.nodes.map((n) => ({ ...n }));
    const nodeMap = new Map(nodes.map((n) => [n.slug, n]));

    const edges = graphData.edges
      .filter(
        (e) =>
          nodeMap.has(typeof e.source === 'string' ? e.source : e.source.slug) &&
          nodeMap.has(typeof e.target === 'string' ? e.target : e.target.slug),
      )
      .map((e) => ({
        ...e,
        source: typeof e.source === 'string' ? e.source : e.source.slug,
        target: typeof e.target === 'string' ? e.target : e.target.slug,
      }));

    const maxConnections = d3.max(nodes, (d) => d.connections) || 1;
    const radiusScale = d3
      .scaleSqrt()
      .domain([0, maxConnections])
      .range([MIN_NODE_RADIUS, MAX_NODE_RADIUS]);

    const g = svg.append('g');

    const zoom = d3
      .zoom()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const initialTransform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(0.85);
    svg.call(zoom.transform, initialTransform);

    const linkGroup = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke', LINK_COLOUR)
      .attr('stroke-width', 1);

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
          }),
      );

    nodeGroup
      .append('circle')
      .attr('r', (d) => radiusScale(d.connections))
      .attr('fill', (d) => d.colour)
      .attr('stroke', PAPER)
      .attr('stroke-width', 1.5)
      .attr('class', 'node-circle')
      .style('transition', 'transform 0.15s ease')
      .style('transform-origin', 'center');

    nodeGroup
      .append('text')
      .text((d) => d.title)
      .attr('dy', (d) => radiusScale(d.connections) + 14)
      .attr('text-anchor', 'middle')
      .attr('fill', INK)
      .attr('font-size', (d) => (d.connections > maxConnections * 0.6 ? '12px' : '10px'))
      .attr('font-family', FONT_DISPLAY)
      .attr('font-weight', '500')
      .attr('letter-spacing', '-0.01em')
      .attr('pointer-events', 'none');

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

        nodeGroup.style('opacity', (n) =>
          n.slug === d.slug || neighbours.has(n.slug) ? 1 : FADE_OPACITY,
        );

        nodeGroup
          .filter((n) => n.slug === d.slug)
          .select('circle')
          .transition()
          .duration(120)
          .attr('r', (n) => radiusScale(n.connections) * 1.15);

        linkGroup
          .attr('stroke', (l) => {
            const ls = typeof l.source === 'string' ? l.source : l.source.slug;
            const lt = typeof l.target === 'string' ? l.target : l.target.slug;
            return ls === d.slug || lt === d.slug ? LINK_HIGHLIGHT_COLOUR : LINK_COLOUR;
          })
          .attr('stroke-width', (l) => {
            const ls = typeof l.source === 'string' ? l.source : l.source.slug;
            const lt = typeof l.target === 'string' ? l.target : l.target.slug;
            return ls === d.slug || lt === d.slug ? 1.8 : 1;
          })
          .style('opacity', (l) => {
            const ls = typeof l.source === 'string' ? l.source : l.source.slug;
            const lt = typeof l.target === 'string' ? l.target : l.target.slug;
            return ls === d.slug || lt === d.slug ? 1 : FADE_OPACITY;
          });

        setHoveredNode(d);
      })
      .on('mouseleave', (event, d) => {
        nodeGroup.style('opacity', 1);
        nodeGroup
          .filter((n) => n.slug === d.slug)
          .select('circle')
          .transition()
          .duration(120)
          .attr('r', (n) => radiusScale(n.connections));

        linkGroup
          .attr('stroke', LINK_COLOUR)
          .attr('stroke-width', 1)
          .style('opacity', 1);
        setHoveredNode(null);
      })
      .on('click', (event, d) => {
        window.location.href = `/${d.slug}/`;
      });

    if (filtered.searchMatches) {
      nodeGroup.style('opacity', (n) =>
        filtered.searchMatches.has(n.slug) ? 1 : FADE_OPACITY,
      );
      linkGroup.style('opacity', FADE_OPACITY);

      nodeGroup
        .filter((n) => filtered.searchMatches.has(n.slug))
        .select('circle')
        .attr('stroke', CORAL)
        .attr('stroke-width', 2.5);
    }

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(edges)
          .id((d) => d.slug)
          .distance(200)
          .strength(0.2),
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

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: PAPER,
          fontFamily: FONT_UI,
          color: MUTE,
          fontSize: '13px',
        }}
      >
        <p>Loading the concept map…</p>
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
          background: PAPER,
          fontFamily: FONT_UI,
          color: MUTE,
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
        height: '100%',
        background: PAPER,
        overflow: 'hidden',
        fontFamily: FONT_UI,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          padding: '20px 24px 16px',
          background:
            'linear-gradient(to bottom, ' + PAPER + ' 60%, rgba(245,241,232,0))',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: MUTE,
                  margin: 0,
                  marginBottom: '4px',
                }}
              >
                The map
              </p>
              <h1
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: '24px',
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                  color: INK,
                  margin: 0,
                }}
              >
                Connections
              </h1>
            </div>
            {stats && (
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: MUTE,
                }}
              >
                {stats.totalEntries} concepts · {stats.totalConnections} connections
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <input
              type="text"
              placeholder="Search concepts…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '7px 14px',
                border: '1px solid ' + RULE,
                borderRadius: '4px',
                background: '#FFFFFF',
                color: INK,
                fontSize: '13px',
                fontFamily: FONT_UI,
                outline: 'none',
                width: '220px',
              }}
            />

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {categories.map((cat) => {
                const isActive = activeCategories?.has(cat);
                const colour = graphData.categoryColours[cat] || MUTE;
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    title={cat}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      border: '1.5px solid ' + colour,
                      borderRadius: '999px',
                      background: isActive ? colour : 'transparent',
                      color: isActive ? '#FFFFFF' : colour,
                      fontFamily: FONT_MONO,
                      fontSize: '11px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      fontWeight: 500,
                      cursor: 'pointer',
                      opacity: isActive ? 1 : 0.7,
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {(searchTerm ||
              (activeCategories && activeCategories.size < categories.length)) && (
              <button
                onClick={resetFilters}
                style={{
                  padding: '4px 12px',
                  border: '1px solid ' + RULE,
                  borderRadius: '999px',
                  background: 'transparent',
                  color: MUTE,
                  fontFamily: FONT_MONO,
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
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

      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ display: 'block' }}
      />

      {hoveredNode && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            background: '#FFFFFF',
            border: '1px solid ' + RULE,
            borderTop: '4px solid ' + (hoveredNode.colour || MUTE),
            borderRadius: '4px',
            padding: '14px 18px',
            maxWidth: '380px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            pointerEvents: 'none',
          }}
        >
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: hoveredNode.colour || MUTE,
              margin: 0,
              marginBottom: '6px',
            }}
          >
            {hoveredNode.category}
          </p>
          <p
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 400,
              fontSize: '18px',
              letterSpacing: '-0.02em',
              color: INK,
              margin: 0,
              marginBottom: '6px',
              lineHeight: 1.2,
            }}
          >
            {hoveredNode.title}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: MUTE,
              lineHeight: 1.5,
              fontFamily: "'General Sans', system-ui, sans-serif",
            }}
          >
            {hoveredNode.oneLiner}
          </p>
          <p
            style={{
              marginTop: '8px',
              marginBottom: 0,
              fontFamily: FONT_MONO,
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: MUTE,
            }}
          >
            {hoveredNode.connections} connections · click to read
          </p>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '24px',
          zIndex: 10,
          fontFamily: FONT_MONO,
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: MUTE,
          textAlign: 'right',
          lineHeight: 1.5,
          pointerEvents: 'none',
          opacity: 0.7,
        }}
      >
        Scroll to zoom · Drag to pan
      </div>
    </div>
  );
}
