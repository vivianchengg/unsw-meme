import { red } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';
import React from 'react';

// A custom theme for this app
const lightTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff',
    },
  },
});

export default lightTheme;

export const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#BB86FC',
    },
    secondary: {
      main: '#03DAC6',
    },
    error: {
      main: '#CF6679',
    },
    background: {
      main: '#36454F',
    },
    text: {
      main: '#fff',
    }
  },
});

export const ThemeButton = ({ theme, toggleTheme }) => {
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
    </button>
  );
};
