import React from 'react';
import {
  Paper
} from '@mui/material';
import { Bar } from 'react-chartjs-2';

import EventStream from '../services/EventStream';

const rate = 200;

class PriorityGraph extends React.Component {
    state = {
        time: new Date(),
        priortyEvents: [],
        stopRequest: false,
        requestMade: false
    };

    componentDidMount() {
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
                        // Raw events
                        //debugger;

                        var index = this.state.priortyEvents.findIndex(item => item[0] === `${newData[0].data.company} - ${newData[0].data.priority}`);

                        if (index > -1) {
                            let newEvents = this.state.priortyEvents;
                            newEvents[index][1]++;
                            this.setState({ priortyEvents: newEvents });
                        } else {
                            let newEvents = this.state.priortyEvents;
                            newEvents.push([
                                `${newData[0].data.company} - ${newData[0].data.priority}`,
                                1
                            ]);
                            this.setState({ priortyEvents: newEvents });
                        }
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
        const data = {
            labels: this.state.priortyEvents.map((item) => {
                return item[0];
            }),
            datasets: [
                {
                    label: 'Events',
                    data: this.state.priortyEvents.map((item) => {
                        return item[1];
                    }),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };

        const options = {
            indexAxis: 'y',
            // Elements options apply to all of the options unless overridden in a dataset
            // In this case, we are setting the border of each horizontal bar to be 2px wide
            elements: {
                bar: {
                    borderWidth: 2,
                },
            },
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                },
                title: {
                    display: true,
                    text: 'Count of Priority Events',
                },
            },
        };

        return (
            <Paper style={{margin: 20, padding: 20, width: 500}}>
                <div className='header'>
                    <h1 className='title'>{this.props.name}</h1>
                </div>
                <Bar data={data} options={options} />
            </Paper>
        );
    }
}

// Export example
export default PriorityGraph;