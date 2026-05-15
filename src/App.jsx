import { useState, useEffect } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

// ─── STYLES ──────────────────────────────────────────────────────────────────
const style = document.createElement("style");
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;1,300&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #050810; --surface: #0d1117; --surface2: #161b22;
    --border: #21262d; --accent: #00f5a0; --accent2: #00d9f5;
    --accent3: #f5a000; --text: #e6edf3; --muted: #7d8590; --danger: #ff6b6b;
  }
  body { background: var(--bg); color: var(--text); font-family: 'Syne', sans-serif; min-height: 100vh; overflow-x: hidden; }
  .grid-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: linear-gradient(rgba(0,245,160,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,160,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .glow { position: fixed; border-radius: 50%; filter: blur(130px); pointer-events: none; z-index: 0; }
  .rel { position: relative; z-index: 1; }
  .container { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
  nav { position: sticky; top: 0; z-index: 100; backdrop-filter: blur(20px); background: rgba(5,8,16,0.85); border-bottom: 1px solid var(--border); }
  .nav-in { display: flex; align-items: center; justify-content: space-between; max-width: 1080px; margin: 0 auto; padding: 14px 24px; }
  .logo { font-size: 1rem; font-weight: 800; background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .mono { font-family: 'DM Mono', monospace; }
  .badge { font-family: 'DM Mono', monospace; font-size: 0.68rem; color: var(--accent); border: 1px solid rgba(0,245,160,0.35); padding: 3px 10px; border-radius: 20px; }
  .hero { min-height: 88vh; display: flex; align-items: center; padding: 60px 0; }
  .tag { font-family: 'DM Mono', monospace; font-size: 0.72rem; color: var(--accent); letter-spacing: 3px; text-transform: uppercase; display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
  .tag::before { content: ''; display: block; width: 24px; height: 1px; background: var(--accent); }
  h1 { font-size: clamp(2.6rem, 6.5vw, 4.8rem); font-weight: 800; line-height: 1.05; letter-spacing: -2px; margin-bottom: 20px; }
  h1 span { background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .desc { font-size: 1.05rem; color: var(--muted); line-height: 1.75; max-width: 520px; margin-bottom: 44px; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px; position: relative; overflow: hidden; }
  .card-top::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--accent), var(--accent2)); }
  .lbl { font-family: 'DM Mono', monospace; font-size: 0.68rem; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; display: block; }
  .inp {
    width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 10px;
    padding: 13px 16px; color: var(--text); font-family: 'DM Mono', monospace; font-size: 0.88rem;
    outline: none; transition: border-color .2s, box-shadow .2s; margin-bottom: 14px;
  }
  .inp:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(0,245,160,0.1); }
  .inp::placeholder { color: var(--muted); }
  .btn { width: 100%; padding: 15px; background: linear-gradient(135deg, var(--accent), var(--accent2)); border: none; border-radius: 10px; color: #050810; font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: opacity .2s, transform .1s; }
  .btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .btn:active { transform: translateY(0); }
  .btn-ghost { background: none; border: 1px solid var(--border); border-radius: 8px; color: var(--muted); padding: 8px 16px; cursor: pointer; font-family: 'Syne', sans-serif; font-size: 0.8rem; transition: border-color .2s; }
  .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
  .err { background: rgba(255,107,107,0.08); border: 1px solid rgba(255,107,107,0.3); border-radius: 8px; padding: 12px 16px; margin-bottom: 14px; color: var(--danger); font-size: 0.82rem; font-family: 'DM Mono', monospace; }
  .scan-wrap { min-height: 80vh; display: flex; align-items: center; justify-content: center; }
  .scan-box { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 44px 40px; max-width: 520px; width: 100%; text-align: center; position: relative; overflow: hidden; }
  .scan-line { position: absolute; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--accent), transparent); animation: scanM 2s ease-in-out infinite; }
  @keyframes scanM { 0% { top: 0; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
  .scan-icon { width: 76px; height: 76px; border-radius: 50%; background: linear-gradient(135deg, rgba(0,245,160,0.1), rgba(0,217,245,0.1)); border: 2px solid rgba(0,245,160,0.25); display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 20px; animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0,245,160,0.25); } 50% { transform: scale(1.04); box-shadow: 0 0 0 10px rgba(0,245,160,0); } }
  .blink { animation: blk 1.5s ease-in-out infinite; }
  @keyframes blk { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
  .log-wrap { margin-top: 20px; text-align: left; font-family: 'DM Mono', monospace; font-size: 0.73rem; color: var(--muted); line-height: 2.1; }
  .log-line { animation: fIL .3s ease forwards; opacity: 0; }
  @keyframes fIL { to { opacity: 1; } }
  .log-line.ok::before { content: '✓ '; color: var(--accent); }
  .log-line.run::before { content: '⟳ '; color: var(--accent2); }
  .section { padding: 52px 0; }
  .s-title { font-size: 1.7rem; font-weight: 800; letter-spacing: -1px; margin-bottom: 4px; }
  .s-sub { color: var(--muted); font-size: 0.82rem; font-family: 'DM Mono', monospace; margin-bottom: 28px; }
  .card-title { font-size: 0.68rem; font-family: 'DM Mono', monospace; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 14px; }
  .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 18px; }
  @media (max-width: 680px) { .g2 { grid-template-columns: 1fr; } h1 { font-size: 2.2rem; } }
  .stag { display: inline-block; background: rgba(0,245,160,0.08); border: 1px solid rgba(0,245,160,0.22); color: var(--accent); padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-family: 'DM Mono', monospace; margin: 3px; }
  .stag.b { background: rgba(0,217,245,0.08); border-color: rgba(0,217,245,0.22); color: var(--accent2); }
  .stag.o { background: rgba(245,160,0,0.08); border-color: rgba(245,160,0,0.22); color: var(--accent3); }
  .badge-card { background: linear-gradient(135deg, rgba(0,245,160,0.04), rgba(0,217,245,0.04)); border: 1px solid rgba(0,245,160,0.18); border-radius: 16px; padding: 22px; text-align: center; }
  .b-score { font-size: 2.8rem; font-weight: 800; background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; }
  .b-lbl { font-family: 'DM Mono', monospace; font-size: 0.65rem; color: var(--muted); margin-top: 4px; letter-spacing: 1px; }
  .mentor { background: linear-gradient(135deg, rgba(245,160,0,0.07), rgba(245,160,0,0.02)); border: 1px solid rgba(245,160,0,0.22); border-radius: 16px; padding: 22px; }
  .m-av { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, var(--accent3), #ff6b6b); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; margin-bottom: 10px; }
  .job-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 18px 20px; display: flex; align-items: center; gap: 14px; transition: border-color .2s, transform .2s; margin-bottom: 10px; }
  .job-card:hover { border-color: rgba(0,245,160,0.35); transform: translateX(4px); }
  .j-logo { width: 46px; height: 46px; border-radius: 10px; background: var(--surface2); display: flex; align-items: center; justify-content: center; font-size: 1.35rem; flex-shrink: 0; }
  .j-right { margin-left: auto; text-align: right; flex-shrink: 0; }
  .j-pct { font-size: 1.35rem; font-weight: 800; color: var(--accent); line-height: 1; }
  .j-bar-wrap { width: 76px; height: 4px; background: var(--border); border-radius: 4px; margin-top: 5px; overflow: hidden; }
  .j-bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent2)); border-radius: 4px; transition: width 1.2s cubic-bezier(.4,0,.2,1); }
  .tabs { display: flex; gap: 4px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 4px; margin-bottom: 28px; width: fit-content; }
  .tab { padding: 9px 18px; border-radius: 8px; border: none; background: transparent; color: var(--muted); font-family: 'Syne', sans-serif; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: background .2s, color .2s; }
  .tab.on { background: linear-gradient(135deg, rgba(0,245,160,0.12), rgba(0,217,245,0.12)); color: var(--accent); border: 1px solid rgba(0,245,160,0.22); }
  .prog-w { margin-bottom: 11px; }
  .prog-lbl { display: flex; justify-content: space-between; font-family: 'DM Mono', monospace; font-size: 0.72rem; color: var(--muted); margin-bottom: 4px; }
  .prog-b { height: 5px; background: var(--border); border-radius: 4px; overflow: hidden; }
  .prog-f { height: 100%; border-radius: 4px; transition: width 1.5s cubic-bezier(.4,0,.2,1); }
  .fi { animation: fUp .5s ease forwards; opacity: 0; }
  @keyframes fUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .d1 { animation-delay: .1s; } .d2 { animation-delay: .2s; } .d3 { animation-delay: .3s; }
  .profile-hdr { display: flex; align-items: center; gap: 18px; margin-bottom: 36px; flex-wrap: wrap; }
  .profile-hdr img { width: 68px; height: 68px; border-radius: 50%; border: 3px solid rgba(0,245,160,0.35); }
  @media print {
    body:not(.printing-cv) * { display: none !important; }
    body.printing-cv .profile-hdr { display: none !important; }
    body.printing-cv .s-title { display: none !important; }
    body.printing-cv .s-sub { display: none !important; }
    body.printing-cv .btn { display: none !important; }
    body.printing-cv .btn-ghost { display: none !important; }
    body.printing-cv .tabs { display: none !important; }
    body.printing-cv nav { display: none !important; }
    body.printing-cv .grid-bg { display: none !important; }
    body.printing-cv .glow { display: none !important; }
    body.printing-cv #cv-print { display: flex !important; }
    body.printing-cv .section { padding: 0 !important; }
    @page { margin: 10mm; }
  }
`;
document.head.appendChild(style);

// ─── GITHUB FETCH ─────────────────────────────────────────────────────────────
async function fetchGitHub(username) {
  const [uRes, rRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`),
    fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=30`),
  ]);
  if (!uRes.ok) throw new Error("GitHub kullanıcısı bulunamadı. Kullanıcı adını kontrol et.");
  const user = await uRes.json();
  const repos = await rRes.json();
  const repoList = Array.isArray(repos) ? repos : [];

  const starred = repoList
    .filter(r => r.stargazers_count > 0 && r.name.toLowerCase() !== username.toLowerCase() && !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 4);
  const topRepos = starred.length > 0 ? starred : repoList
    .filter(r => r.name.toLowerCase() !== username.toLowerCase() && !r.fork)
    .slice(0, 4);

  const readmes = await Promise.all(
    topRepos.map(async r => {
      try {
        const res = await fetch(`https://api.github.com/repos/${username}/${r.name}/readme`, {
          headers: { Accept: "application/vnd.github.v3.raw" }
        });
        if (!res.ok) return null;
        const text = await res.text();
        const lines = text.split("\n").filter(l => l.trim() && !l.startsWith("#") && !l.startsWith("!") && !l.startsWith("<"));
        return lines.slice(0, 2).join(" ").slice(0, 150) || null;
      } catch { return null; }
    })
  );

  const reposWithReadme = topRepos.map((r, i) => ({ ...r, readmeSummary: readmes[i] }));
  return { user, repos: repoList, topRepos: reposWithReadme };
}

// ─── ANALYZE ─────────────────────────────────────────────────────────────────
function analyze(ghData) {
  const { user, repos } = ghData;

  const langCount = {};
  repos.forEach(r => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });
  const languages = Object.entries(langCount).sort((a, b) => b[1] - a[1]).map(([l]) => l);

  const skillMap = {
    JavaScript: ["React", "Node.js"], TypeScript: ["TypeScript"],
    Python: ["Python", "Django/Flask"], Java: ["Java", "Spring Boot"],
    "C#": ["C#", ".NET"], Go: ["Go"], Rust: ["Rust"],
    CSS: ["CSS", "HTML"], Kotlin: ["Kotlin", "Android"],
    Swift: ["Swift", "iOS"], PHP: ["PHP"], Ruby: ["Ruby on Rails"],
    "C++": ["C++"], Shell: ["Bash/Shell", "DevOps"],
  };
  const skills = [...new Set(languages.flatMap(l => skillMap[l] || [l]))]
    .filter(s => !languages.includes(s))
    .slice(0, 10);

  const repoCount = user.public_repos || 0;
  const followers = user.followers || 0;
  const hasReadme = repos.filter(r => r.description).length;
  const hasTopics = repos.filter(r => r.topics && r.topics.length > 0).length;
  const starsTotal = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const forksTotal = repos.reduce((s, r) => s + r.forks_count, 0);

  const docScore    = Math.min(95, 30 + (hasReadme / Math.max(repos.length, 1)) * 65);
  const algoScore   = Math.min(95, 40 + Math.min(starsTotal / 5, 30) + Math.min(repoCount * 1.5, 25));
  const cleanScore  = Math.min(95, 35 + Math.min(repoCount * 2, 30) + Math.min(followers / 2, 30));
  const a11yScore   = Math.min(95, 30 + (languages.includes("CSS") || languages.includes("JavaScript") ? 25 : 0) + Math.min(hasTopics * 5, 30) + 10);
  const teamScore   = Math.min(95, 30 + Math.min(forksTotal * 2, 35) + Math.min(followers, 30));
  const devopsScore = Math.min(95, 25 + (languages.includes("Shell") ? 30 : 0) + Math.min(repoCount, 40));

  const radarData = [
    { subject: "Temiz Kod",       score: Math.round(cleanScore) },
    { subject: "Erişilebilirlik", score: Math.round(a11yScore) },
    { subject: "Algoritma",       score: Math.round(algoScore) },
    { subject: "Dokümantasyon",   score: Math.round(docScore) },
    { subject: "Takım Çalışması", score: Math.round(teamScore) },
    { subject: "DevOps",          score: Math.round(devopsScore) },
  ];

  const topProjects = (ghData.topRepos || repos.slice(0, 4)).map(r => ({
    name: r.name,
    desc: r.readmeSummary || r.description || "Açıklama yok",
    tech: r.language || "?",
    stars: r.stargazers_count || 0,
  }));

  const dominantLang = languages[0] || "yazılım";
  const title = languages.includes("TypeScript") || languages.includes("JavaScript")
    ? "Frontend / Full Stack Developer"
    : languages.includes("Python") ? "Python Developer / Data Engineer"
    : languages.includes("Java") || languages.includes("Kotlin") ? "Java Backend / Android Developer"
    : languages.includes("Go") || languages.includes("Rust") ? "Systems / Backend Developer"
    : "Software Developer";

  const summary = `${user.login} adlı geliştirici, GitHub üzerinde ${repoCount} public repo ve ${starsTotal} toplam yıldız ile aktif bir açık kaynak profiline sahip. Ağırlıklı olarak ${dominantLang} kullanan geliştirici, ${skills.slice(0, 3).join(", ")} alanlarında güçlü bir teknik yetkinlik sergilemiş.`;

  const strengths = [
    repoCount > 15 ? "Geniş & aktif portföy" : "Seçici & kaliteli repolar",
    starsTotal > 10 ? `Topluluğun ilgisini çekiyor (${starsTotal} ⭐)` : "Organik büyüme potansiyeli",
    languages.length > 3 ? `Çok dilli geliştirici (${languages.slice(0,3).join(", ")})` : `${dominantLang} uzmanlığı`,
  ];

  const improvements = [
    docScore < 70 ? "README ve proje açıklamalarını zenginleştir" : "Teknik blog yaz, repolarını öne çıkar",
    teamScore < 70 ? "Open source projelere katkı sağla, fork al" : "Mentörlük ve code review al/ver",
  ];

  const mentorTip = `Profilinde ${dominantLang} ağırlıklı bir yapı görüyorum. ${docScore < 65 ? "README dosyalarına daha fazla zaman ayır — işe alım süreçlerinde teknik portföy kalitesi büyük rol oynuyor." : "Mevcut projelerini daha görünür kılmak için LinkedIn'de paylaşmayı ihmal etme."}`;

  return {
    name: user.name || user.login, title, summary, skills, languages, topProjects,
    radarData, accessibilityScore: Math.round(a11yScore),
    mentorTip, strengths, improvements,
    avatar: user.avatar_url,
    githubUrl: `https://github.com/${user.login}`,
    stats: { repos: repoCount, stars: starsTotal, followers, following: user.following },
  };
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function ProgressBar({ label, value, color }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 120); return () => clearTimeout(t); }, [value]);
  return (
    <div className="prog-w">
      <div className="prog-lbl"><span>{label}</span><span>{value}%</span></div>
      <div className="prog-b"><div className="prog-f" style={{ width: `${w}%`, background: color || "var(--accent)" }} /></div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home");
  const [gh, setGh] = useState("");
  const [li, setLi] = useState("");
  const [logs, setLogs] = useState([]);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("skills");

const [cvForm, setCvForm] = useState({ phone: "", email: "", city: "", bio: "", edu1: "", edu2: "", edu3: "", edu4: "", exp1: "", exp2: "", exp3: "", lang1: "", lang1Level: "Başlangıç", lang2: "", lang2Level: "Başlangıç" });  const [cvInfo, setCvInfo] = useState(null);

  const [jobForm, setJobForm] = useState({ city: "", workType: "", level: "", title: "" });
  const [jobInfo, setJobInfo] = useState(null);
  const [jobResults, setJobResults] = useState([]);
  const [jobLoading, setJobLoading] = useState(false);

  const logSteps = [
    { t: "GitHub profiline bağlanılıyor...", c: "run" },
    { t: "Repolar çekiliyor...", c: "run" },
    { t: "Programlama dilleri analiz ediliyor...", c: "ok" },
    { t: "Proje kalitesi değerlendiriliyor...", c: "ok" },
    { t: "Yetenek profili oluşturuluyor...", c: "ok" },
    { t: "İş eşleşmeleri hesaplanıyor...", c: "ok" },
    { t: "CV hazırlanıyor...", c: "ok" },
  ];

async function searchJobs(filters, skills, title) {
  setJobLoading(true);
  setJobResults([]);
  await new Promise(r => setTimeout(r, 1500));

  const jobTitle = filters.title || title;
  const city = filters.city || "";
  const level = filters.level && filters.level !== "Fark etmez" ? filters.level : "";
  const workType = filters.workType && filters.workType !== "Fark etmez" ? filters.workType : "";

  const q = encodeURIComponent(`${jobTitle} ${level}`.trim());
  const cityQ = encodeURIComponent(city || "Türkiye");
  const remoteParam = workType === "Remote" ? "remote" : "";

  setJobResults([
    {
      company: "LinkedIn Jobs",
      role: `${jobTitle}${level ? " · " + level : ""}`,
      location: city || "Türkiye",
      workType: workType || "Tüm şekiller",
      match: 95,
      url: `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${cityQ}`,
      tags: skills.slice(0, 4),
      description: "LinkedIn'de binlerce güncel ilan. Filtreleyerek en uygununu bul."
    },
  
    {
      company: "Indeed Türkiye",
      role: `${jobTitle}${level ? " · " + level : ""}`,
      location: city || "Türkiye",
      workType: workType || "Tüm şekiller",
      match: 85,
      url: `https://tr.indeed.com/jobs?q=${q}&l=${cityQ}`,
      tags: skills.slice(0, 4),
      description: "Indeed'de konuma ve çalışma şekline göre filtrelenmiş ilanlar."
    },
    
    {
      company: "Remote OK — Yurt Dışı",
      role: `${jobTitle} · Remote`,
      location: "Worldwide / Remote",
      workType: "Remote",
      match: 75,
      url: `https://remoteok.com/remote-${encodeURIComponent(jobTitle.toLowerCase().replace(/ /g,"-"))}-jobs`,
      tags: skills.slice(0, 4),
      description: "Dövizli maaşla yurt dışı şirketlerde remote çalışma fırsatları."
    },
  ]);

  setJobLoading(false);
}
  async function start() {
    if (!gh.trim()) { setErr("GitHub kullanıcı adı gerekli."); return; }
    setErr(""); setScreen("scanning"); setLogs([]);
    try {
      for (let i = 0; i < 2; i++) {
        await new Promise(r => setTimeout(r, 450));
        setLogs(p => [...p, { ...logSteps[i], id: i }]);
      }
      const ghData = await fetchGitHub(gh.trim());
      for (let i = 2; i < logSteps.length; i++) {
        await new Promise(r => setTimeout(r, 320));
        setLogs(p => [...p, { ...logSteps[i], id: i }]);
      }
      await new Promise(r => setTimeout(r, 400));
      setData(analyze(ghData));
      setScreen("dashboard");
    } catch (e) {
      setErr(e.message || "Bir hata oluştu.");
      setScreen("home");
    }
  }

  function reset() {
    setScreen("home"); setData(null); setGh(""); setLi(""); setErr(""); setTab("skills");
setCvForm({ phone: "", email: "", city: "", bio: "", edu1: "", edu2: "", edu3: "", edu4: "", exp1: "", exp2: "", exp3: "", lang1: "", lang1Level: "Başlangıç", lang2: "", lang2Level: "Başlangıç" });    setCvInfo(null);
    setJobForm({ city: "", workType: "", level: "", title: "" }); setJobInfo(null);
    setJobResults([]); setJobLoading(false);
  }

  // ── HOME ──
  if (screen === "home") return (
    <>
      <div className="grid-bg" />
      <div className="glow" style={{ width: 580, height: 580, top: -160, right: -120, background: "rgba(0,245,160,0.055)" }} />
      <div className="glow" style={{ width: 360, height: 360, bottom: 0, left: -80, background: "rgba(0,217,245,0.045)" }} />
      <nav className="rel"><div className="nav-in"><div className="logo">⬡ CareerAI</div><div className="badge">AI ANALİZ</div></div></nav>
      <div className="rel container">
        <div className="hero">
          <div style={{ maxWidth: 700 }}>
            <div className="tag fi">AI Kariyer Mimarı</div>
            <h1 className="fi d1">GitHub'ını<br /><span>Kariyere Dönüştür</span></h1>
            <p className="desc fi d2">Repolarını analiz ediyoruz, becerilerini tespit ediyoruz, sana özel dijital CV oluşturuyoruz ve en uygun iş ilanlarıyla eşleştiriyoruz.</p>
            <div className="card card-top fi d3" style={{ maxWidth: 580 }}>
              {err && <div className="err">⚠ {err}</div>}
              <label className="lbl">GitHub Kullanıcı Adı *</label>
              <input className="inp" placeholder="örn: torvalds" value={gh} onChange={e => setGh(e.target.value)} onKeyDown={e => e.key === "Enter" && start()} />
              <label className="lbl">LinkedIn URL (isteğe bağlı)</label>
              <input className="inp" placeholder="https://linkedin.com/in/username" value={li} onChange={e => setLi(e.target.value)} />
              <button className="btn" onClick={start}>🔍 Analizi Başlat</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // ── SCANNING ──
  if (screen === "scanning") return (
    <>
      <div className="grid-bg" />
      <nav className="rel"><div className="nav-in"><div className="logo">⬡ CareerAI</div><div className="badge blink">TARANIYOR</div></div></nav>
      <div className="rel container">
        <div className="scan-wrap">
          <div className="scan-box">
            <div className="scan-line" />
            <div className="scan-icon">🔬</div>
            <h2 style={{ fontWeight: 800, fontSize: "1.25rem", marginBottom: 6 }}>Profil Taranıyor</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.83rem", fontFamily: "DM Mono, monospace" }}>@{gh}</p>
            <div className="log-wrap">
              {logs.map((l, i) => (
                <div key={l.id} className={`log-line ${l.c}`} style={{ animationDelay: `${i * 0.04}s` }}>{l.t}</div>
              ))}
            </div>
            <div className="mono blink" style={{ fontSize: "0.78rem", color: "var(--accent)", marginTop: 16 }}>işleniyor...</div>
          </div>
        </div>
      </div>
    </>
  );

  // ── DASHBOARD ──
  if (!data) return null;

  return (
    <>
      <div className="grid-bg" />
      <div className="glow" style={{ width: 480, height: 480, top: 0, right: -80, background: "rgba(0,245,160,0.04)" }} />
      <nav className="rel">
        <div className="nav-in">
          <div className="logo">⬡ CareerAI</div>
          <button className="btn-ghost" onClick={reset}>← Yeni Analiz</button>
        </div>
      </nav>

      <div className="rel container section">
        {/* HEADER */}
        <div className="profile-hdr fi">
          <img src={data.avatar} alt="" />
          <div>
            <div style={{ fontSize: "1.55rem", fontWeight: 800, letterSpacing: "-0.5px" }}>{data.name}</div>
            <div style={{ color: "var(--accent)", fontFamily: "DM Mono, monospace", fontSize: "0.82rem" }}>{data.title}</div>
            <a href={data.githubUrl} target="_blank" rel="noreferrer" style={{ color: "var(--muted)", fontSize: "0.72rem", fontFamily: "DM Mono, monospace", textDecoration: "none" }}>↗ {data.githubUrl}</a>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 20 }}>
            {[["Repos", data.stats.repos], ["Stars", data.stats.stars], ["Takipçi", data.stats.followers]].map(([l, v]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, background: "linear-gradient(135deg, var(--accent), var(--accent2))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{v}</div>
                <div style={{ fontSize: "0.65rem", color: "var(--muted)", fontFamily: "DM Mono, monospace" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TABS */}
        <div className="tabs fi d1">
          {[["skills","🧬 Skill DNA"],["cv","📄 Dijital CV"],["jobs","💼 İş Eşleşmeleri"]].map(([id, lbl]) => (
            <button key={id} className={`tab ${tab === id ? "on" : ""}`} onClick={() => setTab(id)}>{lbl}</button>
          ))}
        </div>

        {/* ── SKILLS ── */}
        {tab === "skills" && (
          <div className="fi">
            <div className="s-title">Skill DNA Hub</div>
            <div className="s-sub">// gerçek GitHub verilerinden hesaplandı</div>
            <div className="g2">
              <div className="card">
                <div className="card-title">Yetenek Radar Grafiği</div>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={data.radarData}>
                    <PolarGrid stroke="#21262d" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#7d8590", fontSize: 10, fontFamily: "DM Mono" }} />
                    <Radar dataKey="score" stroke="#00f5a0" fill="#00f5a0" fillOpacity={0.13} strokeWidth={2} />
                    <Tooltip contentStyle={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 8, fontFamily: "DM Mono", fontSize: "0.8rem" }} labelStyle={{ color: "#00f5a0" }} itemStyle={{ color: "#e6edf3" }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="badge-card">
                  <div style={{ fontSize: "2rem", marginBottom: 8 }}>♿</div>
                  <div className="b-score">{data.accessibilityScore}</div>
                  <div className="b-lbl">ERİŞİLEBİLİRLİK PUANI</div>
                  <div style={{ marginTop: 8, fontSize: "0.72rem", color: data.accessibilityScore >= 75 ? "var(--accent)" : "var(--accent3)" }}>
                    {data.accessibilityScore >= 75 ? "🏆 Yüksek Standart" : "⚡ Gelişim Potansiyeli"}
                  </div>
                </div>
                <div className="card" style={{ flex: 1 }}>
                  <div className="card-title">Güçlü Yönler</div>
                  {data.strengths.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, fontSize: "0.83rem" }}>
                      <span style={{ color: "var(--accent)", flexShrink: 0 }}>✓</span>{s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title">Beceri & Teknoloji Seti</div>
              <div>{data.skills.map((s, i) => <span key={i} className="stag">{s}</span>)}</div>
              <div style={{ marginTop: 10 }}>{data.languages.map((l, i) => <span key={i} className={`stag ${i%2===0?"b":"o"}`}>{l}</span>)}</div>
            </div>
            <div className="mentor">
              <div className="m-av">🤖</div>
              <div style={{ fontSize: "0.67rem", fontFamily: "DM Mono, monospace", color: "var(--accent3)", letterSpacing: 2, marginBottom: 8 }}>AI MENTOR TAVSİYESİ</div>
              <p style={{ fontSize: "0.88rem", lineHeight: 1.72, color: "var(--text)" }}>{data.mentorTip}</p>
              <div style={{ marginTop: 12 }}>
                {data.improvements.map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginTop: 7, fontSize: "0.8rem" }}>
                    <span style={{ color: "var(--accent3)", flexShrink: 0 }}>→</span>
                    <span style={{ color: "var(--muted)" }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CV ── */}
        {tab === "cv" && (
          <div className="fi">
            {!cvInfo ? (
              <div style={{ maxWidth: 520 }}>
                <div className="s-title">Dijital CV</div>
                <div className="s-sub">// Birkaç bilgi daha ekle, CV'ni tamamlayalım</div>
                <div className="card card-top" style={{ marginTop: 8 }}>

                  {/* İLETİŞİM */}
                  <label className="lbl">Telefon Numarası</label>
                  <input className="inp" placeholder="+90 532 123 45 67" value={cvForm.phone} onChange={e => setCvForm(p => ({ ...p, phone: e.target.value }))} />
                  <label className="lbl">E-posta</label>
                  <input className="inp" placeholder="ornek@gmail.com" value={cvForm.email} onChange={e => setCvForm(p => ({ ...p, email: e.target.value }))} />
                  <label className="lbl">Şehir</label>
                  <input className="inp" placeholder="İstanbul, Kadıköy" value={cvForm.city} onChange={e => setCvForm(p => ({ ...p, city: e.target.value }))} />
                  <label className="lbl">Hakkımda *</label>
                  <textarea className="inp" rows={3} placeholder="Kendini tanıt, güçlü yönlerinden bahset..." value={cvForm.bio} onChange={e => setCvForm(p => ({ ...p, bio: e.target.value }))} style={{ resize: "vertical" }} />

                  {/* EĞİTİM */}
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 4, marginBottom: 8 }}>
                    <div style={{ fontSize: "0.68rem", fontFamily: "DM Mono, monospace", color: "var(--accent)", letterSpacing: 2, marginBottom: 14 }}>EĞİTİM BİLGİLERİ</div>
                    {[
                      { key: "edu1", label: "Eğitim 1 *", placeholder: "örn: Anadolu Üniversitesi / Yazılım Geliştirme · 2020 - 2024" },
                      { key: "edu2", label: "Eğitim 2 (opsiyonel)", placeholder: "örn: İTÜ / Yazılım Müh. · 2021 - 2025" },
                      { key: "edu3", label: "Eğitim 3 (opsiyonel)", placeholder: "örn: Boğaziçi / İşletme · 2018 - 2022" },
                      { key: "edu4", label: "Eğitim 4 (opsiyonel)", placeholder: "örn: AÖF / Hukuk · 2022 - 2026" },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="lbl">{label}</label>
                        <input className="inp" placeholder={placeholder} value={cvForm[key] || ""} onChange={e => setCvForm(p => ({ ...p, [key]: e.target.value }))} />
                      </div>
                    ))}
                  </div>

                  {/* DENEYİM */}
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 4, marginBottom: 8 }}>
                    <div style={{ fontSize: "0.68rem", fontFamily: "DM Mono, monospace", color: "var(--accent)", letterSpacing: 2, marginBottom: 14 }}>DENEYİM (OPSİYONEL)</div>
                    {[
                      { key: "exp1", placeholder: "örn: Trendyol · Frontend Developer · 2022 - 2024" },
                      { key: "exp2", placeholder: "örn: Getir · Stajyer Yazılım Geliştirici · 2021 - 2022" },
                      { key: "exp3", placeholder: "örn: Freelance · Full Stack Developer · 2020 - Devam ediyor" },
                    ].map(({ key, placeholder }, i) => (
                      <div key={key}>
                        <label className="lbl">Deneyim {i + 1}</label>
                        <input className="inp" placeholder={placeholder} value={cvForm[key] || ""} onChange={e => setCvForm(p => ({ ...p, [key]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
{/* DİLLER */}
<div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 4, marginBottom: 8 }}>
  <div style={{ fontSize: "0.68rem", fontFamily: "DM Mono, monospace", color: "var(--accent)", letterSpacing: 2, marginBottom: 14 }}>YABANCI DİL (OPSİYONEL)</div>
  {[
    { key: "lang1", levelKey: "lang1Level", label: "Dil 1" },
    { key: "lang2", levelKey: "lang2Level", label: "Dil 2" },
  ].map(({ key, levelKey, label }) => (
    <div key={key} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
      <div style={{ flex: 1 }}>
        <label className="lbl">{label}</label>
        <input className="inp" style={{ marginBottom: 0 }} placeholder="örn: İngilizce" value={cvForm[key] || ""} onChange={e => setCvForm(p => ({ ...p, [key]: e.target.value }))} />
      </div>
      <div style={{ width: 140 }}>
        <label className="lbl">Seviye</label>
        <select className="inp" style={{ marginBottom: 0 }} value={cvForm[levelKey]} onChange={e => setCvForm(p => ({ ...p, [levelKey]: e.target.value }))}>
          <option>Başlangıç</option>
          <option>Orta</option>
          <option>İleri</option>
        </select>
      </div>
    </div>
  ))}
</div>
                  <button className="btn" onClick={() => {
                    if (!cvForm.bio?.trim()) { alert("Hakkımda alanı zorunludur."); return; }
                    if (!cvForm.edu1?.trim()) { alert("En az 1 eğitim bilgisi zorunludur."); return; }
                    setCvInfo(cvForm);
                  }}>📄 CV Oluştur</button>
                </div>
              </div>
            ) : (
              <div className="fi">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div className="s-title">Dijital CV</div>
                    <div className="s-sub">// GitHub verilerinden otomatik oluşturuldu</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-ghost" onClick={() => setCvInfo(null)}>✏ Düzenle</button>
                    <button className="btn" style={{ width: "auto", padding: "10px 24px", fontSize: "0.85rem" }}
                      onClick={() => {
                        document.body.classList.add("printing-cv");
                        window.print();
                        document.body.classList.remove("printing-cv");
                      }}>⬇ PDF Olarak İndir</button>
                  </div>
                </div>

                {/* CV KART */}
                <div id="cv-print" style={{
                  display: "flex", background: "#fff", borderRadius: 16, overflow: "hidden",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.35)", maxWidth: 780, fontFamily: "Georgia, serif",
                  border: "1px solid var(--border)"
                }}>
                  {/* SOL PANEL */}
                  <div style={{ width: 220, minWidth: 220, background: "#e8f0ee", padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <img src={data.avatar} alt="" style={{ width: 90, height: 90, borderRadius: "50%", border: "3px solid #fff", marginBottom: 14, objectFit: "cover" }} />
                    <div style={{ color: "#1a1a1a", fontWeight: 700, fontSize: "1.05rem", textAlign: "center", marginBottom: 4, fontFamily: "Syne, sans-serif" }}>{data.name}</div>
                    <div style={{ color: "#16a34a", fontSize: "0.72rem", textAlign: "center", marginBottom: 20, fontFamily: "DM Mono, monospace" }}>{data.title}</div>

                    <div style={{ width: "100%", borderTop: "1px solid #ccd9d5", paddingTop: 16, marginBottom: 16 }}>
                      <div style={{ fontSize: "0.62rem", letterSpacing: 2, color: "#666", textTransform: "uppercase", fontFamily: "DM Mono, monospace", marginBottom: 10 }}>İletişim</div>
                      {cvInfo.phone && <div style={{ fontSize: "0.75rem", color: "#333", marginBottom: 7, display: "flex", gap: 6 }}><span>📱</span>{cvInfo.phone}</div>}
                      {cvInfo.email && <div style={{ fontSize: "0.75rem", color: "#333", marginBottom: 7, display: "flex", gap: 6, wordBreak: "break-all" }}><span>✉</span>{cvInfo.email}</div>}
                      {cvInfo.city && <div style={{ fontSize: "0.75rem", color: "#333", marginBottom: 7, display: "flex", gap: 6 }}><span>📍</span>{cvInfo.city}</div>}
                      <div style={{ fontSize: "0.75rem", color: "#333", marginBottom: 7, display: "flex", gap: 6, wordBreak: "break-all" }}><span>⬡</span><a href={data.githubUrl} style={{ color: "#16a34a", textDecoration: "none" }}>{data.githubUrl.replace("https://", "")}</a></div>
                      {li && <div style={{ fontSize: "0.75rem", color: "#333", display: "flex", gap: 6, wordBreak: "break-all" }}><span>in</span><a href={li} style={{ color: "#16a34a", textDecoration: "none" }}>{li.replace("https://linkedin.com/in/", "")}</a></div>}
                    </div>

                    <div style={{ width: "100%", borderTop: "1px solid #ccd9d5", paddingTop: 16, marginBottom: 16 }}>
                      <div style={{ fontSize: "0.62rem", letterSpacing: 2, color: "#666", textTransform: "uppercase", fontFamily: "DM Mono, monospace", marginBottom: 10 }}>Beceriler</div>
                      {data.skills.map((s, i) => (
                        <div key={i} style={{ fontSize: "0.75rem", color: "#333", marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", flexShrink: 0, display: "inline-block" }} />{s}
                        </div>
                      ))}
                    </div>

               {[cvInfo.lang1, cvInfo.lang2].filter(Boolean).length > 0 && (
  <div style={{ width: "100%", borderTop: "1px solid #ccd9d5", paddingTop: 16 }}>
    <div style={{ fontSize: "0.62rem", letterSpacing: 2, color: "#666", textTransform: "uppercase", fontFamily: "DM Mono, monospace", marginBottom: 10 }}>Yabancı Diller</div>
    {[{ l: cvInfo.lang1, lv: cvInfo.lang1Level }, { l: cvInfo.lang2, lv: cvInfo.lang2Level }].filter(x => x.l).map((x, i) => (
      <div key={i} style={{ fontSize: "0.75rem", color: "#333", marginBottom: 7, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0ea5e9", flexShrink: 0, display: "inline-block" }} />
        {x.l}
        <span style={{ fontSize: "0.65rem", color: "#16a34a", fontFamily: "DM Mono, monospace" }}>· {x.lv}</span>
      </div>
    ))}
  </div>
)}
                  </div>

                  {/* SAĞ İÇERİK */}
                  <div style={{ flex: 1, padding: "32px 28px", background: "#fff", color: "#1a1a1a", overflowY: "auto" }}>

                    {/* Hakkımda */}
                    <div style={{ marginBottom: 22 }}>
                      <div style={{ fontSize: "1rem", fontWeight: 700, borderBottom: "2px solid #e8f0ee", paddingBottom: 6, marginBottom: 10, fontFamily: "Syne, sans-serif" }}>Hakkımda</div>
                      <p style={{ fontSize: "0.82rem", lineHeight: 1.75, color: "#444" }}>{cvInfo.bio}</p>
                    </div>

                    {/* Eğitim */}
                    <div style={{ marginBottom: 22 }}>
                      <div style={{ fontSize: "1rem", fontWeight: 700, borderBottom: "2px solid #e8f0ee", paddingBottom: 6, marginBottom: 10, fontFamily: "Syne, sans-serif" }}>Eğitim</div>
                      {[cvInfo.edu1, cvInfo.edu2, cvInfo.edu3, cvInfo.edu4].filter(Boolean).map((edu, i) => (
                        <div key={i} style={{ marginBottom: 8, display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", flexShrink: 0, display: "inline-block", marginTop: 5 }} />
                          <div style={{ fontSize: "0.82rem", color: "#444", lineHeight: 1.6 }}>{edu}</div>
                        </div>
                      ))}
                    </div>

                    {/* Deneyim */}
                    {[cvInfo.exp1, cvInfo.exp2, cvInfo.exp3].filter(Boolean).length > 0 && (
                      <div style={{ marginBottom: 22 }}>
                        <div style={{ fontSize: "1rem", fontWeight: 700, borderBottom: "2px solid #e8f0ee", paddingBottom: 6, marginBottom: 10, fontFamily: "Syne, sans-serif" }}>Deneyim</div>
                        {[cvInfo.exp1, cvInfo.exp2, cvInfo.exp3].filter(Boolean).map((exp, i) => (
                          <div key={i} style={{ marginBottom: 8, display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0ea5e9", flexShrink: 0, display: "inline-block", marginTop: 5 }} />
                            <div style={{ fontSize: "0.82rem", color: "#444", lineHeight: 1.6 }}>{exp}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Öne Çıkan Projeler */}
                    {data.topProjects.length > 0 && (
                      <div style={{ marginBottom: 22 }}>
                        <div style={{ fontSize: "1rem", fontWeight: 700, borderBottom: "2px solid #e8f0ee", paddingBottom: 6, marginBottom: 10, fontFamily: "Syne, sans-serif" }}>Öne Çıkan Projeler</div>
                        {data.topProjects.map((p, i) => (
                          <div key={i} style={{ marginBottom: 12 }}>
                            <div style={{ fontWeight: 700, fontSize: "0.85rem", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                              {p.name}
                              <span style={{ fontSize: "0.7rem", color: "#16a34a", fontFamily: "DM Mono, monospace", fontWeight: 400 }}>{p.tech}</span>
                              {p.stars > 0 && <span style={{ fontSize: "0.7rem", color: "#f5a000", fontFamily: "DM Mono, monospace", fontWeight: 400 }}>⭐ {p.stars}</span>}
                            </div>
                            <div style={{ fontSize: "0.78rem", color: "#555", marginTop: 2 }}>{p.desc}</div>
                          </div>
                        ))}
                      </div>
                    )}
{/* Yabancı Diller */}
{[cvInfo.lang1, cvInfo.lang2].filter(Boolean).length > 0 && (
  <div style={{ marginBottom: 22 }}>
    <div style={{ fontSize: "1rem", fontWeight: 700, borderBottom: "2px solid #e8f0ee", paddingBottom: 6, marginBottom: 10, fontFamily: "Syne, sans-serif" }}>Yabancı Diller</div>
    {[{ l: cvInfo.lang1, lv: cvInfo.lang1Level }, { l: cvInfo.lang2, lv: cvInfo.lang2Level }].filter(x => x.l).map((x, i) => (
      <div key={i} style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", flexShrink: 0, display: "inline-block" }} />
        <div style={{ fontSize: "0.82rem", color: "#444" }}>{x.l}</div>
        <div style={{ fontSize: "0.72rem", color: "#fff", background: "#16a34a", borderRadius: 20, padding: "2px 10px", fontFamily: "DM Mono, monospace" }}>{x.lv}</div>
      </div>
    ))}
  </div>
)}
                    {/* Yetenek Profili */}
                    <div style={{ marginBottom: 22 }}>
                      <div style={{ fontSize: "1rem", fontWeight: 700, borderBottom: "2px solid #e8f0ee", paddingBottom: 6, marginBottom: 12, fontFamily: "Syne, sans-serif" }}>Yetenek Profili</div>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: "0.62rem", letterSpacing: 2, color: "#888", textTransform: "uppercase", fontFamily: "DM Mono, monospace", marginBottom: 6 }}>Programlama Dilleri</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {data.languages.map((l, i) => (
                            <div key={i} style={{ fontSize: "0.73rem", color: "#1a1a1a", background: "#d4e9e2", borderRadius: 20, padding: "3px 11px", fontFamily: "DM Mono, monospace" }}>{l}</div>
                          ))}
                        </div>
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: "0.62rem", letterSpacing: 2, color: "#888", textTransform: "uppercase", fontFamily: "DM Mono, monospace", marginBottom: 6 }}>Beceriler & Frameworkler</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {data.skills.map((s, i) => (
                            <div key={i} style={{ fontSize: "0.73rem", color: "#1a1a1a", background: "#cce8f5", borderRadius: 20, padding: "3px 11px", fontFamily: "DM Mono, monospace" }}>{s}</div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.62rem", letterSpacing: 2, color: "#888", textTransform: "uppercase", fontFamily: "DM Mono, monospace", marginBottom: 6 }}>Proje Teknolojileri</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {[...new Set(data.topProjects.map(p => p.tech).filter(t => t && t !== "?"))].map((t, i) => (
                            <div key={i} style={{ fontSize: "0.73rem", color: "#1a1a1a", background: "#fde9c4", borderRadius: 20, padding: "3px 11px", fontFamily: "DM Mono, monospace" }}>{t}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── JOBS ── */}
        {tab === "jobs" && (
          <div className="fi">
            <div className="s-title">İş Eşleşmeleri</div>
            <div className="s-sub">// Gerçek ilanlar · kariyer.net · linkedin · indeed</div>
            <div className="card card-top" style={{ marginBottom: 24, maxWidth: 680 }}>
              <div className="card-title">🔍 Filtrele</div>
              <div className="g2">
                <div>
                  <label className="lbl">Unvan</label>
                  <input className="inp" style={{ marginBottom: 0 }} placeholder={data.title} value={jobForm.title} onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <label className="lbl">Şehir</label>
                  <input className="inp" style={{ marginBottom: 0 }} placeholder="İstanbul, Ankara, Remote..." value={jobForm.city} onChange={e => setJobForm(p => ({ ...p, city: e.target.value }))} />
                </div>
              </div>
              <div className="g2" style={{ marginTop: 14 }}>
                <div>
                  <label className="lbl">Çalışma Şekli</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["Fark etmez", "Remote", "Hibrit", "Ofiste"].map(o => (
                      <button key={o} onClick={() => setJobForm(p => ({ ...p, workType: o }))}
                        style={{ padding: "7px 14px", borderRadius: 20, fontSize: "0.78rem", cursor: "pointer", fontFamily: "DM Mono, monospace", border: "1px solid", borderColor: jobForm.workType === o ? "var(--accent)" : "var(--border)", background: jobForm.workType === o ? "rgba(0,245,160,0.1)" : "var(--bg)", color: jobForm.workType === o ? "var(--accent)" : "var(--muted)" }}>{o}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="lbl">Deneyim Seviyesi</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["Fark etmez", "Junior", "Mid", "Senior"].map(o => (
                      <button key={o} onClick={() => setJobForm(p => ({ ...p, level: o }))}
                        style={{ padding: "7px 14px", borderRadius: 20, fontSize: "0.78rem", cursor: "pointer", fontFamily: "DM Mono, monospace", border: "1px solid", borderColor: jobForm.level === o ? "var(--accent2)" : "var(--border)", background: jobForm.level === o ? "rgba(0,217,245,0.1)" : "var(--bg)", color: jobForm.level === o ? "var(--accent2)" : "var(--muted)" }}>{o}</button>
                    ))}
                  </div>
                </div>
              </div>
              <button className="btn" style={{ marginTop: 18 }} onClick={() => { setJobInfo(jobForm); searchJobs(jobForm, data.skills, data.title); }}>
                {jobLoading ? "⟳ Aranıyor..." : "🔍 İş İlanlarını Getir"}
              </button>
            </div>

            {jobLoading && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div className="scan-icon" style={{ margin: "0 auto 16px" }}>🔍</div>
                <div className="mono blink" style={{ color: "var(--accent)", fontSize: "0.85rem" }}>Kariyer.net, LinkedIn ve Indeed taranıyor...</div>
              </div>
            )}

            {!jobLoading && jobResults.length > 0 && (
              <div className="fi">
                <div style={{ fontSize: "0.75rem", color: "var(--muted)", fontFamily: "DM Mono, monospace", marginBottom: 14 }}>
                  {jobResults.length} ilan bulundu · {jobInfo?.city || "Türkiye geneli"} · {jobInfo?.workType || "Tüm çalışma şekilleri"}
                </div>
                {jobResults.map((j, i) => (
                  <div key={i} className="job-card fi" style={{ animationDelay: `${i * 0.08}s`, flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ display: "flex", width: "100%", alignItems: "center", gap: 14 }}>
                      <div className="j-logo">🏢</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{j.company}</div>
                        <div style={{ color: "var(--muted)", fontSize: "0.8rem", fontFamily: "DM Mono, monospace" }}>{j.role}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--accent3)", marginTop: 2 }}>📍 {j.location} · 💻 {j.workType}</div>
                      </div>
                      <div className="j-right">
                        <div className="j-pct">{j.match}%</div>
                        <div className="j-bar-wrap"><div className="j-bar-fill" style={{ width: `${j.match}%` }} /></div>
                        <div style={{ fontSize: "0.62rem", color: "var(--muted)", fontFamily: "DM Mono,monospace", marginTop: 2 }}>eşleşme</div>
                      </div>
                    </div>
                    {j.description && <div style={{ fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.6, paddingLeft: 60 }}>{j.description}</div>}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingLeft: 60 }}>
                      {(j.tags || []).map((t, ti) => <span key={ti} className="stag" style={{ fontSize: "0.68rem", padding: "2px 10px" }}>{t}</span>)}
                    </div>
                    {j.url && j.url !== "#" && (
                      <div style={{ paddingLeft: 60 }}>
                        <a href={j.url} target="_blank" rel="noreferrer" style={{ fontSize: "0.75rem", color: "var(--accent)", fontFamily: "DM Mono, monospace", textDecoration: "none" }}>↗ İlana Git</a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!jobLoading && jobResults.length === 0 && jobInfo && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)", fontFamily: "DM Mono, monospace", fontSize: "0.82rem" }}>
                ⚠ Sonuç bulunamadı. Filtrelerini değiştirip tekrar dene.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}