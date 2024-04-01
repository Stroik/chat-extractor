import { exec } from 'child_process';

export const openUrl = (url: string) => {
  switch (process.platform) {
    case 'darwin':
      exec(`open ${url}`);
      break;
    case 'win32':
      exec(`start ${url}`);
      break;
    case 'linux':
      exec(`xdg-open ${url}`);
      break;
    default:
      console.log(`Platform ${process.platform} is not supported for automatic URL opening.`);
      break;
  }
};
