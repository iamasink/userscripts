const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

const srcDir = path.resolve(__dirname, "src", "userscript");
const rootDir = path.resolve(__dirname, "src");
const outDir = path.resolve(__dirname, "dist");

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function extractMetadata(filePath) {
	try {
		const txt = fs.readFileSync(filePath, "utf8");
		const m = txt.match(/\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/);
		return m ? m[0] + "\n\n" : "";
	} catch {
		return "";
	}
}

function buildAll() {

	// current build time
	const BUILD_TIME = new Date().toISOString();

	const files = fs.readdirSync(srcDir).filter(f => f.endsWith(".ts"));
	console.log("Building:", files);
	for (const f of files) {
		const entry = path.join(srcDir, f);
		const outFile = path.join(outDir, path.basename(f, ".ts") + ".user.js");
		esbuild.buildSync({
			entryPoints: [entry],
			bundle: true,
			platform: "browser",
			format: "iife",
			outfile: outFile,
			banner: { js: extractMetadata(entry) },
			sourcemap: false,
			legalComments: "none",
			define: {
				BUILD_TIME: JSON.stringify(BUILD_TIME),
				ENV: `"dev"`
			}
		});
		console.log("done", f, "->", outFile);
	}
	console.log("All done :)", new Date().toTimeString(""));
}

buildAll();

fs.watch(rootDir, { recursive: true }, (evt, filename) => {
	if (!filename) return;
	if (!filename.endsWith(".ts")) return;
	console.log(`[watch] ${evt}: ${filename}`);
	try {
		buildAll();
	} catch (e) {
		console.log(e);
	}
});

console.log("Watching src/ ... Press Ctrl+C to exit");
