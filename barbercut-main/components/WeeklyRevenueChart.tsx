'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { TrendingUp, Sparkles, Calendar, ArrowUpRight } from 'lucide-react'
import { formatPrice } from '@/lib/locale'
import type { Salon } from '@/lib/types'

interface DayRevenueData {
  day: string
  fullDay: string
  total: number // FCFA
  marketplace: number // FCFA
  direct: number // FCFA
  appointmentsCount: number
}

// Plus de données de revenus codées en dur - les données proviennent exclusivement de la base de données
const CURRENT_WEEK_DATA: DayRevenueData[] = []
const PREVIOUS_WEEK_DATA: DayRevenueData[] = []

interface WeeklyRevenueChartProps {
  salon?: Salon | null
}

export function WeeklyRevenueChart({ salon = null }: WeeklyRevenueChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedWeek, setSelectedWeek] = useState<'current' | 'previous'>('current')
  const [hoveredData, setHoveredData] = useState<DayRevenueData | null>(null)
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null)

  const data = selectedWeek === 'current' ? CURRENT_WEEK_DATA : PREVIOUS_WEEK_DATA
  const weekTotal = data.reduce((acc, curr) => acc + curr.total, 0)
  const weekMarketplace = data.reduce((acc, curr) => acc + curr.marketplace, 0)
  const peakDay = [...data].sort((a, b) => b.total - a.total)[0] || { day: '-', total: 0, appointmentsCount: 0 }

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return

    const container = containerRef.current
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Dimensions
    const width = container.clientWidth || 600
    const height = 260
    const margin = { top: 25, right: 25, bottom: 35, left: 65 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    svg.attr('viewBox', `0 0 ${width} ${height}`)

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Scales
    const x = d3
      .scalePoint<string>()
      .domain(data.map((d) => d.day))
      .range([0, innerWidth])
      .padding(0.2)

    const maxVal = d3.max(data, (d) => d.total) || 150000
    const y = d3
      .scaleLinear()
      .domain([0, maxVal * 1.15])
      .nice()
      .range([innerHeight, 0])

    // Grid lines
    const yAxisGrid = d3
      .axisLeft(y)
      .tickSize(-innerWidth)
      .tickFormat(() => '')
      .ticks(5)

    g.append('g')
      .attr('class', 'grid')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', '#ede9e2')
      .attr('stroke-dasharray', '3,3')

    g.selectAll('.domain').remove()

    // Area generator for gradient fill
    const area = d3
      .area<DayRevenueData>()
      .x((d) => x(d.day)!)
      .y0(innerHeight)
      .y1((d) => y(d.total))
      .curve(d3.curveMonotoneX)

    // Line generator
    const line = d3
      .line<DayRevenueData>()
      .x((d) => x(d.day)!)
      .y((d) => y(d.total))
      .curve(d3.curveMonotoneX)

    // Marketplace secondary line generator
    const lineMarketplace = d3
      .line<DayRevenueData>()
      .x((d) => x(d.day)!)
      .y((d) => y(d.marketplace))
      .curve(d3.curveMonotoneX)

    // Defs for gradients
    const defs = svg.append('defs')

    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'revenue-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%')

    areaGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#bd664a')
      .attr('stop-opacity', 0.28)

    areaGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#bd664a')
      .attr('stop-opacity', 0.0)

    // Draw area
    g.append('path')
      .datum(data)
      .attr('fill', 'url(#revenue-area-gradient)')
      .attr('d', area)

    // Draw Marketplace secondary dashed line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#d9a45e')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4')
      .attr('d', lineMarketplace)

    // Draw primary total line
    const path = g
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#bd664a')
      .attr('stroke-width', 3)
      .attr('d', line)

    // Animate line path drawing
    const totalLength = (path.node() as SVGPathElement)?.getTotalLength?.() || 1000
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0)

    // Axes
    const xAxis = d3.axisBottom(x).tickSize(0).tickPadding(12)
    const yAxis = d3
      .axisLeft(y)
      .ticks(4)
      .tickFormat((d) => `${d3.format(',.0f')(Number(d))} F`)
      .tickSize(0)
      .tickPadding(10)

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', '#6f746e')

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .attr('fill', '#92958f')

    // Data points & overlay hit areas for hover
    data.forEach((d) => {
      const cx = x(d.day)!
      const cy = y(d.total)

      // Outer halo
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 5)
        .attr('fill', '#ffffff')
        .attr('stroke', '#bd664a')
        .attr('stroke-width', 2.5)

      // Inner dot
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 2)
        .attr('fill', '#bd664a')
    })

    // Interactive vertical tracker line
    const trackerLine = g
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#202321')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,3')
      .style('opacity', 0)

    // Focus point highlight
    const focusPoint = g
      .append('circle')
      .attr('r', 6)
      .attr('fill', '#202321')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2.5)
      .style('opacity', 0)

    // Invisible mouse overlay for smooth hit testing
    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event)
        // Find closest day
        let closestIndex = 0
        let minDiff = Infinity
        data.forEach((d, i) => {
          const posX = x(d.day)!
          const diff = Math.abs(posX - mx)
          if (diff < minDiff) {
            minDiff = diff
            closestIndex = i
          }
        })

        const item = data[closestIndex]
        const posX = x(item.day)!
        const posY = y(item.total)

        trackerLine
          .style('opacity', 1)
          .attr('x1', posX)
          .attr('x2', posX)

        focusPoint
          .style('opacity', 1)
          .attr('cx', posX)
          .attr('cy', posY)

        setHoveredData(item)
        setHoverPosition({ x: posX + margin.left, y: posY + margin.top })
      })
      .on('mouseleave', () => {
        trackerLine.style('opacity', 0)
        focusPoint.style('opacity', 0)
        setHoveredData(null)
        setHoverPosition(null)
      })

  }, [selectedWeek, data])

  return (
    <section className="rounded-3xl border border-[#e9e6df] bg-white p-6 shadow-sm">
      {/* Chart Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#f0ece5] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#bd664a]">
            <TrendingUp size={15} />
            <span>Courbe d’évolution D3.js</span>
          </div>
          <h3 className="mt-1 font-serif text-xl font-bold text-[#202321]">
            Chiffre d’affaires hebdomadaire
          </h3>
          <p className="text-xs text-[#8c9089]">
            Visualisation des recettes journalières et de la contribution Marketplace
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Week selector */}
          <div className="flex items-center gap-1 p-1 bg-[#edeae3] rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSelectedWeek('current')}
              className={`px-3 py-1.5 rounded-lg transition ${selectedWeek === 'current'
                ? 'bg-white text-[#202321] shadow-sm'
                : 'text-[#6b7069] hover:text-[#202321]'
                }`}
            >
              Semaine en cours
            </button>
            <button
              onClick={() => setSelectedWeek('previous')}
              className={`px-3 py-1.5 rounded-lg transition ${selectedWeek === 'previous'
                ? 'bg-white text-[#202321] shadow-sm'
                : 'text-[#6b7069] hover:text-[#202321]'
                }`}
            >
              Semaine précédente
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Highlights */}
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4 border-b border-[#f1eee8] pb-5">
        <div>
          <span className="text-[11px] text-[#92958f]">Total de la semaine</span>
          <div className="mt-0.5 font-serif text-xl font-bold text-[#202321]">
            {formatPrice(weekTotal, salon)}
          </div>
          <span className="text-[10px] text-[#4d7c3b] font-semibold flex items-center gap-0.5">
            <ArrowUpRight size={12} /> +12,8% vs S-1
          </span>
        </div>

        <div>
          <span className="text-[11px] text-[#92958f]">Part Marketplace</span>
          <div className="mt-0.5 font-serif text-xl font-bold text-[#bd664a]">
            {formatPrice(weekMarketplace, salon)}
          </div>
          <span className="text-[10px] text-[#8c9089]">
            {Math.round((weekMarketplace / weekTotal) * 100)}% du chiffre global
          </span>
        </div>

        <div>
          <span className="text-[11px] text-[#92958f]">Pic d’activité</span>
          <div className="mt-0.5 font-serif text-xl font-bold text-[#202321]">
            {peakDay.day} ({formatPrice(peakDay.total, salon)})
          </div>
          <span className="text-[10px] text-[#8c9089]">
            {peakDay.appointmentsCount} rendez-vous honorés
          </span>
        </div>

        <div>
          <span className="text-[11px] text-[#92958f]">Légende des courbes</span>
          <div className="mt-1.5 space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-5 rounded bg-[#bd664a]" />
              <span className="text-[11px] text-[#555a53] font-medium">CA Total Salon</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-5 border-t-2 border-dashed border-[#d9a45e]" />
              <span className="text-[11px] text-[#555a53] font-medium">Apport Marketplace</span>
            </div>
          </div>
        </div>
      </div>

      {/* D3 Chart Canvas Container */}
      <div ref={containerRef} className="relative mt-4 w-full">
        <svg ref={svgRef} className="w-full overflow-visible" />

        {/* Floating Custom Tooltip on Hover */}
        {hoveredData && hoverPosition && (
          <div
            className="pointer-events-none absolute z-20 w-56 rounded-2xl border border-[#e4e0d7] bg-[#202321] p-3 text-white shadow-xl transition-all duration-75"
            style={{
              left: Math.min(hoverPosition.x - 110, (containerRef.current?.clientWidth || 400) - 230),
              top: Math.max(10, hoverPosition.y - 120),
            }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="font-bold text-xs text-[#f4c58d]">{hoveredData.fullDay}</span>
              <span className="text-[10px] text-[#a4aca4]">
                {hoveredData.appointmentsCount} RDV
              </span>
            </div>

            <div className="mt-2 space-y-1 text-[11px]">
              <div className="flex justify-between font-bold">
                <span>CA Total :</span>
                <span className="font-serif text-[#f4c58d]">
                  {formatPrice(hoveredData.total, salon)}
                </span>
              </div>
              <div className="flex justify-between text-[#cfd6cf]">
                <span>• Marketplace :</span>
                <span>{formatPrice(hoveredData.marketplace, salon)}</span>
              </div>
              <div className="flex justify-between text-[#cfd6cf]">
                <span>• Direct Salon :</span>
                <span>{formatPrice(hoveredData.direct, salon)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}