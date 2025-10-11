import { join } from "path";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      "{src,pages,components}/**/*!(*.stories|*.spec).{ts,tsx,html}"
    ),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
