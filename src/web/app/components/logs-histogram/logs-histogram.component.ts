import { Component, Input, OnChanges, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { LogsHistogramDataModel } from './logs-histogram-model';

/**
 * Histogram for displaying logs frequency.
 */
@Component({
  selector: 'tm-logs-histogram',
  templateUrl: './logs-histogram.component.html',
  styleUrls: ['./logs-histogram.component.scss'],
})
export class LogsHistogramComponent implements OnInit, OnChanges {

  @Input()
  data: LogsHistogramDataModel[] = [];

  private svg: any;
  private chart: any;
  private margin: number = 30;
  private width: number = 0;
  private height: number = 0;
  private xScale: any;
  private yScale: any;
  private yAxis: any;

  ngOnInit(): void {
    this.createSvg();
    this.drawBars();
  }

  ngOnChanges(): void {
    if (this.chart) {
      this.drawBars();
    }
  }

  private createSvg(): void {
    this.width = (document.getElementById('histogram') as HTMLInputElement).offsetWidth - (this.margin * 2);
    this.height = (document.getElementById('histogram') as HTMLInputElement).offsetHeight - (this.margin * 2);

    this.svg = d3.select('figure#histogram')
      .append('svg')
      .attr('width', this.width + (this.margin * 2))
      .attr('height', this.height + (this.margin * 2));

    this.chart = this.svg.append('g')
      .attr('class', 'bars')
      .attr('transform', `translate(${this.margin}, ${this.margin})`);

    this.xScale = d3.scaleBand()
      .domain(this.data.map((d: LogsHistogramDataModel) => d.sourceLocation.file + d.sourceLocation.function))
      .range([0, this.width])
      .padding(0.2);

    this.yScale = d3.scaleLinear()
      .domain([0, d3.max(this.data, (d: LogsHistogramDataModel) => d.numberOfTimes)])
      .range([this.height, 0]);

    this.svg.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(${this.margin}, ${this.margin + this.height})`);

    this.yAxis = this.svg.append('g')
      .attr('class', 'axis axis-y')
      .attr('transform', `translate(${this.margin}, ${this.margin})`)
      .call(d3.axisLeft(this.yScale));
  }

  private drawBars(): void {
    this.xScale.domain(this.data.map((d: LogsHistogramDataModel) => d.sourceLocation.file + d.sourceLocation.function));
    this.yScale.domain([0, d3.max(this.data, (d: LogsHistogramDataModel) => d.numberOfTimes)]);
    this.yAxis.call(d3.axisLeft(this.yScale));

    const tooltip: any = d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('z-index', '10')
      .style('visibility', 'hidden')
      .style('padding', '10px')
      .style('background', '#000')
      .style('border-radius', '5px')
      .style('color', '#fff');

    const update: any = this.chart.selectAll('.bar').data(this.data);

    // remove exiting bars
    update.exit().remove();

    this.chart.selectAll('.bar')
      .attr('x', (d: LogsHistogramDataModel) => this.xScale(d.sourceLocation.file + d.sourceLocation.function))
      .attr('y', (d: LogsHistogramDataModel) => this.yScale(d.numberOfTimes))
      .attr('height', (d: LogsHistogramDataModel) => this.height - this.yScale(d.numberOfTimes))
      .attr('width', this.xScale.bandwidth());

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
    update
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: LogsHistogramDataModel) => this.xScale(d.sourceLocation.file + d.sourceLocation.function))
      .attr('y', (d: LogsHistogramDataModel) => this.yScale(d.numberOfTimes))
      .attr('height', (d: LogsHistogramDataModel) => this.height - this.yScale(d.numberOfTimes))
      .attr('width', this.xScale.bandwidth())
      .style('fill', 'steelblue')
      .on('mouseover', (d: LogsHistogramDataModel) =>
        tooltip
          .html(`File: ${d.sourceLocation.file} <br> Function: ${d.sourceLocation.function}`
              + ` <br> Frequency: ${d.numberOfTimes}`)
          .style('visibility', 'visible'))
      .on('mousemove', () => {
        const top: number = /* TODO: JSFIX could not patch the breaking change:
        Remove d3.event and changed the interface for the listeners parsed to .on() methods 
        Suggested fix: If this reading of the d3.event property is inside an event listener, you can change `d3.event` to just be `event` and then parse the event object as the new first argument to the event listener. See the example: https://observablehq.com/@d3/d3v6-migration-guide#cell-427. 
        If you are reading d3.event outside of an event listener, there is no “good/clean” alternative.
        Our suggestion is to have your own variable containing the last event, which is then set inside the different event listener, from which you are trying to get the event using d3.event.
        So an event listener on a drag object could look something like:
            drag().on("start", (event, d) => lastEvent = event; … ) */
        d3.event.pageY - 10;
        const left: number = /* TODO: JSFIX could not patch the breaking change:
        Remove d3.event and changed the interface for the listeners parsed to .on() methods 
        Suggested fix: If this reading of the d3.event property is inside an event listener, you can change `d3.event` to just be `event` and then parse the event object as the new first argument to the event listener. See the example: https://observablehq.com/@d3/d3v6-migration-guide#cell-427. 
        If you are reading d3.event outside of an event listener, there is no “good/clean” alternative.
        Our suggestion is to have your own variable containing the last event, which is then set inside the different event listener, from which you are trying to get the event using d3.event.
        So an event listener on a drag object could look something like:
            drag().on("start", (event, d) => lastEvent = event; … ) */
        d3.event.pageX + 10;
        tooltip
          .style('top', `${top}px`)
          .style('left', `${left}px`);
      })
      .on('mouseout', () => tooltip.html('').style('visibility', 'hidden'));
  }
}
