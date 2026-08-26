import { LearningJourney } from '../types/alter';

/**
 * Generate an Obsidian-ready Knowledge Graph Markdown file with YAML frontmatter,
 * bidirectional [[wikilinks]], tags, and study checklists.
 */
export function exportToObsidianMarkdown(journey: LearningJourney): string {
  const { advisorData, librarianData, tutorData } = journey;

  const phases = advisorData?.phases || [];
  const cutList = advisorData?.cutList || [];
  const sources = librarianData?.sources || [];
  const vaultNotes = librarianData?.vaultNotes || [];
  const feynmanSessions = tutorData?.feynmanSessions || [];

  let md = `---
title: "${journey.title}"
topic: "${journey.topic}"
destination: "${journey.destination}"
baseline: "${journey.baseline}"
hours_per_week: ${journey.hoursPerWeek}
depth: "${journey.depth}"
streak_days: ${journey.streakDays}
created: "${journey.createdAt}"
tags:
  - altor/university
  - autodidact/${journey.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
---

# 🎓 [[${journey.title}]]
> **Destination:** ${journey.destination}
> **Estimated Commitment:** ${journey.hoursPerWeek} hrs/week • ${advisorData?.estimatedWeeks || 6} Weeks Total

---

## 🗺️ Master Curriculum Syllabus

${phases.map((phase) => `
### Phase ${phase.phaseNumber}: [[${phase.title}]]
- **Duration:** \`${phase.duration}\`
- **Objective:** ${phase.objective}
- **Core Concepts:**
${(phase.coreConcepts || []).map((c) => `  - [[${c}]]`).join('\n')}

#### Proof-of-Work Checkpoint
- [${phase.checkpoint?.completed ? 'x' : ' '}] **${phase.checkpoint?.title || 'Checkpoint'}**
  > ${phase.checkpoint?.description || ''}
`).join('\n')}

---

## 🚫 The Cut List (Ruthless Efficiency)
*Sandeep Swadia Heuristic: Topics consciously omitted to protect high-leverage attention.*

${cutList.map((cut) => `
- ❌ **SKIP:** \`${cut.topic}\`
  - **Reason:** ${cut.reasonToSkip}
  - **High-Signal Alternative:** ${cut.alternativeFocus}
`).join('\n')}

---

## 📚 [[Knowledge Librarian]] Grounded Sources

| Signal Score | Type | Title & Link | Author | Key Takeaway |
| :---: | :---: | :--- | :--- | :--- |
${sources.map((s) => `| **${s.signalScore}/10** | \`${s.type.toUpperCase()}\` | [${s.title}](${s.url || '#'}) | ${s.authorOrCreator} | ${s.keyTakeaway} |`).join('\n')}

---

## 🧠 Socratic Insights & Mental Models
${vaultNotes.map((note) => `
### [[${note.title}]] (\`${note.tags?.join(', ') || 'Note'}\`)
${note.content}
`).join('\n\n')}

---

## 💡 Feynman Synthesis Sessions
${feynmanSessions.map((session) => `
### Concept: [[${session.concept}]]
- **Clarity Score:** \`${session.clarityScore}/100\` • **Accuracy Score:** \`${session.accuracyScore}/100\`
- **Explanation:**
  > ${session.userExplanation}
- **Identified Blind Spots:**
${(session.blindSpots || []).map((b) => `  - ⚠️ ${b}`).join('\n')}
`).join('\n')}

---
*Exported from Altor — University in a Box on ${new Date().toLocaleDateString()}*
`;

  return md;
}

/**
 * Trigger immediate download of the Obsidian markdown file in the browser
 */
export function downloadObsidianMarkdown(journey: LearningJourney): void {
  const content = exportToObsidianMarkdown(journey);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filename = `Altor-${journey.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-Obsidian.md`;
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate CSV formatted for direct import into Notion Databases
 */
export function exportToNotionCSV(journey: LearningJourney): string {
  const headers = ['Phase Number', 'Phase Title', 'Duration', 'Checkpoint Deliverable', 'Completed', 'Core Concepts'];
  const phases = journey.advisorData?.phases || [];
  const rows = phases.map((p) => [
    p.phaseNumber,
    `"${p.title.replace(/"/g, '""')}"`,
    `"${p.duration}"`,
    `"${(p.checkpoint?.title || '').replace(/"/g, '""')}: ${(p.checkpoint?.description || '').replace(/"/g, '""')}"`,
    p.checkpoint?.completed ? 'Yes' : 'No',
    `"${(p.coreConcepts || []).join(', ').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Trigger immediate download of the Notion CSV file in the browser
 */
export function downloadNotionCSV(journey: LearningJourney): void {
  const content = exportToNotionCSV(journey);
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filename = `Altor-${journey.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-Notion.csv`;
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
