import { Component, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { DataPoint } from '../usage-statistics-page.component';

/**
 * Line chart for the statistics.
 *
 * Adapted from: https://medium.com/weekly-webtips/build-a-simple-line-chart-with-d3-js-in-angular-ccd06e328bff
 */
@Component({
  selector: 'tm-stats-line-chart',
  templateUrl: './stats-line-chart.component.html',
  styleUrls: ['./stats-line-chart.component.scss'],
})
export class StatsLineChartComponent implements OnChanges {

  @Input()
  data!: DataPoint[];

  @Input()
  timeRange: { startTime: number, endTime: number } = { startTime: 0, endTime: 0 };

  @Input()
  dataName!: string;

  private width = 700;
  private height = 700;
  private margin = 50;
  private svg: any;
  private svgInner: any;
  private yScale: any;
  private xScale: any;
  private xAxis: any;
  private yAxis: any;
  private lineGroup: any;

  constructor(private chartElem: ElementRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data && this.data && this.timeRange) {
      this.initializeChart();
      this.drawChart();

      window.addEventListener('resize', () => this.drawChart());
    }
  }

  private initializeChart(): void {
    if (this.svg) {
      d3.select('svg').remove();
    }
    const startTime = new Date(this.timeRange.startTime);
    const endTime = new Date(this.timeRange.endTime);
    this.svg = d3
      .select(this.chartElem.nativeElement)
      .select('.line-chart')
      .append('svg')
      .attr('height', this.height);

    this.svgInner = this.svg
      .append('g')
      .style('transform', `translate(${this.margin}px, ${this.margin}px)`);

    this.yScale = d3
      .scaleLinear()
      .domain([
          d3.max(this.data, (d: DataPoint) => d.value) + 1,
          d3.min(this.data, (d: DataPoint) => d.value) - 1,
      ])
      .range([0, this.height - 2 * this.margin]);

    this.xScale = d3
      .scaleTime()
      .domain([startTime, endTime]);

    this.yAxis = this.svgInner
      .append('g')
      .attr('id', 'y-axis')
      .style('transform', `translate(${this.margin}px, 0)`);

    this.xAxis = this.svgInner
      .append('g')
      .attr('id', 'x-axis')
      .style('transform', `translate(0, ${this.height - 2 * this.margin}px)`);

    this.lineGroup = this.svgInner
      .append('g')
      .append('path')
      .attr('id', 'line')
      .style('fill', 'none')
      .style('stroke', '#007BFF')
      .style('stroke-width', '2px');
  }

  private drawChart(): void {
    this.width = this.chartElem.nativeElement.getBoundingClientRect().width;
    this.svg.attr('width', this.width);

    this.xScale.range([this.margin, this.width - 2 * this.margin]);

    const xAxis = d3
      .axisBottom(this.xScale)
      .ticks(10)
      .tickFormat(d3.timeFormat('%b %d, %H:%M'));

    this.xAxis.call(xAxis);

    const yAxis = d3
      .axisLeft(this.yScale);

    this.yAxis.call(yAxis);

    const line = d3
      .line()
      .x((d: number[]) => d[0])
      .y((d: number[]) => d[1]);

    const points: [number, number][] = this.data.map((d: DataPoint) => [
      this.xScale(new Date(d.date)),
      this.yScale(d.value),
    ]);

    this.lineGroup.attr('d', line(points));

    const div = d3.select('div.tooltip');
    /* TODO: JSFIX could not patch the breaking change:
    Remove d3.event and changed the interface for the listeners parsed to .on() methods 
    Suggested fix: 
    This is only breaking if the second argument to .on() is being parsed the “index” (i) and “elements” (e) as arguments. 
    The signature of the listeners have been changed to now only take the event object and the “datum” (d) (which it already did).
    To get the existing “index” and “elements” functionality you can inside the listener use
        const selection = event.selection;
        const e = selection.nodes();
        const i = e.indexOf(this);
    For further details see the official migration guide here: https://observablehq.com/@d3/d3v6-migration-guide#events. 
     */
    /* TODO: JSFIX could not patch the breaking change:
    Remove d3.event and changed the interface for the listeners parsed to .on() methods 
    Suggested fix: 
    This is only breaking if the second argument to .on() is being parsed the “index” (i) and “elements” (e) as arguments. 
    The signature of the listeners have been changed to now only take the event object and the “datum” (d) (which it already did).
    To get the existing “index” and “elements” functionality you can inside the listener use
        const selection = event.selection;
        const e = selection.nodes();
        const i = e.indexOf(this);
    For further details see the official migration guide here: https://observablehq.com/@d3/d3v6-migration-guide#events. 
     */
    this.svgInner
      .selectAll('dot')
      .data(this.data)
      .enter()
      .append('circle')
      .attr('r', 3)
      .attr('cx', (d: any) => this.xScale(new Date(d.date)))
      .attr('cy', (d: any) => this.yScale(d.value))
      .attr('fill', '#FFC107')
      .on('mouseover', (d: any) => {
        div.transition()
          .duration(200)
          .style('opacity', 0.9);
        div.html(`Time: ${new Date(d.date).toString()}<br>New ${this.dataName} count: ${d.value}`)
          .style('left', `${/* TODO: JSFIX could not patch the breaking change:
        Remove d3.event and changed the interface for the listeners parsed to .on() methods 
        Suggested fix: If this reading of the d3.event property is inside an event listener, you can change `d3.event` to just be `event` and then parse the event object as the new first argument to the event listener. See the example: https://observablehq.com/@d3/d3v6-migration-guide#cell-427. 
        If you are reading d3.event outside of an event listener, there is no “good/clean” alternative.
        Our suggestion is to have your own variable containing the last event, which is then set inside the different event listener, from which you are trying to get the event using d3.event.
        So an event listener on a drag object could look something like:
            drag().on("start", (event, d) => lastEvent = event; … ) */
        d3.event.pageX}px`)
          .style('top', `${/* TODO: JSFIX could not patch the breaking change:
        Remove d3.event and changed the interface for the listeners parsed to .on() methods 
        Suggested fix: If this reading of the d3.event property is inside an event listener, you can change `d3.event` to just be `event` and then parse the event object as the new first argument to the event listener. See the example: https://observablehq.com/@d3/d3v6-migration-guide#cell-427. 
        If you are reading d3.event outside of an event listener, there is no “good/clean” alternative.
        Our suggestion is to have your own variable containing the last event, which is then set inside the different event listener, from which you are trying to get the event using d3.event.
        So an event listener on a drag object could look something like:
            drag().on("start", (event, d) => lastEvent = event; … ) */
        d3.event.pageY - 32}px`);
      })
      .on('mouseout', () => {
        div.transition()
          .duration(500)
          .style('opacity', 0);
      });
  }

}
