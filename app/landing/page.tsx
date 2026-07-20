import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  FolderOpen,
  Gauge,
  ListVideo,
  LockKeyhole,
  NotebookPen,
  Play,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Your local learning control room",
  description:
    "Play downloaded courses, keep precise progress, take notes, and build a realistic study rhythm in one private workspace.",
};

const workflow = [
  ["01", "Load", "Choose a local course folder"],
  ["02", "Map", "Turn folders into a curriculum"],
  ["03", "Learn", "Watch, listen, and take notes"],
  ["04", "Return", "Resume from the exact moment"],
];

const systemRows = [
  {
    icon: ListVideo,
    label: "Course map",
    copy: "Sections, lessons, formats, and completion in one fast outline.",
  },
  {
    icon: NotebookPen,
    label: "Working notes",
    copy: "Keep lesson-specific notes beside the media, not in another app.",
  },
  {
    icon: Gauge,
    label: "Pace control",
    copy: "See today’s workload and adjust the finish target before it slips.",
  },
];

function Brand() {
  return (
    <span className="brand-lockup">
      <span className="brand-mark" aria-hidden="true">
        <span className="brand-bracket">[</span>
        <span className="brand-signal" />
        <span className="brand-bracket">]</span>
      </span>
      <span className="brand-name">LEARNVAULT</span>
    </span>
  );
}

export default function LandingPage() {
  return (
    <main className="landing-page" id="main-content">
      <header className="landing-nav">
        <div className="landing-shell landing-nav-inner">
          <Link className="landing-brand" href="/landing" aria-label="LearnVault home">
            <Brand />
          </Link>
          <nav className="landing-nav-links" aria-label="Landing navigation">
            <a href="#system">System</a>
            <a href="#workflow">Workflow</a>
            <a href="#privacy">Local mode</a>
          </nav>
          <Link className="landing-nav-cta" href="/">
            <span>Open workspace</span>
            <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-scanline" aria-hidden="true" />
        <div className="landing-orbit" aria-hidden="true">
          <span />
          <span />
        </div>

        <div className="landing-shell landing-hero-inner">
          <div className="landing-hero-status">
            <span><i /> Local system online</span>
            <span>Course player / progress engine / study planner</span>
          </div>

          <h1>
            Turn every lesson into
            <strong>forward motion.</strong>
          </h1>

          <div className="landing-hero-bottom">
            <p>
              LearnVault turns a folder of downloaded lessons into a focused
              learning system—with playback, progress, notes, and pacing in one place.
            </p>
            <div className="landing-actions">
              <Link className="landing-primary-action" href="/">
                <FolderOpen aria-hidden="true" size={18} />
                Load a course
                <ArrowRight aria-hidden="true" size={17} />
              </Link>
              <a className="landing-secondary-action" href="#system">
                Explore the system
              </a>
            </div>
            <div className="landing-hero-readout">
              <span>LOCAL DATA</span>
              <strong>100%</strong>
              <small>No account. No uploads. No lock-in.</small>
            </div>
          </div>

          <div className="landing-console" aria-label="Preview of the LearnVault course workspace">
            <div className="landing-console-bar">
              <div className="landing-window-controls" aria-hidden="true">
                <i /><i /><i />
              </div>
              <span>COURSE://DESIGN_SYSTEMS</span>
              <div className="landing-console-live"><i /> SESSION ACTIVE</div>
            </div>

            <div className="landing-console-body">
              <aside className="landing-console-rail" aria-hidden="true">
                <span className="is-active">LV</span>
                <span>01</span>
                <span>02</span>
                <span>03</span>
                <span className="rail-bottom">•••</span>
              </aside>

              <div className="landing-console-main">
                <div className="landing-now-learning">
                  <span>MODULE 03 / LESSON 07</span>
                  <span>46:20 TOTAL</span>
                </div>
                <div className="landing-video-frame">
                  <span className="video-corner video-corner-a" />
                  <span className="video-corner video-corner-b" />
                  <div className="landing-video-copy">
                    <small>NOW LEARNING</small>
                    <strong>BUILDING A DEPENDABLE<br />TYPE SCALE</strong>
                  </div>
                  <button type="button" tabIndex={-1} aria-label="Play preview">
                    <Play aria-hidden="true" fill="currentColor" size={24} />
                  </button>
                  <div className="landing-waveform" aria-hidden="true">
                    {[18, 38, 25, 52, 31, 66, 46, 78, 32, 57, 23, 43, 69, 34, 54, 28].map((height, index) => (
                      <i key={index} style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
                <div className="landing-player-controls">
                  <span>18:42</span>
                  <div className="landing-player-track"><i /></div>
                  <span>46:20</span>
                  <span className="landing-speed">1.25×</span>
                </div>
                <div className="landing-lesson-footer">
                  <div>
                    <small>CURRENT LESSON</small>
                    <strong>Rhythm, scale &amp; visual hierarchy</strong>
                  </div>
                  <span><Check size={14} /> MARK COMPLETE</span>
                </div>
              </div>

              <aside className="landing-console-sidebar">
                <div className="landing-sidebar-head">
                  <span>CURRICULUM</span>
                  <small>07 / 32 DONE</small>
                </div>
                <div className="landing-sidebar-progress"><i /></div>
                <div className="landing-module">
                  <strong>01 — FOUNDATIONS</strong>
                  <span className="is-done"><i><Check size={10} /></i> Welcome &amp; setup</span>
                  <span className="is-done"><i><Check size={10} /></i> Design principles</span>
                </div>
                <div className="landing-module is-open">
                  <strong>02 — TYPOGRAPHY</strong>
                  <span className="is-active"><i><Play size={9} fill="currentColor" /></i> Visual hierarchy</span>
                  <span><i /> Choosing type</span>
                  <span><i /> Responsive scales</span>
                </div>
                <div className="landing-module">
                  <strong>03 — COMPOSITION</strong>
                </div>
                <div className="landing-sidebar-session">
                  <Clock3 size={16} />
                  <span><small>TODAY’S TARGET</small><strong>42 MIN REMAINING</strong></span>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <div className="landing-format-strip">
        <div className="landing-shell">
          <span>INPUT FORMATS</span>
          <strong>MP4</strong><i />
          <strong>MP3</strong><i />
          <strong>WAV</strong><i />
          <strong>M4A</strong><i />
          <strong>WEBM</strong>
          <span className="format-note">FILES NEVER LEAVE YOUR DEVICE</span>
        </div>
      </div>

      <section className="landing-system" id="system">
        <div className="landing-shell">
          <div className="landing-section-heading">
            <span>01 / THE SYSTEM</span>
            <h2>One workspace.<br /><strong>Zero lost context.</strong></h2>
            <p>
              Stop rebuilding your setup every time you study. LearnVault keeps the
              course, the moment, and the next step connected.
            </p>
          </div>

          <div className="landing-system-layout">
            <div className="landing-plan-monitor" aria-hidden="true">
              <div className="plan-monitor-top">
                <span>PACE MONITOR</span>
                <small>10-DAY TARGET</small>
              </div>
              <div className="plan-monitor-number">
                <strong>54</strong>
                <span>MIN / DAY</span>
              </div>
              <div className="plan-monitor-bars">
                {[36, 62, 44, 78, 58, 86, 69].map((height, index) => (
                  <i key={index} style={{ height: `${height}%` }}><span>{index + 1}</span></i>
                ))}
              </div>
              <div className="plan-monitor-foot">
                <span><i /> ON PACE</span>
                <span>FINISH / 04 AUG</span>
              </div>
            </div>

            <div className="landing-system-list">
              {systemRows.map(({ icon: Icon, label, copy }, index) => (
                <article key={label}>
                  <span className="system-row-index">0{index + 1}</span>
                  <Icon aria-hidden="true" size={22} />
                  <div>
                    <h3>{label}</h3>
                    <p>{copy}</p>
                  </div>
                  <ArrowUpRight aria-hidden="true" size={18} />
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="landing-workflow" id="workflow">
        <div className="landing-shell">
          <div className="landing-workflow-head">
            <span>02 / REPEATABLE FLOW</span>
            <h2>From folder to finished.</h2>
          </div>
          <ol className="landing-flow">
            {workflow.map(([number, title, copy], index) => (
              <li key={number}>
                <span className="flow-number">{number}</span>
                <div className="flow-node"><i /></div>
                <h3>{title}</h3>
                <p>{copy}</p>
                {index < workflow.length - 1 ? <span className="flow-connector" /> : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="landing-privacy" id="privacy">
        <div className="landing-shell landing-privacy-inner">
          <div className="landing-privacy-badge">
            <LockKeyhole aria-hidden="true" size={24} />
            LOCAL MODE
          </div>
          <h2>Your files.<br />Your machine.</h2>
          <div className="landing-privacy-copy">
            <p>
              Course media stays on your computer. The browser only keeps the
              progress and settings you choose to save.
            </p>
            <span><ShieldCheck size={17} /> No account or cloud library required</span>
          </div>
          <Link className="landing-dark-action" href="/">
            Enter workspace
            <ArrowUpRight aria-hidden="true" size={19} />
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-shell landing-footer-inner">
          <Brand />
          <span>LOCAL LEARNING SYSTEM / V1.0</span>
          <div>
            <span>PRIVATE BY DEFAULT</span>
            <i />
            <span>READY WHEN YOU ARE</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
