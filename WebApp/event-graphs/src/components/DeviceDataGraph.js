import React from 'react';
import {
  Grid,
  Paper
} from '@mui/material';
import {
    TimeSeries,
    TimeRange,
    TimeEvent,
    Pipeline as pipeline,
    Stream,
    EventOut,
    avg
} from "pondjs";
import {
    Legend,
    Resizable,
    Charts,
    ChartContainer,
    ChartRow,
    BarChart,
    ScatterChart,
    YAxis,
    styler
} from "react-timeseries-charts";
import Ring from "ringjs";

import EventStream from '../services/EventStream';

const sec = 1000;
const minute = 60 * sec;
const hours = 60 * minute;
const rate = 200;

class DeviceDataGraph extends React.Component {
    state = {
        time: new Date(),
        events: new Ring(50),
        percentile50Out: new Ring(25),
        stopRequest: false,
        requestMade: false
    };

    componentDidMount() {
        //
        // Setup our aggregation pipelines
        //

        this.stream = new Stream();

        pipeline()
            .from(this.stream)
            .windowBy("5m")
            .emitOn("discard")
            .aggregate({
                value: { value: avg() }
            })
            .to(EventOut, event => {
                const events = this.state.percentile50Out;
                events.push(event);
                this.setState({ percentile50Out: events });
            });

        //
        // Setup our interval to advance the time and generate raw events
        //
        this.interval = setInterval(() => {
            if (this.state.stopRequest || this.state.requestMade) {
                return;
            }

            this.setState({ requestMade: true });

            EventStream.GetQueueData(this.props.eventQueue, 1)
                .then((response) => response.json())
                .then((newData) => {
                    if (newData && newData.length > 0) {
                        const t = new Date(Date.parse(newData[0].time));
                        const event = new TimeEvent(t, parseInt(newData[0].data.temperature));

                        // Raw events
                        const newEvents = this.state.events;
                        newEvents.push(event);
                        this.setState({ time: t, events: newEvents });

                        // Let our aggregators process the event
                        this.stream.addEvent(event);
                    } else {
                        this.setState({ stopRequest: true });
                    }

                    this.setState({ requestMade: false });
                });
        }, rate);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        const fiveMinuteStyle = {
            value: {
                normal: { fill: "#a84c32", opacity: 0.2 },
                highlight: { fill: "a84c32", opacity: 0.5 },
                selected: { fill: "a84c32", opacity: 0.5 }
            }
        };

        const scatterStyle = {
            value: {
                normal: {
                    fill: "steelblue",
                    opacity: 0.5
                }
            }
        };

        //
        // Create a TimeSeries for our raw, 5min and hourly events
        //
        const eventSeries = new TimeSeries({
            name: "raw",
            events: this.state.events.toArray()
        });

        const perc50Series = new TimeSeries({
            name: "Average Temperature over 5 Minutes",
            events: this.state.percentile50Out.toArray()
        });

        //debugger;
        // Timerange for the chart axis
        const initialBeginTime = new Date();
        const timeWindow = 1 * hours;

        let beginTime;
        const endTime = new Date(this.state.time.getTime() + minute);
        if (endTime.getTime() - timeWindow < initialBeginTime.getTime()) {
            beginTime = initialBeginTime;
        } else {
            beginTime = new Date(endTime.getTime() - timeWindow);
        }
        const timeRange = new TimeRange(beginTime, endTime);

        // Charts (after a certain amount of time, just show hourly rollup)
        const charts = (
            <Charts>
                <BarChart
                    axis="y"
                    series={perc50Series}
                    style={fiveMinuteStyle}
                    columns={["value"]}
                />
                <ScatterChart axis="y" series={eventSeries} style={scatterStyle} radius="4.0" />
            </Charts>
        );

        const style = styler([
            { key: "perc50", color: "#a84c32", width: 1, dashed: true }
        ]);

        return (
            <Paper style={{margin: 40}}>
                <Grid style={{paddingBottom: 20}}>
                    <Grid style={{padding: 20}}>
                        <Legend
                            type="swatch"
                            style={style}
                            categories={[
                                {
                                    key: "perc50",
                                    label: "Average Temperature over 5 Minutes",
                                    style: { fill: "#a84c32" }
                                }
                            ]}
                        />
                    </Grid>
                </Grid>
                <Grid>
                    <Resizable>
                        <ChartContainer timeRange={timeRange}>
                            <ChartRow height="700">
                                <YAxis
                                    id="y"
                                    label="temperature"
                                    min={0}
                                    max={200}
                                    width="70"
                                    type="linear"
                                />
                                {charts}
                            </ChartRow>
                        </ChartContainer>
                    </Resizable>
                </Grid>
            </Paper>
        );
    }
}

// Export example
export default DeviceDataGraph;