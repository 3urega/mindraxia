#!/usr/bin/env node
/**
 * Sube issues desde un batch .md generado por xp-github-issues.
 *
 * Uso:
 *   node scripts/upload-github-issues.mjs docs/issues/batch-planificacion-2026-08-30.md
 *   node scripts/upload-github-issues.mjs docs/issues/batch-*.md --dry-run
 *   node scripts/upload-github-issues.mjs path/to/batch.md --repo 3urega/mindraxia
 */

import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { spawnSync } from 'child_process';

const DEFAULT_REPO = '3urega/mindraxia';

function parseArgs(argv) {
  const args = { dryRun: false, repo: DEFAULT_REPO, file: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--dry-run') args.dryRun = true;
    else if (argv[i] === '--repo' && argv[i + 1]) args.repo = argv[++i];
    else if (!argv[i].startsWith('--')) args.file = argv[i];
  }
  return args;
}

function parseBatch(content) {
  const issues = [];
  const blocks = content.split(/\n(?=## ISSUE-\d+:)/);

  for (const block of blocks) {
    const headerMatch = block.match(/^## ISSUE-(\d+):\s*(.+?)(?:\n|$)/);
    if (!headerMatch) continue;

    const id = `ISSUE-${headerMatch[1].padStart(3, '0')}`;
    const title = headerMatch[2].trim();

    const labelsMatch = block.match(/\*\*Labels:\*\*\s*(.+?)(?:\n|$)/);
    const labels = labelsMatch
      ? [...labelsMatch[1].matchAll(/`([^`]+)`/g)].map((m) => m[1].trim())
      : ['enhancement', 'vertical-slice'];

    const priorityMatch = block.match(/\*\*Priority:\*\*\s*(P[0-2])/);
    const priority = priorityMatch ? priorityMatch[1] : null;

    const dependsMatch = block.match(/\*\*Depends on:\*\*\s*(.+?)(?:\n|$)/);
    const dependsOn = dependsMatch ? dependsMatch[1].trim() : '—';

    const bodyMatch = block.match(/```body\r?\n([\s\S]*?)```/);
    let body = bodyMatch ? bodyMatch[1].trim() : '';

    if (!body) {
      const sections = ['User story', 'Vertical slice', 'Acceptance criteria', 'Out of scope', 'Notas técnicas'];
      const parts = [];
      for (const section of sections) {
        const re = new RegExp(`### ${section}\\s*\\n([\\s\\S]*?)(?=\\n### |\\n---|$)`);
        const m = block.match(re);
        if (m) parts.push(`## ${section}\n${m[1].trim()}`);
      }
      body = parts.join('\n\n') || block.trim();
    }

    if (priority) {
      body = `**Prioridad:** ${priority}\n**Depende de:** ${dependsOn}\n**Batch ID:** ${id}\n\n${body}`;
    }

    issues.push({ id, title, labels, body, priority, dependsOn });
  }

  return issues;
}

function runGh(args, input) {
  const result = spawnSync('gh', args, {
    encoding: 'utf8',
    input,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return result;
}

function ensureGhAuth() {
  const status = runGh(['auth', 'status']);
  if (status.status !== 0) {
    console.error('❌ gh no autenticado. Ejecuta: gh auth login');
    console.error(status.stderr || status.stdout);
    process.exit(1);
  }
}

function ensureLabels(repo, labels) {
  for (const label of labels) {
    const exists = runGh(['label', 'list', '--repo', repo, '--search', label, '--limit', '1']);
    if (!exists.stdout.includes(label)) {
      console.log(`  🏷️  Creando label: ${label}`);
      runGh(['label', 'create', label, '--repo', repo, '--color', '0E8A16', '--force']);
    }
  }
}

function createIssue(repo, issue, dryRun) {
  const fullTitle = issue.title.startsWith('ISSUE-') ? issue.title : `${issue.id}: ${issue.title}`;

  if (dryRun) {
    console.log(`\n[DRY-RUN] ${fullTitle}`);
    console.log(`  Labels: ${issue.labels.join(', ')}`);
    console.log(`  Body (${issue.body.length} chars)`);
    return { ok: true, url: '(dry-run)', number: null };
  }

  const tmpBody = join(tmpdir(), `gh-issue-${issue.id}.md`);
  writeFileSync(tmpBody, issue.body, 'utf8');

  const args = [
    'issue', 'create',
    '--repo', repo,
    '--title', fullTitle,
    '--body-file', tmpBody,
  ];

  for (const label of issue.labels) {
    args.push('--label', label);
  }

  const result = runGh(args);
  try { unlinkSync(tmpBody); } catch { /* ignore */ }

  if (result.status !== 0) {
    return { ok: false, error: result.stderr || result.stdout };
  }

  const urlMatch = (result.stdout || '').match(/https:\/\/github\.com\/[^\s]+/);
  return { ok: true, url: urlMatch ? urlMatch[0] : result.stdout.trim() };
}

function main() {
  const { file, dryRun, repo } = parseArgs(process.argv);

  if (!file) {
    console.error('Uso: node scripts/upload-github-issues.mjs <batch.md> [--dry-run] [--repo owner/repo]');
    process.exit(1);
  }

  const content = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const issues = parseBatch(content);

  if (issues.length === 0) {
    console.error('❌ No se encontraron issues en el batch. ¿Formato correcto (## ISSUE-NNN:)?');
    process.exit(1);
  }

  console.log(`📄 Batch: ${file}`);
  console.log(`📦 Repo:  ${repo}`);
  console.log(`🔢 Issues: ${issues.length}`);
  if (dryRun) console.log('🧪 Modo dry-run (no se crearán issues)\n');

  if (!dryRun) ensureGhAuth();

  const allLabels = [...new Set(issues.flatMap((i) => i.labels))];
  if (!dryRun && allLabels.length) ensureLabels(repo, allLabels);

  const results = [];
  for (const issue of issues) {
    console.log(`\n➡️  ${issue.id}: ${issue.title}`);
    const result = createIssue(repo, issue, dryRun);
    if (result.ok) {
      console.log(`  ✅ ${result.url}`);
      results.push({ ...issue, url: result.url, status: 'created' });
    } else {
      console.error(`  ❌ Error: ${result.error}`);
      results.push({ ...issue, status: 'failed', error: result.error });
    }
  }

  const reportPath = file.replace(/\.md$/, '-upload-report.md');
  const report = [
    `# Upload report — ${new Date().toISOString()}`,
    ``,
    `> Batch: \`${file}\``,
    `> Repo: [${repo}](https://github.com/${repo}/issues)`,
    ``,
    `| ID | Título | Estado | URL |`,
    `|----|--------|--------|-----|`,
    ...results.map((r) => `| ${r.id} | ${r.title} | ${r.status} | ${r.url || r.error || '—'} |`),
  ].join('\n');

  writeFileSync(reportPath, report, 'utf8');
  console.log(`\n📋 Reporte: ${reportPath}`);

  const failed = results.filter((r) => r.status === 'failed');
  if (failed.length) process.exit(1);
}

main();
