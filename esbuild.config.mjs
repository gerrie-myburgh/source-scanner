delete process.env.CARGO_BUILD_MESSAGE_FORMAT;
delete process.env.RUSTFLAGS;

import esbuild from "esbuild";
import process from "process";
import builtins from 'builtin-modules'
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const banner = `// Source Scanner`; // your banner
const prod = (process.argv[2] === 'production');

// Build Rust/WASM first
try {
    console.log('📦 Building Rust/WASM...');
    
    // Clear any potential cargo config that might affect this
    const cleanEnv = { ...process.env };
    delete cleanEnv.CARGO_BUILD_MESSAGE_FORMAT;
    delete cleanEnv.RUSTFLAGS;
    
    execSync('wasm-pack build --target web --out-dir pkg', { 
        stdio: 'inherit',
        env: cleanEnv
    });
    console.log('✅ Rust/WASM build complete');
} catch (error) {
    console.error('❌ Rust/WASM build failed');
    process.exit(1);
}

// WASM loader plugin for esbuild
let wasmPlugin = {
    name: 'wasm',
    setup(build) {
        build.onResolve({ filter: /\.wasm$/ }, args => {
            if (args.resolveDir === '') return;
            return {
                path: path.isAbsolute(args.path) ? args.path : path.join(args.resolveDir, args.path),
                namespace: 'wasm-binary',
            }
        });

        build.onLoad({ filter: /.*/, namespace: 'wasm-binary' }, async (args) => ({
            contents: await fs.promises.readFile(args.path),
            loader: 'binary',
        }));
    },
};

// Run esbuild
esbuild.build({
    banner: { js: banner },
    entryPoints: ['main.ts'],
    bundle: true,
    external: [
        'obsidian',
        'electron',
        '@codemirror/autocomplete',
        '@codemirror/collab',
        '@codemirror/commands',
        '@codemirror/language',
        '@codemirror/lint',
        '@codemirror/search',
        '@codemirror/state',
        '@codemirror/view',
        '@lezer/common',
        '@lezer/highlight',
        '@lezer/lr',
        ...builtins
    ],
    format: 'cjs',
    watch: !prod,
    target: 'es2021',
    logLevel: "info",
    sourcemap: prod ? false : 'inline',
    treeShaking: true,
    outfile: 'main.js',
    plugins: [wasmPlugin], // Only use the custom plugin, no wasmPack
}).catch(() => process.exit(1));