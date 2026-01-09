import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: 'src/index.ts',
  outDir: 'dist',
  format: ["esm", "cjs"],
  target: 'es2020',
  sourcemap: true,
  clean: true,
  dts: true,
  noExternal: ["java-parser"],
});