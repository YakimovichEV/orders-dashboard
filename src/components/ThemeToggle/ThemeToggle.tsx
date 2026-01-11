import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { IconButton, Tooltip } from '@mui/material';

import { useThemeMode } from '@/theme/useThemeMode';

export function ThemeToggle() {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Tooltip
      title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <IconButton
        aria-label={
          mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
        }
        size="medium"
        sx={{
          color: mode === 'light' ? '#5e35b1' : '#ffd54f',
          '&:hover': {
            backgroundColor:
              mode === 'light'
                ? 'rgba(94, 53, 177, 0.08)'
                : 'rgba(255, 213, 79, 0.08)',
          },
        }}
        onClick={toggleTheme}
      >
        {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
