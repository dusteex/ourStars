import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Replace '<REPO_NAME>' with the actual name of your GitHub repository
const repoName = '/ourStars/';

export default defineConfig({
  plugins: [react()],
  base: repoName, // Set the base path
});