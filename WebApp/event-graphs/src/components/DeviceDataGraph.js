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

const red = "#b4464b";
const green = "#4bb446";
const blue = "#464bb4";

class DeviceDataGraph extends React.Component {
    state = {
        time: new Date(),
        plainEvents: new Ring(50),
        richEvents: new Ring(50),
        avgOver5Minutes: new Ring(25),
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
                const events = this.state.avgOver5Minutes;
                events.push(event);
                this.setState({ avgOver5Minutes: events });
            });

        //
        // Setup our interval to advance the time and generate raw events
        //
        this.interval = setInterval(() => {
            if (!this.props.runStream || this.state.stopRequest || this.state.requestMade) {
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
                        if (newData[0].data.loggingLevel === "plain") {
                            const newEvents = this.state.plainEvents;
                            newEvents.push(event);
                            this.setState({ time: t, plainEvents: newEvents });
                        } else if (newData[0].data.loggingLevel === "rich") {
                            const newEvents = this.state.richEvents;
                            newEvents.push(event);
                            this.setState({ time: t, richEvents: newEvents });
                        }

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
                normal: { fill: red, opacity: 0.4 },
                highlight: { fill: red, opacity: 0.5 },
                selected: { fill: red, opacity: 0.5 }
            }
        };

        const plainDataScatterStyle = {
            value: {
                normal: {
                    fill: blue,
                    opacity: 0.8
                }
            }
        };

        const richDataScatterStyle = {
            value: {
                normal: {
                    fill: green,
                    opacity: 0.8
                }
            }
        };
        
        const style = styler([
            { key: "avgOver5", color: red, width: 1, dashed: true },
            { key: "plainData", color: blue, width: 1, dashed: true },
            { key: "richData", color: green, width: 1, dashed: true }
        ]);

        //
        // Create a TimeSeries for our raw, 5min and hourly events
        //
        const plainDataEventSeries = new TimeSeries({
            name: "plain",
            events: this.state.plainEvents.toArray()
        });

        const richDataEventSeries = new TimeSeries({
            name: "rich",
            events: this.state.richEvents.toArray()
        });

        const avgOver5Series = new TimeSeries({
            name: "Average Temperature over 5 Minutes",
            events: this.state.avgOver5Minutes.toArray()
        });

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
                    series={avgOver5Series}
                    style={fiveMinuteStyle}
                    columns={["value"]}
                />
                <ScatterChart axis="y" series={plainDataEventSeries} style={plainDataScatterStyle} radius="3.0" />
                <ScatterChart axis="y" series={richDataEventSeries} style={richDataScatterStyle} radius="3.0" />
            </Charts>
        );

        return (
            <Paper style={{margin: 20, width: 600}}>
                <Grid style={{paddingBottom: 20}}>
                    <Grid style={{padding: 20}}>
                        <h2>{this.props.name}</h2>
                        <Legend
                            type="swatch"
                            style={style}
                            categories={[
                                {
                                    key: "avgOver5",
                                    label: "Average Temperature over 5 Minutes",
                                    style: { fill: red }
                                },
                                {
                                    key: "plainData",
                                    label: "Plain Data",
                                    style: { fill: green }
                                },
                                {
                                    key: "richData",
                                    label: "Rich Data",
                                    style: { fill: blue }
                                }
                            ]}
                        />
                    </Grid>
                </Grid>
                <Grid>
                    <Resizable>
                        <ChartContainer timeRange={timeRange}>
                            <ChartRow height="175">
                                <YAxis
                                    id="y"
                                    label="temperature"
                                    min={0}
                                    max={200}
                                    width="75"
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