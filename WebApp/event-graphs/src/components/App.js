import * as React from 'react';
import {
  Box,
  Tabs,
  Tab
} from '@mui/material';

import TabPanel from './TabPanel';
import DeviceDataGraph from './DeviceDataGraph';

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function App() {
  const [value, setValue] = React.useState(0);

  const style = {
    root: {
      flexGrow: 1,
      bgcolor: 'background.paper',
      display: 'flex',
      height: "99vh",
      width: "99vw"
    },
    tabPanels: {
      width: "100%"
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={style.root}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        sx={{ borderRight: 1, borderColor: 'divider', minWidth: '130px' }}
      >
        <Tab label="Company #1" {...a11yProps(0)} />
        <Tab label="Company #2" {...a11yProps(1)} />
        <Tab label="Company #3" {...a11yProps(2)} />
      </Tabs>
      <TabPanel style={style.tabPanels} value={value} index={0}>
        <DeviceDataGraph eventQueue={"company1.devicedata.sterilizers.inbound"} />
      </TabPanel>
      <TabPanel style={style.tabPanels} value={value} index={1}>
        <DeviceDataGraph eventQueue={"company2.devicedata.sterilizers.inbound"} />
      </TabPanel>
      <TabPanel style={style.tabPanels} value={value} index={2}>
        <DeviceDataGraph eventQueue={"company3.devicedata.sterilizers.inbound"} />
      </TabPanel>
    </Box>
  );
}