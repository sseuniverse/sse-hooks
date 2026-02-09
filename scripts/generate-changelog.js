import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// --- 0. ESM Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. Configuration ---
const REPO_URL = "https://github.com/sseuniverse/sse-hooks"; 
const PACKAGE_JSON_PATH = path.resolve(__dirname, '../packages/hooks/package.json');
const CHANGELOG_PATH = path.resolve(__dirname, '../CHANGELOG.md');

const START_MARKER = "<!--CHANGELOG:START-->";
const END_MARKER = "<!--CHANGELOG:END-->";

const HOOK_CATEGORIES = {
  'Media & Network': ['network', 'fetch', 'audio', 'video', 'stream', 'recording', 'media', 'connection', 'online', 'conference', 'screen', 'broadcast'],
  'UI & DOM': ['window', 'dom', 'document', 'resize', 'scroll', 'click', 'mouse', 'element', 'portal', 'breakpoint', 'media query', 'animation', 'observer', 'css', 'measure'],
  'State & Lifecycle': ['state', 'effect', 'mount', 'unmount', 'timeout', 'interval', 'toggle', 'step', 'counter', 'countdown', 'lifecycle', 'reactive', 'computed'],
  'System & Utilities': ['script', 'clipboard', 'navigator', 'battery', 'vibration', 'device', 'os', 'ssr', 'ref', 'guard', 'symbol', 'copy', 'cookie', 'storage', 'kbd']
};

const SECTIONS = {
  CLI: ['cli', 'command', 'init', 'add command', 'list command'],
  DOCS: ['doc', 'documentation', 'website', 'nuxt', 'readme', 'license', 'changelog', 'site'],
};

// --- 2. Helpers ---

function getArgs() {
  const args = process.argv.slice(2);
  let fromTag = null;
  let toTag = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-f' || arg === '--f' || arg === '--from') fromTag = args[i + 1];
    if (arg === '-t' || arg === '--t' || arg === '--to') toTag = args[i + 1];
  }

  // Fallback for positional args
  if (!toTag && args.length === 1 && !args[0].startsWith('-')) {
    toTag = args[0];
  }

  return { fromTag, toTag };
}

function checkTagExists(tag) {
  try {
    execSync(`git rev-parse ${tag}`, { stdio: 'ignore' });
    return tag;
  } catch (e) {
    const vTag = `v${tag}`;
    try {
      execSync(`git rev-parse ${vTag}`, { stdio: 'ignore' });
      return vTag;
    } catch (e2) {
      return null;
    }
  }
}

function getTagDate(tag) {
  if (!tag) return new Date().toISOString().split('T')[0];
  const safeTag = checkTagExists(tag);
  if (!safeTag) return new Date().toISOString().split('T')[0];
  try {
    const dateStr = execSync(`git log -1 --format=%ai ${safeTag}`).toString().trim();
    return dateStr.split(' ')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

function getVersionAndDate(toTag) {
  let version = 'Unreleased';
  let date = new Date().toISOString().split('T')[0];

  try {
    if (fs.existsSync(PACKAGE_JSON_PATH)) {
      const fileContent = fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8');
      const pkg = JSON.parse(fileContent);
      version = pkg.version;
    }
  } catch (e) {}

  if (toTag) {
    version = toTag.replace(/^v/, '');
    date = getTagDate(toTag);
  }

  return { version, date, tagName: `v${version}` };
}

function getGitLog(fromTag, toTag) {
  let range = '';
  const safeFrom = fromTag ? checkTagExists(fromTag) : null;
  const safeTo = toTag ? checkTagExists(toTag) : null;

  try {
    if (safeFrom && safeTo) {
      range = `${safeFrom}...${safeTo}`;
    } else if (safeTo) {
      try {
        const prevTag = execSync(`git describe --abbrev=0 --tags ${safeTo}^`).toString().trim();
        range = `${prevTag}...${safeTo}`;
      } catch (e) {
        range = safeTo; 
      }
    } else {
      try {
        const lastTag = execSync('git describe --tags --abbrev=0').toString().trim();
        range = `${lastTag}...HEAD`;
      } catch (e) {
        range = ''; 
      }
    }

    console.log(`🔍 Analyzing git range: ${range || 'ALL COMMITS'}`);
    const cmd = `git log ${range} --no-merges --format="___COMMIT___%n%s%n%b%n___SHA___%h"`;
    return { log: execSync(cmd).toString(), range };
  } catch (e) {
    console.error(`❌ Git Error: ${e.message.split('\n')[0]}`);
    return { log: '', range: '' };
  }
}

function cleanDescription(text) {
  const hookMatch = text.match(/\b(use[A-Z][a-zA-Z0-9]*)\b/);
  const hookName = hookMatch ? hookMatch[1] : null;
  
  let desc = text.replace(/^(feat|fix|chore|docs|refactor|perf|test)(\(.+\))?:\s*/i, '')
                 .replace(/^[-*]\s*/, '')
                 .trim();

  if (hookName) {
    desc = desc.replace(/^(Implemented|Added|Created|Developed|Introduced)\s+/i, '')
               .replace(new RegExp(`\`?${hookName}\`?`, 'i'), '') 
               .replace(/\s+(hook|utility)\s+/i, ' ') 
               .replace(/^(for|to|which)\s+/i, '')
               .trim();
    if (desc.length > 0) desc = desc.charAt(0).toUpperCase() + desc.slice(1);
    return `\`${hookName}\`: ${desc}`;
  }

  return desc.charAt(0).toUpperCase() + desc.slice(1);
}

function parseCommits(logOutput) {
  const items = [];
  const rawCommits = logOutput.split('___COMMIT___').filter(Boolean);

  rawCommits.forEach(commit => {
    const [content, shaPart] = commit.split('___SHA___');
    const sha = shaPart ? shaPart.trim() : '';
    const lines = content.trim().split('\n');
    const subject = lines[0];
    const body = lines.slice(1).join('\n');
    
    const bullets = body.split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('-') || l.startsWith('*'))
      .map(l => cleanDescription(l));

    if (bullets.length > 0) {
      bullets.forEach(b => items.push({ text: b, raw: subject + " " + body, sha }));
    } else {
      items.push({ text: cleanDescription(subject), raw: subject, sha });
    }
  });
  return items;
}

function categorizeItems(items) {
  const buckets = {
    hooks: { 'Media & Network': [], 'UI & DOM': [], 'State & Lifecycle': [], 'System & Utilities': [], 'Other': [] },
    cli: [],
    docs: [],
    improvements: [] 
  };
  const seen = new Set();

  items.forEach(item => {
    if (seen.has(item.text)) return;
    seen.add(item.text);

    const combined = (item.text + " " + item.raw).toLowerCase();
    const shaLink = REPO_URL ? ` ([${item.sha}](${REPO_URL}/commit/${item.sha}))` : ` (${item.sha})`;
    const textWithSha = `${item.text}${shaLink}`;

    if (item.text.includes('use') || item.raw.includes('use')) {
        let matched = false;
        for (const [catName, keywords] of Object.entries(HOOK_CATEGORIES)) {
            if (keywords.some(k => combined.includes(k))) {
                buckets.hooks[catName].push(textWithSha);
                matched = true;
                break;
            }
        }
        if (!matched) buckets.hooks['Other'].push(textWithSha);
        return; 
    }

    if (SECTIONS.CLI.some(k => combined.includes(k))) { buckets.cli.push(textWithSha); return; }
    if (SECTIONS.DOCS.some(k => combined.includes(k))) { buckets.docs.push(textWithSha); return; }
    buckets.improvements.push(textWithSha);
  });
  return buckets;
}

function generateMarkdown(versionData, buckets, range) {
  const { version, date, tagName } = versionData;
  let md = `## [v${version}] - ${date}\n\n`;
  
  let summary = [];
  if (buckets.cli.length > 0) summary.push("CLI updates");
  if (Object.values(buckets.hooks).flat().length > 0) summary.push("new hooks");
  if (buckets.docs.length > 0) summary.push("documentation improvements");
  
  if (summary.length > 0) md += `This release includes ${summary.join(', ')}.\n\n`;

  const hasHooks = Object.values(buckets.hooks).some(arr => arr.length > 0);
  
  if (hasHooks || buckets.cli.length > 0) md += `### New Features\n\n`;

  if (hasHooks) {
    md += `#### New Hooks\n`;
    for (const [cat, items] of Object.entries(buckets.hooks)) {
      if (items.length === 0) continue;
      if (cat === 'Other' && items.length === 0) continue;
      md += `* **${cat}**\n`;
      items.forEach(i => md += `  - ${i}\n`);
    }
    md += `\n`;
  }

  if (buckets.cli.length > 0) {
    md += `#### CLI\n`;
    buckets.cli.forEach(i => md += `- ${i}\n`);
    md += `\n`;
  }

  if (buckets.docs.length > 0) {
    md += `### Documentation\n`;
    buckets.docs.forEach(i => md += `- ${i}\n`);
    md += `\n`;
  }

  if (buckets.improvements.length > 0) {
    md += `### Improvements & Fixes\n`;
    buckets.improvements.forEach(i => md += `- ${i}\n`);
    md += `\n`;
  }

  if (range && REPO_URL) {
      const cleanRange = range.replace('HEAD', tagName); 
      const link = range.includes('...') ? `compare/${cleanRange}` : `releases/tag/${tagName}`;
      md += `**Full Changelog**: ${REPO_URL}/${link}\n`;
  }
  
  md += `\n---\n\n`; 
  return md;
}

// --- 3. Main Execution ---

try {
  const { fromTag, toTag } = getArgs();
  const versionData = getVersionAndDate(toTag);
  
  if (!fs.existsSync(CHANGELOG_PATH)) {
      console.error(`❌ Error: CHANGELOG.md not found at ${CHANGELOG_PATH}`);
      process.exit(1);
  }
  let existingContent = fs.readFileSync(CHANGELOG_PATH, 'utf-8');
  
  if (!existingContent.includes(START_MARKER) || !existingContent.includes(END_MARKER)) {
      console.error(`❌ Error: CHANGELOG.md must contain ${START_MARKER} and ${END_MARKER}`);
      process.exit(1);
  }

  const { log, range } = getGitLog(fromTag, toTag);
  if (!log) {
    console.log("ℹ️ No changes found in git log.");
    process.exit(0);
  }

  const items = parseCommits(log);
  const buckets = categorizeItems(items);
  const newEntry = generateMarkdown(versionData, buckets, range);

  // --- REPLACEMENT OR INSERTION LOGIC ---
  
  // Regex to find "## [1.1.0]" case insensitive
  // matching strict opening bracket to avoid matching 1.1.0-beta
  const versionHeaderRegex = new RegExp(`## \\[${versionData.version}\\]`, 'i');
  const match = existingContent.match(versionHeaderRegex);

  let finalContent;

  if (match) {
    // UPDATE EXISTING ENTRY
    console.log(`♻️  Version ${versionData.version} already exists in CHANGELOG. Updating entry...`);

    const startIndex = match.index;
    
    // Find the end of this section (Next "## [" or End Marker)
    const remainingText = existingContent.slice(startIndex + match[0].length);
    const nextVersionIndex = remainingText.search(/## \[/);
    const endMarkerIndex = remainingText.indexOf(END_MARKER);
    
    let endIndex = -1;

    // Calculate absolute End Index of the current section
    if (nextVersionIndex !== -1 && endMarkerIndex !== -1) {
        endIndex = startIndex + match[0].length + Math.min(nextVersionIndex, endMarkerIndex);
    } else if (nextVersionIndex !== -1) {
        endIndex = startIndex + match[0].length + nextVersionIndex;
    } else if (endMarkerIndex !== -1) {
        endIndex = startIndex + match[0].length + endMarkerIndex;
    }

    if (endIndex !== -1) {
        const before = existingContent.slice(0, startIndex);
        const after = existingContent.slice(endIndex);
        
        // Remove extra whitespace around replacement to keep clean
        finalContent = `${before.trimEnd()}\n\n${newEntry.trimEnd()}\n\n${after.trimStart()}`;
    } else {
        // Fallback: This shouldn't happen if markers exist, but safe append
        finalContent = existingContent.replace(START_MARKER, `${START_MARKER}\n\n${newEntry}`);
    }

  } else {
    // INSERT NEW ENTRY
    console.log(`🆕 Version ${versionData.version} is new. Appending to CHANGELOG...`);
    const [headerPart, contentPart] = existingContent.split(START_MARKER);
    const cleanContentPart = contentPart ? contentPart.replace(START_MARKER, '') : ''; 
    finalContent = `${headerPart}${START_MARKER}\n\n${newEntry}${cleanContentPart}`;
  }

  fs.writeFileSync(CHANGELOG_PATH, finalContent);
  console.log(`✅ CHANGELOG.md successfully processed for v${versionData.version}`);

} catch (e) {
  console.error("❌ Error:", e.message);
}