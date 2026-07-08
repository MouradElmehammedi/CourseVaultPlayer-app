"use client";

import {
  BrainCircuit,
  CalendarDays,
  Clock3,
  ListChecks,
  LoaderCircle,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  COURSE_PLAN_DAY_PRESETS,
  createCoursePlan,
  formatPlanDuration,
  normalizeTargetDays,
  type CoursePlan,
} from "@/lib/course-plan";
import { getDailyWatchedSeconds } from "@/lib/progress";
import type { Course } from "@/types/course";
import type {
  CoursePlanApiRequest,
  CoursePlanApiResponse,
} from "@/types/course-ai";
import type { CourseProgress } from "@/types/progress";

type AiCoursePlannerProps = {
  course: Course;
  courseProgress?: CourseProgress;
  playbackRate: number;
};

function formatFinishDate(targetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + Math.max(0, targetDays - 1));

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatLecturePace(plan: CoursePlan): string {
  if (plan.remainingLectures === 0) {
    return "Complete";
  }

  if (plan.dailyLectureGoal < 1) {
    return "Less than 1 lecture/day";
  }

  return `${Math.ceil(plan.dailyLectureGoal)} lectures/day`;
}

function confidenceCopy(plan: CoursePlan): string {
  if (plan.confidence === "high") {
    return "High confidence";
  }

  if (plan.confidence === "medium") {
    return `${plan.missingDurationCount} duration estimate${plan.missingDurationCount === 1 ? "" : "s"}`;
  }

  return `Estimated from ${formatPlanDuration(plan.averageLectureSeconds)} average lectures`;
}

function buildApiRequest(
  course: Course,
  plan: CoursePlan,
  watchedTodaySeconds: number,
): CoursePlanApiRequest {
  const remainingTodaySeconds = Math.max(
    0,
    plan.dailyRuntimeSeconds - watchedTodaySeconds,
  );

  return {
    courseName: course.name,
    targetDays: plan.targetDays,
    playbackRate: plan.playbackRate,
    totalLectures: plan.totalLectures,
    completedLectures: plan.completedLectures,
    remainingLectures: plan.remainingLectures,
    completionPercent: plan.completionPercent,
    estimatedRemainingMinutes: Math.round(plan.estimatedRemainingSeconds / 60),
    dailyRuntimeMinutes: Math.round(plan.dailyRuntimeSeconds / 60),
    dailyRealMinutes: Math.round(plan.dailyRealTimeSeconds / 60),
    watchedTodayMinutes: Math.round(watchedTodaySeconds / 60),
    remainingTodayMinutes: Math.round(remainingTodaySeconds / 60),
    confidence: plan.confidence,
    missingDurationCount: plan.missingDurationCount,
    upcomingLectures: plan.remainingLecturesPreview.map((lecture) => ({
      title: lecture.title,
      section: lecture.section,
      remainingMinutes: Math.round(lecture.remainingSeconds / 60),
      progressPercent: lecture.progressPercent,
    })),
  };
}

function AdviceList({ items }: { items: string[] }) {
  return (
    <ul className="ai-advice-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function AiCoursePlanner({
  course,
  courseProgress,
  playbackRate,
}: AiCoursePlannerProps) {
  const [targetDays, setTargetDays] = useState(10);
  const [responseState, setResponseState] = useState<{
    key: string;
    data: CoursePlanApiResponse;
  } | null>(null);
  const [errorState, setErrorState] = useState<{
    key: string;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const plan = useMemo(
    () => createCoursePlan(course, courseProgress, targetDays, playbackRate),
    [course, courseProgress, playbackRate, targetDays],
  );
  const finishDate = useMemo(
    () => formatFinishDate(plan.targetDays),
    [plan.targetDays],
  );
  const watchedTodaySeconds = getDailyWatchedSeconds(courseProgress);
  const remainingTodaySeconds = Math.max(
    0,
    plan.dailyRuntimeSeconds - watchedTodaySeconds,
  );
  const todayProgressPercent =
    plan.dailyRuntimeSeconds > 0
      ? Math.min(100, Math.round((watchedTodaySeconds / plan.dailyRuntimeSeconds) * 100))
      : 100;
  const realTimeLeftToday = remainingTodaySeconds / plan.playbackRate;
  const planKey = `${course.id}:${plan.targetDays}:${Math.round(
    plan.estimatedRemainingSeconds,
  )}:${plan.playbackRate}`;
  const response =
    responseState?.key === planKey ? responseState.data : null;
  const error = errorState?.key === planKey ? errorState.message : null;

  const requestAiPlan = async () => {
    setLoading(true);
    setErrorState(null);

    try {
      const apiResponse = await fetch("/api/course-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildApiRequest(course, plan, watchedTodaySeconds)),
      });

      if (!apiResponse.ok) {
        throw new Error("The AI planner request failed.");
      }

      const data = (await apiResponse.json()) as CoursePlanApiResponse;
      setResponseState({ key: planKey, data });
    } catch {
      setErrorState({ key: planKey, message: "AI planning is unavailable right now." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ai-plan-panel">
      <div className="ai-plan-header">
        <div className="ai-plan-title">
          <span className="ai-plan-mark">
            <BrainCircuit aria-hidden="true" size={21} />
          </span>
          <span className="min-w-0">
            <span className="ai-plan-kicker">AI Study Plan</span>
            <h2>{course.name}</h2>
          </span>
        </div>
        <button
          className="btn-primary ai-plan-action"
          disabled={loading}
          onClick={requestAiPlan}
          type="button"
        >
          {loading ? (
            <LoaderCircle aria-hidden="true" className="ai-spin" size={17} />
          ) : (
            <Sparkles aria-hidden="true" size={17} />
          )}
          {loading ? "Planning" : "Ask AI"}
        </button>
      </div>

      <div className="ai-target-row">
        <div className="ai-target-presets" aria-label="Target days">
          {COURSE_PLAN_DAY_PRESETS.map((days) => (
            <button
              aria-pressed={plan.targetDays === days}
              className="ai-day-preset"
              key={days}
              onClick={() => setTargetDays(days)}
              type="button"
            >
              {days < 30 ? `${days}d` : `${Math.round(days / 30)}mo`}
            </button>
          ))}
        </div>
        <label className="ai-custom-days">
          <span>Target</span>
          <input
            className="field"
            max={365}
            min={1}
            onChange={(event) =>
              setTargetDays(normalizeTargetDays(Number(event.target.value)))
            }
            type="number"
            value={plan.targetDays}
          />
          <span>days</span>
        </label>
      </div>

      <div className="ai-metrics-grid">
        <div className="ai-metric">
          <Clock3 aria-hidden="true" size={18} />
          <span>Daily content</span>
          <strong>{formatPlanDuration(plan.dailyRuntimeSeconds)}</strong>
        </div>
        <div className="ai-metric">
          <Zap aria-hidden="true" size={18} />
          <span>Real time</span>
          <strong>{formatPlanDuration(plan.dailyRealTimeSeconds)}</strong>
        </div>
        <div className="ai-metric">
          <CalendarDays aria-hidden="true" size={18} />
          <span>Finish</span>
          <strong>{finishDate}</strong>
        </div>
        <div className="ai-metric">
          <Target aria-hidden="true" size={18} />
          <span>Pace</span>
          <strong>{formatLecturePace(plan)}</strong>
        </div>
      </div>

      <div className="ai-today-progress">
        <div className="ai-today-head">
          <div>
            <span>Today</span>
            <strong>
              {remainingTodaySeconds <= 0
                ? "Daily goal complete"
                : `${formatPlanDuration(remainingTodaySeconds)} left today`}
            </strong>
          </div>
          <span>{todayProgressPercent}%</span>
        </div>
        <div className="ai-today-meter" aria-label="Today watch progress">
          <span style={{ width: `${todayProgressPercent}%` }} />
        </div>
        <div className="ai-today-grid">
          <div>
            <strong>{formatPlanDuration(watchedTodaySeconds)}</strong>
            <span>watched today</span>
          </div>
          <div>
            <strong>{formatPlanDuration(remainingTodaySeconds)}</strong>
            <span>remaining today</span>
          </div>
          <div>
            <strong>{formatPlanDuration(realTimeLeftToday)}</strong>
            <span>real time left</span>
          </div>
        </div>
      </div>

      <div className="ai-plan-summary">
        <div>
          <strong>{plan.remainingLectures}</strong>
          <span>remaining lectures</span>
        </div>
        <div>
          <strong>{formatPlanDuration(plan.estimatedRemainingSeconds)}</strong>
          <span>remaining content</span>
        </div>
        <div>
          <strong>{confidenceCopy(plan)}</strong>
          <span>estimate quality</span>
        </div>
      </div>

      <div className="ai-session-strip">
        <div className="ai-section-heading">
          <ListChecks aria-hidden="true" size={18} />
          <h3>Next Sessions</h3>
        </div>
        <div className="ai-session-list">
          {plan.dayPreview.length > 0 ? (
            plan.dayPreview.map((day) => (
              <div className="ai-session-row" key={day.day}>
                <span className="ai-session-day">Day {day.day}</span>
                <span className="ai-session-main">
                  {day.lectures.length > 0
                    ? day.lectures
                        .slice(0, 2)
                        .map((lecture) => lecture.title)
                        .join(", ")
                    : "Review and notes"}
                  {day.lectures.length > 2 ? ` +${day.lectures.length - 2}` : ""}
                </span>
                <span className="ai-session-time">
                  {formatPlanDuration(day.runtimeSeconds)}
                </span>
              </div>
            ))
          ) : (
            <div className="ai-session-row">
              <span className="ai-session-day">Done</span>
              <span className="ai-session-main">No remaining lectures</span>
              <span className="ai-session-time">0m</span>
            </div>
          )}
        </div>
      </div>

      {response ? (
        <div className="ai-response">
          <div className="ai-response-head">
            <Sparkles aria-hidden="true" size={18} />
            <div>
              <h3>{response.advice.headline}</h3>
              <p>
                {response.source === "groq"
                  ? `Groq ${response.model ?? ""}`.trim()
                  : "Local planner"}
              </p>
            </div>
          </div>
          {response.warning ? (
            <p className="ai-warning">{response.warning}</p>
          ) : null}
          <div className="ai-advice-grid">
            <div>
              <h4>Daily Plan</h4>
              <AdviceList items={response.advice.dailyPlan} />
            </div>
            <div>
              <h4>Pacing</h4>
              <AdviceList items={response.advice.pacing} />
            </div>
            <div>
              <h4>Risks</h4>
              <AdviceList items={response.advice.risks} />
            </div>
            <div>
              <h4>Next Actions</h4>
              <AdviceList items={response.advice.nextActions} />
            </div>
          </div>
        </div>
      ) : null}

      {error ? <p className="ai-warning">{error}</p> : null}
    </section>
  );
}
