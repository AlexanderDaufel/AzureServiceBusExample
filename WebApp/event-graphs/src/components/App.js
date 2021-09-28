import * as React from 'react';
import {
  Box,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import StopCircleIcon from '@mui/icons-material/StopCircle';

import DeviceDataGraph from './DeviceDataGraph';
import PriorityGraph from './PriorityGraph';

export default function App() {
  const [view, setView] = React.useState(1);
  const [start, setStart] = React.useState(false);

  const style = {
    root: {
      flexGrow: 1,
      bgcolor: 'background.paper',
      display: 'flex',
      height: "99vh",
      width: "99vw"
    }
  };

  const handleChange = (event) => {
    setView(event.target.value);
  };

  return (
    <Box sx={style.root}>
      <Grid style={{width: "100vw"}}>
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          style={{padding: 20}}
        >
          <IconButton aria-label="start">
            <PlayCircleFilledWhiteIcon fontSize="large" style={(start ? {color: "green"} : {} )} onClick={(e) => setStart(true)} />
          </IconButton>
          <IconButton aria-label="stop">
            <StopCircleIcon fontSize="large" style={(!start ? {color: "red"} : {} )} onClick={(e) => setStart(false)} />
          </IconButton>
          <FormControl style={{marginLeft: 20}}>
            <InputLabel id="demo-simple-select-label">View</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={view}
              label="View"
              onChange={handleChange}
            >
              <MenuItem value={1}>All</MenuItem>
              <MenuItem value={2}>Company 1</MenuItem>
              <MenuItem value={3}>Company 2</MenuItem>
              <MenuItem value={4}>Company 3</MenuItem>
              <MenuItem value={5}>Distributor</MenuItem>
              <MenuItem value={6}>Midmark</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Grid
            style={(view === 1 || view === 6 ? {} : {display: "none"})}
            item xs={(view === 1 ? 4 : 12)} container direction="row" justifyContent="center" alignItems="center"
          >
            <PriorityGraph
              name={"Midmark Aggregated Data"}
              runStream={start}
              eventQueue={"midmark.predictive_maintenance.sterilizers.inbound"}
            />
          </Grid>
          <Grid
            style={(view === 1 || view === 5 ? {} : {display: "none"})}
            item xs={(view === 1 ? 4 : 12)} container direction="row" justifyContent="center" alignItems="center"
          >
            <PriorityGraph
              name={"Distributor 1 Aggregated Data"}
              runStream={start}
              eventQueue={"distrubutor.devicedata.sterilizers.inbound"}
            />
          </Grid>
          <Grid
            style={(view === 1 || view === 2 || view === 5 || view === 6 ? {} : {display: "none"})}
            xs={4}
          >
            <DeviceDataGraph
              name={"Company #1 Notifications"}
              runStream={start}
              eventQueue={"company1.devicedata.sterilizers.inbound"}
            />
          </Grid>
          <Grid
            style={(view === 1 || view === 3 || view === 5 || view === 6 ? {} : {display: "none"})}
            xs={4}
          >
            <DeviceDataGraph
              name={"Company #2 Notifications"}
              runStream={start}
              eventQueue={"company2.devicedata.sterilizers.inbound"}
            />
          </Grid>
          <Grid
            style={(view === 1 || view === 4 || view === 6 ? {} : {display: "none"})}
            xs={4}
          >
            <DeviceDataGraph
              name={"Company #3 Notifications"}
              runStream={start}
              eventQueue={"company3.devicedata.sterilizers.inbound"}
            />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}