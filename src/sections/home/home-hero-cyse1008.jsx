import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { useState } from 'react';
import CustomComponent from './custom-component';
export function HomeHeroCYSE1008() {
  const theme = useTheme();
  const [count, setCount] = useState(0);

  return (
    <>
      {/* <div>Hello World</div> */}

      <Box
        component="h1"
        display="flex"
        flexWrap="wrap"
        justifyContent="center"
        alignItems="flex-start"
        sx={{
          ...theme.typography.h1,
          my: 0,
          mx: 'auto',
          maxWidth: 780,
          color: '#32C282',
          fontFamily: theme.typography.fontSecondaryFamily,
          [theme.breakpoints.up('md')]: { fontSize: 62, lineHeight: '90px' },
        }}
      >
        Meka's store
      </Box>

      <Button variant="contained" onClick={() => setCount(count + 1)}>
        {' '}
        Click me! {count}
      </Button>


      <CustomComponent/>
    </>
  );
}
