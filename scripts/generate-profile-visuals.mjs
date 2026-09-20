import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOGIN = process.env.GITHUB_USER_NAME || "ma-nucho-pro";
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const OUTPUT_DIR = path.join(ROOT, "assets", "github");
const PROJECT_DIR = path.join(ROOT, "assets", "projects");
const HEADERS = {
  accept: "application/vnd.github+json",
  "user-agent": "ma-nucho-pro-profile-visuals",
  ...(TOKEN ? { authorization: "Bearer " + TOKEN } : {})
};

const colors = {
  background: "#0d1117",
  surface: "#161b22",
  border: "#30363d",
  ink: "#f0eadf",
  muted: "#8b949e",
  gold: "#d5a935",
  blue: "#58a6ff",
  purple: "#bc8cff",
  green: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"]
};

const projectArt = [
  { key: "wife", short: "W", name: "Wife", accent: "#c084fc", kind: "memory" },
  { key: "manumcp", short: "MCP", name: "ManuMCP", accent: "#58a6ff", kind: "mcp" },
  { key: "manuloop", short: "↻", name: "ManuLOOP", accent: "#39d353", kind: "loop" },
  { key: "clear-mirror", short: "CM", name: "Clear Mirror", accent: "#d5a935", kind: "mirror" },
  { key: "shotpilot", short: "SP", name: "ShotPilot", accent: "#ff7b72", kind: "pilot" },
  { key: "arkea", short: "A", name: "ARKEA IA", accent: "#d5a935", kind: "arkea" },
  { key: "supervisorllm", short: "S", name: "SupervisorLLM", accent: "#f778ba", kind: "shield" },
  { key: "wonder-woman", short: "WW", name: "Wonder Woman", accent: "#ff7b72", kind: "star" },
  { key: "wingman", short: "W", name: "Wingman", accent: "#79c0ff", kind: "wings" },
  { key: "gta-manucho", short: "GTA", name: "GTA-MANUCHO", accent: "#ffa657", kind: "city" }
];

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function number(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function svgDocument(width, height, title, description, body) {
  return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
    "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" + width + "\" height=\"" + height +
    "\" viewBox=\"0 0 " + width + " " + height + "\" role=\"img\" aria-labelledby=\"title description\">\n" +
    "  <title id=\"title\">" + escapeXml(title) + "</title>\n" +
    "  <desc id=\"description\">" + escapeXml(description) + "</desc>\n" +
    "  " + body + "\n</svg>\n";
}

function roundedRect(x, y, width, height, fill, stroke, radius) {
  return "<rect x=\"" + x + "\" y=\"" + y + "\" width=\"" + width + "\" height=\"" + height +
    "\" rx=\"" + (radius || 12) + "\" fill=\"" + (fill || colors.surface) +
    "\" stroke=\"" + (stroke || colors.border) + "\" />";
}

function projectMark(kind, accent) {
  const stroke = "stroke=\"" + accent + "\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"";
  if (kind === "memory") return "<circle cx=\"48\" cy=\"38\" r=\"20\" " + stroke + "/><circle cx=\"48\" cy=\"38\" r=\"7\" fill=\"" + accent + "\"/><path d=\"M48 14v8M48 54v8M24 38h8M64 38h8\" " + stroke + "/>";
  if (kind === "mcp") return "<path d=\"M25 29h22v18H25zM47 38h12M59 32v12M59 32h10M59 44h10\" " + stroke + "/><circle cx=\"75\" cy=\"32\" r=\"4\" fill=\"" + accent + "\"/><circle cx=\"75\" cy=\"44\" r=\"4\" fill=\"" + accent + "\"/>";
  if (kind === "loop") return "<path d=\"M69 29a23 23 0 1 0 0 18\" " + stroke + "/><path d=\"m68 20 2 13-13-2\" " + stroke + "/><path d=\"m28 56-2-13 13 2\" " + stroke + "/>";
  if (kind === "mirror") return "<path d=\"M48 14 72 27v23L48 64 24 50V27z\" " + stroke + "/><path d=\"M48 14v50M24 27l24 13 24-13M24 50l24-13 24 13\" " + stroke + "/>";
  if (kind === "pilot") return "<circle cx=\"48\" cy=\"38\" r=\"24\" " + stroke + "/><path d=\"M48 10v14M48 52v14M20 38h14M62 38h14M42 44l12-12-4 16z\" " + stroke + "/>";
  if (kind === "arkea") return "<path d=\"M27 58 48 16l18 42-18-11z\" fill=\"" + accent + "\" opacity=\".9\"/><path d=\"m48 16 24 36-24-5-18 11z\" fill=\"none\" stroke=\"" + colors.ink + "\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M34 61h33\" " + stroke + "/>";
  if (kind === "shield") return "<path d=\"M48 14 71 23v17c0 15-10 25-23 31-13-6-23-16-23-31V23z\" " + stroke + "/><path d=\"m36 40 8 8 17-18\" " + stroke + "/>";
  if (kind === "star") return "<path d=\"m48 13 7 17 18 2-14 12 4 19-15-10-15 10 4-19-14-12 18-2z\" " + stroke + "/>";
  if (kind === "wings") return "<path d=\"M47 37C37 21 24 20 18 25c8 2 14 8 17 16-8-5-16-4-21 2 12 0 21 6 28 15M49 37c10-16 23-17 29-12-8 2-14 8-17 16 8-5 16-4 21 2-12 0-21 6-28 15\" " + stroke + "/>";
  return "<path d=\"M18 64V42h12v22M36 64V28h12v36M54 64V36h12v28M72 64V20h12v44\" " + stroke + "/><path d=\"M14 70h74\" " + stroke + "/>";
}

function projectLogo(project) {
  const body = "<defs><linearGradient id=\"glow\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">" +
    "<stop offset=\"0\" stop-color=\"" + project.accent + "\" stop-opacity=\".22\"/>" +
    "<stop offset=\"1\" stop-color=\"" + colors.background + "\" stop-opacity=\"0\"/></linearGradient></defs>" +
    roundedRect(1, 1, 158, 94, colors.background, project.accent, 14) +
    "<rect x=\"2\" y=\"2\" width=\"156\" height=\"92\" rx=\"13\" fill=\"url(#glow)\"/>" +
    "<path d=\"M12 74h136M12 22h136\" stroke=\"" + project.accent + "\" stroke-opacity=\".18\"/>" +
    "<g>" + projectMark(project.kind, project.accent) + "</g>" +
    "<text x=\"96\" y=\"43\" fill=\"" + colors.ink + "\" font-family=\"Arial, sans-serif\" font-size=\"18\" font-weight=\"700\" letter-spacing=\"1\">" + escapeXml(project.short) + "</text>" +
    "<text x=\"96\" y=\"63\" fill=\"" + colors.muted + "\" font-family=\"Arial, sans-serif\" font-size=\"9\" letter-spacing=\"1.4\">" + escapeXml(project.name.toUpperCase()) + "</text>";
  return svgDocument(160, 96, project.name + " project logo", "Code-generated local logo for " + project.name, body);
}

function contributionLevel(count) {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

function flattenDays(calendar) {
  return (calendar?.weeks || []).flatMap((week) => (week.contributionDays || []).map((day) => ({
    date: day.date,
    count: Number(day.contributionCount || 0),
    weekday: Number(day.weekday || 0)
  })));
}

function contributionWeeks(calendar) {
  return calendar?.weeks || [];
}

function weeklyTotals(weeks) {
  return weeks.map((week) => (week.contributionDays || []).reduce((sum, day) => sum + Number(day.contributionCount || 0), 0));
}

function streaks(days) {
  const ordered = [...days].sort((a, b) => a.date.localeCompare(b.date));
  let longest = 0;
  let run = 0;
  for (const day of ordered) {
    if (day.count > 0) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }
  const today = new Date().toISOString().slice(0, 10);
  let index = ordered.findIndex((day) => day.date > today);
  if (index === -1) index = ordered.length;
  let current = 0;
  for (let cursor = index - 1; cursor >= 0 && ordered[cursor].count > 0; cursor -= 1) current += 1;
  return { current, longest, activeDays: ordered.filter((day) => day.count > 0).length };
}

function activitySvg(snapshot) {
  const width = 1000;
  const height = 332;
  const weeks = contributionWeeks(snapshot.calendar);
  const cell = 12;
  const gap = 4;
  const left = 34;
  const top = 88;
  const chartWidth = Math.max(1, weeks.length) * (cell + gap) - gap;
  const grid = [];
  const monthLabels = [];
  let lastMonth = "";
  weeks.forEach((week, weekIndex) => {
    const firstDay = week.contributionDays?.[0];
    if (firstDay) {
      const month = firstDay.date.slice(0, 7);
      if (month !== lastMonth) {
        monthLabels.push({ x: left + weekIndex * (cell + gap), label: month });
        lastMonth = month;
      }
    }
    (week.contributionDays || []).forEach((day) => {
      const y = top + Number(day.weekday || 0) * (cell + gap);
      const level = contributionLevel(Number(day.contributionCount || 0));
      grid.push("<rect x=\"" + (left + weekIndex * (cell + gap)) + "\" y=\"" + y + "\" width=\"" + cell + "\" height=\"" + cell + "\" rx=\"3\" fill=\"" + colors.green[level] + "\" data-date=\"" + escapeXml(day.date) + "\"><title>" + number(day.contributionCount) + " contributions on " + escapeXml(day.date) + "</title></rect>");
    });
  });
  const totals = weeklyTotals(weeks);
  const max = Math.max(1, ...totals);
  const lineTop = 266;
  const lineHeight = 28;
  const points = totals.map((total, index) => {
    const x = left + index * (cell + gap) + cell / 2;
    const y = lineTop + lineHeight - (total / max) * lineHeight;
    return x + "," + y;
  }).join(" ");
  const areaPoints = left + "," + (lineTop + lineHeight) + " " + points + " " +
    (left + Math.max(0, totals.length - 1) * (cell + gap) + cell / 2) + "," + (lineTop + lineHeight);
  const months = monthLabels.map((month) => "<text x=\"" + month.x + "\" y=\"76\" fill=\"" + colors.muted + "\" font-family=\"Arial, sans-serif\" font-size=\"10\">" + escapeXml(month.label) + "</text>").join("");
  const legend = [0, 1, 2, 3, 4].map((level, index) => "<rect x=\"" + (760 + index * 18) + "\" y=\"306\" width=\"12\" height=\"12\" rx=\"3\" fill=\"" + colors.green[level] + "\"/>").join("");
  const total = snapshot.calendar?.totalContributions || flattenDays(snapshot.calendar).reduce((sum, day) => sum + day.count, 0);
  const body = roundedRect(1, 1, 998, 330, colors.background, colors.border, 16) +
    "<text x=\"32\" y=\"34\" fill=\"" + colors.ink + "\" font-family=\"Arial, sans-serif\" font-size=\"15\" font-weight=\"700\" letter-spacing=\"2\">GITHUB ACTIVITY / " + escapeXml(LOGIN.toUpperCase()) + "</text>" +
    "<text x=\"968\" y=\"34\" text-anchor=\"end\" fill=\"" + colors.gold + "\" font-family=\"monospace\" font-size=\"13\">" + number(total) + " CONTRIBUTIONS · 12 MONTHS</text>" +
    "<line x1=\"32\" y1=\"52\" x2=\"968\" y2=\"52\" stroke=\"" + colors.gold + "\" stroke-opacity=\".38\"/>" + months +
    "<text x=\"16\" y=\"" + (top + 11) + "\" fill=\"" + colors.muted + "\" font-family=\"Arial, sans-serif\" font-size=\"10\">M</text>" +
    "<text x=\"16\" y=\"" + (top + 39) + "\" fill=\"" + colors.muted + "\" font-family=\"Arial, sans-serif\" font-size=\"10\">W</text>" +
    "<text x=\"16\" y=\"" + (top + 67) + "\" fill=\"" + colors.muted + "\" font-family=\"Arial, sans-serif\" font-size=\"10\">F</text>" +
    grid.join("") +
    "<line x1=\"" + left + "\" y1=\"" + (lineTop + lineHeight) + "\" x2=\"" + (left + chartWidth) + "\" y2=\"" + (lineTop + lineHeight) + "\" stroke=\"" + colors.border + "\"/>" +
    "<polygon points=\"" + areaPoints + "\" fill=\"" + colors.gold + "\" fill-opacity=\".10\"/>" +
    "<polyline points=\"" + points + "\" fill=\"none\" stroke=\"" + colors.gold + "\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>" +
    "<text x=\"32\" y=\"306\" fill=\"" + colors.muted + "\" font-family=\"Arial, sans-serif\" font-size=\"10\">LESS</text>" + legend +
    "<text x=\"856\" y=\"316\" fill=\"" + colors.muted + "\" font-family=\"Arial, sans-serif\" font-size=\"10\">MORE</text>";
  return svgDocument(width, height, "GitHub contribution activity", "Code-generated activity graph for the public GitHub contributions of " + LOGIN, body);
}

function statCard(x, label, value, detail, accent) {
  return roundedRect(x, 86, 214, 104, colors.surface, colors.border, 12) +
    "<rect x=\"" + x + "\" y=\"86\" width=\"5\" height=\"104\" rx=\"3\" fill=\"" + accent + "\"/>" +
    "<text x=\"" + (x + 22) + "\" y=\"113\" fill=\"" + colors.muted + "\" font-family=\"Arial, sans-serif\" font-size=\"11\" letter-spacing=\"1.5\">" + escapeXml(label) + "</text>" +
    "<text x=\"" + (x + 22) + "\" y=\"153\" fill=\"" + colors.ink + "\" font-family=\"Arial, sans-serif\" font-size=\"30\" font-weight=\"700\">" + escapeXml(value) + "</text>" +
    "<text x=\"" + (x + 22) + "\" y=\"174\" fill=\"" + accent + "\" font-family=\"monospace\" font-size=\"10\">" + escapeXml(detail) + "</text>";
}

function languageLine(repositories) {
  const counts = new Map();
  for (const repository of repositories) {
    const language = repository.primaryLanguage?.name || repository.language;
    if (language) counts.set(language, (counts.get(language) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => name + " " + count).join("  ·  ") || "AI · automation · open source";
}

function statsSvg(snapshot) {
  const contributions = snapshot.calendar?.totalContributions || flattenDays(snapshot.calendar).reduce((sum, day) => sum + day.count, 0);
  const repositories = snapshot.repositories || [];
  const stars = repositories.reduce((sum, repository) => sum + Number(repository.stargazerCount || 0), 0);
  const cards = statCard(32, "CONTRIBUTIONS", number(contributions), "public · last 12 months", colors.gold) +
    statCard(258, "PUBLIC REPOS", number(snapshot.repositoryCount || repositories.length), "open source graph", colors.blue) +
    statCard(484, "STARS", number(stars), "community signal", colors.purple) +
    statCard(710, "FOLLOWERS", number(snapshot.followers), "people following the work", "#39d353");
  const body = roundedRect(1, 1, 998, 242, colors.background, colors.border, 16) +
    "<text x=\"32\" y=\"35\" fill=\"" + colors.ink + "\" font-family=\"Arial, sans-serif\" font-size=\"15\" font-weight=\"700\" letter-spacing=\"2\">PUBLIC GITHUB / CODE-GENERATED STATS</text>" +
    "<text x=\"968\" y=\"35\" text-anchor=\"end\" fill=\"" + colors.gold + "\" font-family=\"monospace\" font-size=\"12\">@" + escapeXml(LOGIN) + "</text>" +
    "<line x1=\"32\" y1=\"52\" x2=\"968\" y2=\"52\" stroke=\"" + colors.gold + "\" stroke-opacity=\".38\"/>" + cards +
    "<text x=\"32\" y=\"220\" fill=\"" + colors.muted + "\" font-family=\"monospace\" font-size=\"11\">LANGUAGE SIGNAL</text>" +
    "<text x=\"180\" y=\"220\" fill=\"" + colors.ink + "\" font-family=\"monospace\" font-size=\"11\">" + escapeXml(languageLine(repositories)) + "</text>";
  return svgDocument(1000, 244, "GitHub public stats", "Code-generated public GitHub statistics for " + LOGIN, body);
}

function streakSvg(snapshot) {
  const days = flattenDays(snapshot.calendar);
  const summary = streaks(days);
  const contributions = snapshot.calendar?.totalContributions || days.reduce((sum, day) => sum + day.count, 0);
  const weeks = weeklyTotals(contributionWeeks(snapshot.calendar)).slice(-26);
  const max = Math.max(1, ...weeks);
  const bars = weeks.map((value, index) => {
    const height = Math.max(3, (value / max) * 52);
    const x = 34 + index * 34;
    return "<rect x=\"" + x + "\" y=\"" + (146 - height) + "\" width=\"18\" height=\"" + height + "\" rx=\"4\" fill=\"" + (value ? colors.gold : colors.border) + "\" opacity=\"" + (value ? ".95" : ".8") + "\"><title>" + number(value) + " contributions in week " + (index + 1) + "</title></rect>";
  }).join("");
  const body = roundedRect(1, 1, 998, 244, colors.background, colors.border, 16) +
    "<text x=\"32\" y=\"35\" fill=\"" + colors.ink + "\" font-family=\"Arial, sans-serif\" font-size=\"15\" font-weight=\"700\" letter-spacing=\"2\">CONSISTENCY / BUILT IN PUBLIC</text>" +
    "<text x=\"968\" y=\"35\" text-anchor=\"end\" fill=\"" + colors.gold + "\" font-family=\"monospace\" font-size=\"12\">REAL ACTIVITY · NO FAKE COMMITS</text>" +
    "<line x1=\"32\" y1=\"52\" x2=\"968\" y2=\"52\" stroke=\"" + colors.gold + "\" stroke-opacity=\".38\"/>" +
    "<text x=\"166\" y=\"92\" text-anchor=\"middle\" fill=\"" + colors.gold + "\" font-family=\"Arial, sans-serif\" font-size=\"34\" font-weight=\"700\">" + number(summary.current) + "</text>" +
    "<text x=\"166\" y=\"112\" text-anchor=\"middle\" fill=\"" + colors.muted + "\" font-family=\"Arial, sans-serif\" font-size=\"11\" letter-spacing=\"1.5\">CURRENT STREAK</text>" +
    "<text x=\"500\" y=\"92\" text-anchor=\"middle\" fill=\"" + colors.ink + "\" font-family=\"Arial, sans-serif\" font-size=\"34\" font-weight=\"700\">" + number(summary.longest) + "</text>" +
    "<text x=\"500\" y=\"112\" text-anchor=\"middle\" fill=\"" + colors.muted + "\" font-family=\"Arial, sans-serif\" font-size=\"11\" letter-spacing=\"1.5\">LONGEST STREAK</text>" +
    "<text x=\"834\" y=\"92\" text-anchor=\"middle\" fill=\"" + colors.blue + "\" font-family=\"Arial, sans-serif\" font-size=\"34\" font-weight=\"700\">" + number(summary.activeDays) + "</text>" +
    "<text x=\"834\" y=\"112\" text-anchor=\"middle\" fill=\"" + colors.muted + "\" font-family=\"Arial, sans-serif\" font-size=\"11\" letter-spacing=\"1.5\">ACTIVE DAYS</text>" +
    "<line x1=\"32\" y1=\"129\" x2=\"968\" y2=\"129\" stroke=\"" + colors.border + "\"/>" + bars +
    "<text x=\"34\" y=\"184\" fill=\"" + colors.muted + "\" font-family=\"monospace\" font-size=\"11\">26-WEEK CONTRIBUTION RHYTHM</text>" +
    "<text x=\"968\" y=\"184\" text-anchor=\"end\" fill=\"" + colors.gold + "\" font-family=\"monospace\" font-size=\"11\">" + number(contributions) + " TOTAL</text>";
  return svgDocument(1000, 196, "GitHub streak and consistency", "Code-generated streak summary from the public GitHub contribution calendar", body);
}

async function githubJson(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...HEADERS, ...(options.headers || {}) } });
  if (!response.ok) throw new Error(response.status + " " + response.statusText + " for " + url);
  return response.json();
}

async function graphqlSnapshot() {
  if (!TOKEN) throw new Error("GITHUB_TOKEN is not available");
  const now = new Date();
  const from = new Date(now);
  from.setUTCFullYear(from.getUTCFullYear() - 1);
  const query = "query($login: String!, $from: DateTime!, $to: DateTime!) {" +
    " user(login: $login) {" +
    " login followers { totalCount }" +
    " repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false, orderBy: { field: PUSHED_AT, direction: DESC }) {" +
    " totalCount nodes { name stargazerCount pushedAt primaryLanguage { name } } }" +
    " contributionsCollection(from: $from, to: $to) {" +
    " contributionCalendar { totalContributions weeks { contributionDays { date contributionCount weekday } } }" +
    " } } }";
  const result = await githubJson("https://api.github.com/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables: { login: LOGIN, from: from.toISOString(), to: now.toISOString() } })
  });
  if (result.errors?.length) throw new Error(result.errors.map((error) => error.message).join("; "));
  const user = result.data?.user;
  if (!user) throw new Error("GitHub user " + LOGIN + " was not found");
  return {
    followers: user.followers.totalCount,
    repositoryCount: user.repositories.totalCount,
    repositories: user.repositories.nodes || [],
    calendar: user.contributionsCollection.contributionCalendar
  };
}

function fallbackCalendarFromLevels(levels) {
  const entries = [...levels.entries()].sort(([a], [b]) => a.localeCompare(b));
  if (!entries.length) return { totalContributions: 0, weeks: [] };
  const first = new Date(entries[0][0] + "T00:00:00Z");
  const last = new Date(entries.at(-1)[0] + "T00:00:00Z");
  first.setUTCDate(first.getUTCDate() - first.getUTCDay());
  const weeks = [];
  for (let cursor = new Date(first); cursor <= last || weeks.length < 53; cursor.setUTCDate(cursor.getUTCDate() + 7)) {
    const days = [];
    for (let weekday = 0; weekday < 7; weekday += 1) {
      const date = new Date(cursor);
      date.setUTCDate(cursor.getUTCDate() + weekday);
      const key = date.toISOString().slice(0, 10);
      const level = Number(levels.get(key) || 0);
      days.push({ date: key, contributionCount: [0, 1, 3, 7, 12][Math.min(4, level)], weekday });
    }
    weeks.push({ contributionDays: days });
  }
  return {
    totalContributions: weeks.flatMap((week) => week.contributionDays).reduce((sum, day) => sum + day.contributionCount, 0),
    weeks: weeks.slice(-53)
  };
}

async function restSnapshot() {
  const profile = await githubJson("https://api.github.com/users/" + LOGIN);
  const repositories = await githubJson("https://api.github.com/users/" + LOGIN + "/repos?per_page=100&sort=pushed");
  const today = new Date();
  const from = new Date(today);
  from.setUTCFullYear(from.getUTCFullYear() - 1);
  const url = "https://github.com/users/" + LOGIN + "/contributions?from=" + from.toISOString().slice(0, 10) + "&to=" + today.toISOString().slice(0, 10);
  const html = await fetch(url, { headers: { "user-agent": "ma-nucho-pro-profile-visuals" } }).then((response) => response.text());
  const levels = new Map();
  for (const match of html.matchAll(/<td\\b[^>]*>/g)) {
    const tag = match[0];
    const date = tag.match(/data-date="([^"]+)"/)?.[1];
    if (date) levels.set(date, Number(tag.match(/data-level="(\\d+)"/)?.[1] || 0));
  }
  const publicRepositories = repositories.filter((repository) => !repository.fork);
  return {
    followers: profile.followers,
    repositoryCount: publicRepositories.length,
    repositories: publicRepositories,
    calendar: fallbackCalendarFromLevels(levels)
  };
}

async function loadSnapshot() {
  try {
    return await graphqlSnapshot();
  } catch (error) {
    console.warn("[profile visuals] GraphQL unavailable; using REST fallback: " + error.message);
    return restSnapshot();
  }
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(PROJECT_DIR, { recursive: true });
  const snapshot = await loadSnapshot();
  await Promise.all(projectArt.map((project) => writeFile(path.join(PROJECT_DIR, project.key + ".svg"), projectLogo(project), "utf8")));
  await writeFile(path.join(OUTPUT_DIR, "activity-graph.svg"), activitySvg(snapshot), "utf8");
  await writeFile(path.join(OUTPUT_DIR, "stats.svg"), statsSvg(snapshot), "utf8");
  await writeFile(path.join(OUTPUT_DIR, "streak.svg"), streakSvg(snapshot), "utf8");
  const contributions = snapshot.calendar?.totalContributions || flattenDays(snapshot.calendar).reduce((sum, day) => sum + day.count, 0);
  const stars = (snapshot.repositories || []).reduce((sum, repository) => sum + Number(repository.stargazerCount || 0), 0);
  console.log(JSON.stringify({
    login: LOGIN,
    contributions,
    repositories: snapshot.repositoryCount || snapshot.repositories.length,
    stars,
    followers: snapshot.followers,
    generated: ["assets/github/activity-graph.svg", "assets/github/stats.svg", "assets/github/streak.svg"].concat(projectArt.map((project) => "assets/projects/" + project.key + ".svg"))
  }, null, 2));
}

main().catch((error) => {
  console.error("[profile visuals] " + (error.stack || error.message));
  process.exitCode = 1;
});
