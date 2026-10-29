// Generates the festival backgrounds with Higgsfield (GPT Image 2, 1k, high quality: about 3.5 credits each).
// Safe to stop and run again: pictures that already exist are skipped.
//
//   node scripts/festival-art/generate.mjs <output folder> [occasion ...]
//
// Pictures are saved as <occasion>-<1..10>.png. Failed ones are listed at the end and retried on the next run.

import { spawn, execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { COMMON, PROMPTS } from "./prompts.mjs";

const [out, ...only] = process.argv.slice(2);
if (!out) { console.error("usage: node generate.mjs <output folder> [occasion ...]"); process.exit(1); }
fs.mkdirSync(out, { recursive: true });

const CONCURRENCY = 6;
const jobs = [];
for (const [occasion, scenes] of Object.entries(PROMPTS)) {
  if (only.length && !only.includes(occasion)) continue;
  scenes.forEach((scene, i) => {
    const file = path.join(out, `${occasion}-${i + 1}.png`);
    if (!fs.existsSync(file)) jobs.push({ file, prompt: `${scene}. ${COMMON}` });
  });
}
// Pictures already paid for and finished on Higgsfield (an earlier run that was stopped) are downloaded, not paid for again.
const finished = new Map();
try {
  const list = JSON.parse(execSync("higgsfield generate list --size 200 --json", { maxBuffer: 64 * 1024 * 1024 }).toString());
  for (const j of Array.isArray(list) ? list : []) if (j.status === "completed" && j.job_type === "gpt_image_2" && j.result_url && j.params?.prompt) finished.set(j.params.prompt, j.result_url);
} catch { /* no history: generate everything */ }
console.log(`${jobs.length} pictures to make (${jobs.filter((j) => finished.has(j.prompt)).length} already finished on Higgsfield)`);

function generate(prompt) {
  return new Promise((resolve, reject) => {
    const p = spawn("higgsfield", ["generate", "create", "gpt_image_2", "--aspect_ratio", "1:1", "--resolution", "1k", "--quality", "high", "--wait", "--wait-timeout", "15m", "--json"], { shell: process.platform === "win32" });
    // The prompt goes in through standard input: on Windows a long prompt passed as an argument gets split at its spaces.
    p.stdin.write(prompt);
    p.stdin.end();
    let stdout = "", stderr = "";
    p.stdout.on("data", (d) => (stdout += d));
    p.stderr.on("data", (d) => (stderr += d));
    p.on("close", (code) => {
      try {
        const job = JSON.parse(stdout)[0];
        if (job?.status === "completed" && job.result_url) return resolve(job.result_url);
        reject(new Error(`status ${job?.status ?? "unknown"} ${stderr.slice(0, 200)}`));
      } catch {
        reject(new Error(`exit ${code}: ${(stderr || stdout).slice(0, 200)}`));
      }
    });
  });
}

let done = 0;
const failed = [];
async function worker() {
  while (jobs.length) {
    const job = jobs.shift();
    try {
      const url = finished.get(job.prompt) ?? (await generate(job.prompt));
      const res = await fetch(url);
      if (!res.ok) throw new Error(`download ${res.status}`);
      fs.writeFileSync(job.file, Buffer.from(await res.arrayBuffer()));
      console.log(`ok ${++done} ${path.basename(job.file)}`);
    } catch (e) {
      failed.push(path.basename(job.file));
      console.log(`FAILED ${path.basename(job.file)}: ${e.message}`);
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`finished: ${done} made, ${failed.length} failed${failed.length ? ": " + failed.join(", ") : ""}`);
