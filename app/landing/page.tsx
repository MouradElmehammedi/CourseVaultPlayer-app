import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  FolderOpen,
  LockKeyhole,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "CourseVault Player | Private Local Course Player",
  description:
    "A private local course player for downloaded videos and audio lessons.",
};

const features = [
  "Folder scanning with sections",
  "MP3 and MP4 playback",
  "Saved browser progress",
  "Export and import progress",
];

const workflow = [
  ["Select", "Pick a course folder from your computer."],
  ["Study", "Play lessons in a focused course layout."],
  ["Resume", "Return later with progress still intact."],
];

export default function LandingPage() {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <nav className="landing-nav" aria-label="Landing navigation">
          <Link className="landing-brand" href="/">
            <span>CV</span>
            CourseVault Player
          </Link>
          <Link className="landing-nav-link" href="/">
            Open app
          </Link>
        </nav>

        <div className="landing-scene" aria-hidden="true">
          <div className="scene-window scene-window-main">
            <div className="scene-window-bar">
              <span />
              <span />
              <span />
            </div>
            <div className="scene-player">
              <div className="scene-play-button">
                <PlayCircle size={42} />
              </div>
              <div className="scene-timeline">
                <span />
              </div>
            </div>
          </div>
          <div className="scene-window scene-window-side">
            {["01 Introduction", "02 Setup", "03 Build"].map((section, index) => (
              <div className="scene-row" key={section}>
                <span>{section}</span>
                <i style={{ width: `${38 + index * 22}%` }} />
              </div>
            ))}
          </div>
          <div className="scene-rail scene-rail-a" />
          <div className="scene-rail scene-rail-b" />
        </div>

        <div className="landing-hero-content">
          <div className="landing-kicker">
            <LockKeyhole aria-hidden="true" size={16} />
            Private local course player
          </div>
          <h1>CourseVault Player</h1>
          <p>
            A clean way to watch downloaded courses, play local lessons, and
            keep progress without accounts, uploads, or a backend.
          </p>
          <div className="landing-actions">
            <Link className="btn-primary h-12 px-6" href="/">
              Open the app
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
            <a className="btn-secondary h-12 px-6" href="#features">
              View features
            </a>
          </div>
        </div>
      </section>

      <section className="landing-band" id="features">
        <div className="landing-section-heading">
          <span>What it does</span>
          <h2>Turns folders into a course workspace.</h2>
        </div>
        <div className="landing-feature-grid">
          {features.map((feature) => (
            <div className="landing-feature" key={feature}>
              <CheckCircle2 aria-hidden="true" size={20} />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-workflow">
        <div className="landing-section-heading">
          <span>Workflow</span>
          <h2>Designed for offline study sessions.</h2>
        </div>
        <div className="landing-steps">
          {workflow.map(([title, description]) => (
            <article className="landing-step" key={title}>
              <div className="landing-step-icon">
                {title === "Select" ? (
                  <FolderOpen aria-hidden="true" size={22} />
                ) : title === "Study" ? (
                  <PlayCircle aria-hidden="true" size={22} />
                ) : (
                  <ShieldCheck aria-hidden="true" size={22} />
                )}
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
