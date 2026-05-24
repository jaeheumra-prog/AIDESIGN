"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useOasisPresence } from "@/hooks/useOasisPresence";
import { seatDescriptions, seatLabels, type PresenceRecord, type SeatId } from "@/lib/oasis";

type CanvasOccupant = Omit<PresenceRecord, "seatId"> & {
  seatId: SeatId;
  kind: "you" | "guest";
};

type EntryMode = "role" | "jobseeker-survey" | "jobseeker-profile" | "recruiter";

type CandidateSurvey = {
  field: string;
  tools: string[];
  roles: string[];
  budget: string;
  timeline: string;
};

const OasisCanvas = dynamic(() => import("@/components/OasisCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-[#120f0d] text-sm uppercase tracking-[0.18em] text-[#f4eadb]/75">
      Preparing the lounge...
    </div>
  ),
});

const fieldOptions = [
  "Product Design",
  "Brand Design",
  "UI/UX Design",
  "Graphic Design",
  "Illustration",
  "Motion Graphics",
  "3D Modeling",
  "VFX",
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "Computer Science",
  "Data Science",
  "Machine Learning",
  "AI Engineering",
  "Game Development",
  "Computer Security",
  "Cloud Infrastructure",
  "DevOps",
  "Semiconductor",
  "Embedded Systems",
  "Robotics",
  "Bioinformatics",
  "Marketing",
  "Business Analysis",
  "Technical Writing",
];

const toolOptions = [
  "Java",
  "Python",
  "JavaScript",
  "TypeScript",
  "SQL",
  "Spring Boot",
  "React",
  "Next.js",
  "Node.js",
  "TensorFlow",
  "PyTorch",
  "Figma",
  "Adobe Photoshop",
  "Adobe Illustrator",
  "After Effects",
  "Premiere Pro",
  "DaVinci Resolve",
  "Blender",
  "Maya",
  "Cinema 4D",
  "Unity",
  "Unreal Engine",
  "Docker",
  "Kubernetes",
  "AWS",
  "Notion",
  "Jira",
  "Tableau",
];

const roleOptions = [
  "PM",
  "PL",
  "PA",
  "PO",
  "Designer",
  "Frontend Developer",
  "Backend Developer",
  "Data Analyst",
  "Researcher",
  "Technical Artist",
  "Creative Technologist",
  "Security Engineer",
  "ML Engineer",
];

const budgetOptions = [
  "50만원 이하",
  "50만원 - 150만원",
  "150만원 - 300만원",
  "300만원 - 500만원",
  "500만원 이상",
  "논의 후 결정",
];

const timelineOptions = [
  {
    id: "short",
    title: "단기 프로젝트",
    description: "빠르게 합류해서 명확한 산출물을 만들고 싶은 흐름",
  },
  {
    id: "long",
    title: "장기 프로젝트",
    description: "조금 더 길게 호흡하며 팀처럼 성장하고 싶은 흐름",
  },
];

const recruiterCategories = [
  {
    title: "브랜드 디자인",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "브랜딩 서비스",
    image:
      "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "소셜 미디어 디자인",
    image:
      "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "웹 사이트 디자인",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "일러스트레이션",
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "패키징 디자인",
    image:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "랜딩 페이지 디자인",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "UI/UX 디자인",
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "건축 렌더링",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "편집지 디자인",
    image:
      "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "글꼴 및 타이포그래피",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "모든 카테고리 검색",
    image:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
  },
];

function RoleSelectScreen({
  onSelect,
}: {
  onSelect: (mode: Exclude<EntryMode, "role" | "jobseeker-profile">) => void;
}) {
  const cards = [
    {
      id: "jobseeker-survey" as const,
      eyebrow: "Job Seeker",
      title: "취준생으로 입장",
      description:
        "짧은 설문을 통해 분야, 역할, 툴, 프로젝트 선호를 정리한 뒤 포트폴리오형 프로필로 들어갑니다.",
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "recruiter" as const,
      eyebrow: "Hiring Manager",
      title: "인사담당자로 입장",
      description:
        "채용 목적과 카테고리 중심의 탐색 화면으로 들어가 인재를 빠르게 압축해서 보는 흐름을 먼저 보여줍니다.",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  return (
    <div className="absolute inset-0 z-20 bg-[#120f0d]/72 px-6 py-10 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl flex-col justify-between">
        <div className="pointer-events-none flex items-start justify-between gap-6 text-[#f4eadb]">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.32em] text-[#f4eadb]/58">Focus Oasis Entry</p>
            <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">어떤 입장으로 들어오시나요?</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#f4eadb]/70 sm:text-base">
              늦은 밤 라운지의 문 앞에서, 먼저 당신이 어떤 역할로 이 공간에 들어오는지 고릅니다.
            </p>
          </div>

          <div className="text-right text-xs leading-6 text-[#f4eadb]/58">
            <p>Ra Jae-heum</p>
            <p>Student ID 20261027</p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => onSelect(card.id)}
              className="group relative min-h-[340px] overflow-hidden rounded-lg border border-white/10 text-left"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(18,15,13,0.86), rgba(18,15,13,0.26)), url(${card.image})`,
                }}
              />
              <div className="relative flex h-full flex-col justify-end p-7 text-[#f4eadb]">
                <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#f4eadb]/56">{card.eyebrow}</p>
                <h2 className="mt-4 text-3xl font-semibold">{card.title}</h2>
                <p className="mt-3 max-w-lg text-sm leading-7 text-[#f4eadb]/74">{card.description}</p>
                <span className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-white/10 text-lg transition group-hover:bg-white/18">
                  →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SelectablePills({
  options,
  search,
  onSearchChange,
  selected,
  onToggle,
  multi = false,
}: {
  options: string[];
  search: string;
  onSearchChange: (value: string) => void;
  selected: string[];
  onToggle: (value: string) => void;
  multi?: boolean;
}) {
  const filtered = options.filter((option) => option.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div>
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={multi ? "검색해서 여러 개를 고르세요" : "검색해서 한 가지를 고르세요"}
        className="w-full rounded-md border border-[#f4eadb]/12 bg-[#241c18] px-4 py-3 text-base text-[#f4eadb] outline-none transition placeholder:text-[#f4eadb]/28 focus:border-[#ffca92]/55"
      />

      <div className="mt-4 flex max-h-[240px] flex-wrap gap-3 overflow-y-auto pr-1">
        {filtered.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                isSelected
                  ? "border-[#ffca92]/55 bg-[#f0bb86]/15 text-[#ffddba]"
                  : "border-[#f4eadb]/10 bg-[#1d1714] text-[#f4eadb]/74 hover:bg-[#2a211d]"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs leading-5 text-[#f4eadb]/45">
        {selected.length > 0
          ? selected.join(", ")
          : multi
            ? "여러 개를 골라도 좋습니다. 지금 자신 있게 다룰 수 있는 것들을 편하게 고르세요."
            : "지금 가장 가까운 방향 하나를 먼저 골라볼게요."}
      </p>
    </div>
  );
}

function CandidateSurveyScreen({
  draftName,
  setDraftName,
  survey,
  setSurvey,
  onBackToRole,
  onComplete,
}: {
  draftName: string;
  setDraftName: (value: string) => void;
  survey: CandidateSurvey;
  setSurvey: React.Dispatch<React.SetStateAction<CandidateSurvey>>;
  onBackToRole: () => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);
  const [fieldSearch, setFieldSearch] = useState("");
  const [toolSearch, setToolSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");

  const steps = [
    {
      title: "먼저, 어떻게 불러드리면 될까요?",
      caption: "라운지에 들어갔을 때 이 이름이 당신 자리 위에 떠오릅니다.",
      valid: draftName.trim().length > 0,
      content: (
        <div className="space-y-4">
          <input
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder="예: 라재흠"
            className="w-full rounded-md border border-[#f4eadb]/12 bg-[#241c18] px-4 py-4 text-lg text-[#f4eadb] outline-none transition placeholder:text-[#f4eadb]/28 focus:border-[#ffca92]/55"
          />
          <p className="text-sm leading-6 text-[#f4eadb]/55">
            이름은 단순한 텍스트가 아니라, 다른 사람에게 당신을 기억시키는 첫 인상 역할을 합니다.
          </p>
        </div>
      ),
    },
    {
      title: "희망 분야는 어디에 가까울까요?",
      caption: "검색해서 찾고, 지금 가장 가고 싶은 중심축 하나를 고릅니다.",
      valid: survey.field.length > 0,
      content: (
        <SelectablePills
          options={fieldOptions}
          search={fieldSearch}
          onSearchChange={setFieldSearch}
          selected={survey.field ? [survey.field] : []}
          onToggle={(value) =>
            setSurvey((current) => ({
              ...current,
              field: current.field === value ? "" : value,
            }))
          }
        />
      ),
    },
    {
      title: "다룰 수 있는 툴은 어떤 것들이 있나요?",
      caption: "최소 하나 이상, 여러 개를 골라도 좋습니다.",
      valid: survey.tools.length > 0,
      content: (
        <SelectablePills
          options={toolOptions}
          search={toolSearch}
          onSearchChange={setToolSearch}
          selected={survey.tools}
          onToggle={(value) =>
            setSurvey((current) => ({
              ...current,
              tools: current.tools.includes(value)
                ? current.tools.filter((tool) => tool !== value)
                : [...current.tools, value],
            }))
          }
          multi
        />
      ),
    },
    {
      title: "어떤 역할군으로 참여하고 싶으신가요?",
      caption: "PM이든 디자이너든 엔지니어든, 지금 맡고 싶은 역할의 결을 보여주세요.",
      valid: survey.roles.length > 0,
      content: (
        <SelectablePills
          options={roleOptions}
          search={roleSearch}
          onSearchChange={setRoleSearch}
          selected={survey.roles}
          onToggle={(value) =>
            setSurvey((current) => ({
              ...current,
              roles: current.roles.includes(value)
                ? current.roles.filter((role) => role !== value)
                : [...current.roles, value],
            }))
          }
          multi
        />
      ),
    },
    {
      title: "원하는 예산대는 어느 정도인가요?",
      caption: "프로젝트의 온도와 폭을 가늠하는 기준이 됩니다.",
      valid: survey.budget.length > 0,
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          {budgetOptions.map((option) => {
            const isSelected = survey.budget === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setSurvey((current) => ({ ...current, budget: option }))}
                className={`rounded-lg border px-4 py-4 text-left transition ${
                  isSelected
                    ? "border-[#ffca92]/55 bg-[#f0bb86]/15 text-[#ffddba]"
                    : "border-[#f4eadb]/10 bg-[#1d1714] text-[#f4eadb]/74 hover:bg-[#2a211d]"
                }`}
              >
                <p className="text-sm font-medium">{option}</p>
              </button>
            );
          })}
        </div>
      ),
    },
    {
      title: "단기 프로젝트와 장기 프로젝트 중 무엇을 원하시나요?",
      caption: "짧고 선명한 협업이 좋은지, 오래 호흡하는 팀 프로젝트가 좋은지 마지막으로 묻습니다.",
      valid: survey.timeline.length > 0,
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          {timelineOptions.map((option) => {
            const isSelected = survey.timeline === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSurvey((current) => ({ ...current, timeline: option.id }))}
                className={`rounded-lg border px-5 py-5 text-left transition ${
                  isSelected
                    ? "border-[#ffca92]/55 bg-[#f0bb86]/15 text-[#ffddba]"
                    : "border-[#f4eadb]/10 bg-[#1d1714] text-[#f4eadb]/74 hover:bg-[#2a211d]"
                }`}
              >
                <p className="text-base font-medium">{option.title}</p>
                <p className="mt-2 text-sm leading-6 text-inherit/80">{option.description}</p>
              </button>
            );
          })}
        </div>
      ),
    },
  ];

  const currentStep = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="absolute inset-0 z-20 bg-[#120f0d]/74 px-6 py-10 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-3xl flex-col">
        <div className="flex items-center justify-between gap-4 text-[#f4eadb]">
          <button
            type="button"
            onClick={() => {
              if (step === 0) {
                onBackToRole();
                return;
              }

              setStep((value) => value - 1);
            }}
            className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-[#f4eadb]/84 transition hover:bg-white/10"
          >
            ← {step === 0 ? "역할 선택으로" : "이전 질문"}
          </button>

          <p className="text-xs uppercase tracking-[0.28em] text-[#f4eadb]/48">
            {step + 1} / {steps.length}
          </p>
        </div>

        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-[#e2ab73] transition-all"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="mt-8 flex flex-1 items-center">
          <div className="w-full rounded-2xl border border-white/8 bg-[#1a1411]/90 p-7 text-[#f4eadb] shadow-2xl sm:p-10">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#f4eadb]/48">Candidate Intake</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">{currentStep.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#f4eadb]/68 sm:text-base">{currentStep.caption}</p>

            <div className="mt-8">{currentStep.content}</div>

            <div className="mt-10 flex items-center justify-end">
              <button
                type="button"
                disabled={!currentStep.valid}
                onClick={() => {
                  if (isLast) {
                    onComplete();
                    return;
                  }

                  setStep((value) => value + 1);
                }}
                className="rounded-md bg-[#e2ab73] px-5 py-3 text-sm font-medium text-[#241711] transition hover:bg-[#f0bb86] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isLast ? "프로필 미리보기로 이동" : "다음 질문"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecruiterScreen({
  query,
  setQuery,
  onBack,
}: {
  query: string;
  setQuery: (value: string) => void;
  onBack: () => void;
}) {
  const filteredCategories = recruiterCategories.filter((category) =>
    category.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="absolute inset-0 z-20 overflow-y-auto bg-[#f6f7fb] px-6 py-10 text-[#1f2127]">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-start justify-between gap-6">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-[#d6def9] bg-white px-4 py-2 text-sm text-[#4a5cc2] shadow-sm transition hover:bg-[#f3f6ff]"
          >
            ← 역할 선택으로
          </button>

          <div className="text-right text-xs leading-6 text-[#5f6472]">
            <p>Hiring Discovery</p>
            <p>Focus Oasis Recruiter Preview</p>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-4xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-[#1f2127] sm:text-6xl">
            무엇을 위한 채용 중이십니까?
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[#434958] sm:text-xl">
            어떤 목적을 위해 채용하고자 하는지 간단히 설명해 주세요. 추천 항목과 AI를 통해 적합한 프리랜서를 빠르게 연결해
            드리겠습니다. <span className="underline underline-offset-4">Adobe 생성형 AI 약관</span>
          </p>

          <div className="mt-10 rounded-full border border-[#4a6cf7] bg-white p-2 shadow-[0_20px_70px_rgba(68,97,242,0.12)]">
            <div className="flex items-center gap-3 rounded-full bg-white px-2 sm:px-4">
              <span className="rounded-xl bg-[#eef3ff] px-5 py-4 text-sm font-medium text-[#3e62f5]">찾는 항목</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="예: 내 반려동물 사료 회사에 대한 일러스트레이터, 예산 $800"
                className="min-w-0 flex-1 bg-transparent px-1 py-4 text-sm text-[#5170f4] outline-none placeholder:text-[#6b88f6]/70 sm:text-xl"
              />
              <button
                type="button"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d9e8ff] text-3xl text-[#6e8ce8] transition hover:bg-[#c9dcff]"
              >
                ›
              </button>
            </div>
          </div>

          <p className="mt-12 text-lg text-[#646b7b]">또는 카테고리를 선택하여 프리랜서 찾아보기:</p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {filteredCategories.map((category) => (
              <button
                key={category.title}
                type="button"
                onClick={() => setQuery(category.title)}
                className="group relative h-[92px] w-[180px] overflow-hidden rounded-2xl text-left text-white shadow-[0_14px_36px_rgba(38,44,70,0.14)] transition hover:-translate-y-0.5"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(12,15,24,0.72), rgba(12,15,24,0.3)), url(${category.image})`,
                  }}
                />
                <div className="relative flex h-full items-end p-4">
                  <p className="text-lg font-semibold">{category.title}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CandidateProfilePreview({
  draftName,
  survey,
  onBack,
  onEnter,
}: {
  draftName: string;
  survey: CandidateSurvey;
  onBack: () => void;
  onEnter: () => void;
}) {
  const heroImage =
    survey.field.includes("Design") || survey.field.includes("Illustration") || survey.field.includes("VFX")
      ? "https://images.unsplash.com/photo-1616444493079-c71a6f0062b3?auto=format&fit=crop&w=1200&q=80"
      : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80";

  const projectCards = [
    {
      title: `${survey.field || "Creative"} Proof Reel`,
      category: "Featured Work",
      description:
        "짧은 작업 모음과 핵심 결과물을 한 장면씩 빠르게 보여주는 대표 프리뷰. 영상, 이미지, 캡션으로 실력을 먼저 증명합니다.",
      image:
        "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
      tags: survey.tools.slice(0, 3).length > 0 ? survey.tools.slice(0, 3) : ["Portfolio", "Visual Proof", "Capability"],
    },
    {
      title: "One Minute Self Introduction",
      category: "Video Essay",
      description:
        "나는 어떤 사람이고 어떤 팀에서 어떤 결로 일하는 사람인지, 쇼츠 길이의 영상 한 편으로 전하는 섹션입니다.",
      image:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      tags: ["Shorts", "Pitch", "Personality"],
    },
    {
      title: "Project Match Snapshot",
      category: "Preferences",
      description: `${survey.budget || "논의 후 결정"} 예산, ${
        survey.timeline === "long" ? "장기 협업 선호" : "단기 프로젝트 선호"
      }, ${survey.roles.slice(0, 2).join(" / ") || "다양한 역할 가능"} 중심으로 매칭되는 프로필 카드입니다.`,
      image:
        "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80",
      tags: survey.roles.slice(0, 3).length > 0 ? survey.roles.slice(0, 3) : ["PM", "Designer", "Builder"],
    },
  ];

  const trustBadges = ["증명사진 프로필", "본인 인증 예정", "쇼츠 자소서", "작업물 첨부 가능"];

  return (
    <div className="absolute inset-0 z-20 overflow-y-auto bg-[#faf8f4] text-[#1b1b1b]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm text-[#57534e]">
            <button
              type="button"
              onClick={onBack}
              className="rounded-full border border-[#d8d1c7] bg-white px-4 py-2 transition hover:bg-[#f4efe7]"
            >
              ← 설문 수정
            </button>
            <span className="hidden sm:inline">Graphic Designer Portfolio inspired profile</span>
          </div>

          <button
            type="button"
            onClick={onEnter}
            className="rounded-full bg-[#1b1b1b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#35312b]"
          >
            이 프로필로 도서관 입장
          </button>
        </div>

        <section className="grid gap-12 pb-20 pt-14 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="text-[0.72rem] uppercase tracking-[0.32em] text-[#8a7f73]">Candidate Portfolio Preview</p>
              <h1 className="text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl">
                {draftName}
                <span className="mt-2 block text-[#7b6b5d]">{survey.field || "Aspiring Creative Talent"}</span>
              </h1>
              <p className="max-w-xl text-lg leading-8 text-[#5f5750]">
                {survey.roles.length > 0 ? survey.roles.join(" · ") : "Multidisciplinary collaborator"} 로 참여하고 싶고,
                {survey.tools.length > 0 ? ` ${survey.tools.slice(0, 4).join(", ")} ` : " 다양한 도구 "}를 통해 결과물을 만들어내는
                사람입니다. 짧지만 선명하게, 경력보다 증명으로 먼저 보이고 싶습니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {trustBadges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-[#d6cbbd] bg-white px-4 py-2 text-sm text-[#51483f]"
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#e6ddd1] bg-white p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-[#9a8d7e]">Preferred Budget</p>
                <p className="mt-3 text-2xl font-medium text-[#1f1b17]">{survey.budget || "논의 후 결정"}</p>
              </div>
              <div className="rounded-2xl border border-[#e6ddd1] bg-white p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-[#9a8d7e]">Project Style</p>
                <p className="mt-3 text-2xl font-medium text-[#1f1b17]">
                  {survey.timeline === "long" ? "Long Project" : "Short Project"}
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square max-w-md overflow-hidden rounded-[2rem] border border-[#e9dfd4] bg-white p-4 shadow-[0_32px_80px_rgba(63,44,21,0.12)]">
              <div
                className="h-full w-full rounded-[1.6rem] bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(24,19,16,0.18), rgba(24,19,16,0.02)), url(${heroImage})`,
                }}
              />
            </div>
            <div className="absolute -bottom-6 -left-4 rounded-2xl border border-[#eadfd4] bg-white px-5 py-4 shadow-lg">
              <p className="text-xs uppercase tracking-[0.22em] text-[#9b8e82]">Core Stack</p>
              <p className="mt-2 max-w-[220px] text-sm leading-6 text-[#433b34]">
                {survey.tools.length > 0 ? survey.tools.slice(0, 5).join(", ") : "Figma, Photoshop, React, SQL"}
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-[#e6ddd1] py-20">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-medium sm:text-4xl">Featured Proof</h2>
            <p className="mx-auto max-w-2xl text-base leading-8 text-[#5f5750]">
              다운로드에서 읽어본 그래픽 디자이너 포트폴리오 템플릿의 흐름을 가져와, 지금 이 지원자 프로필에 맞는 증명 카드들로
              다시 엮었습니다.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {projectCards.map((project) => (
              <article
                key={project.title}
                className="overflow-hidden rounded-[1.5rem] border border-[#e8dfd4] bg-white shadow-[0_18px_40px_rgba(50,34,18,0.08)]"
              >
                <div
                  className="h-64 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(22,18,15,0.18), rgba(22,18,15,0.04)), url(${project.image})`,
                  }}
                />
                <div className="space-y-4 p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-[#a08f80]">{project.category}</p>
                  <h3 className="text-xl font-medium text-[#1f1b17]">{project.title}</h3>
                  <p className="text-sm leading-7 text-[#5f5750]">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#f5efe8] px-3 py-1.5 text-xs font-medium text-[#62574d]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-8 border-t border-[#e6ddd1] py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <h2 className="text-3xl font-medium">Skills & Match Signals</h2>
            <p className="max-w-2xl text-base leading-8 text-[#5f5750]">
              이 프로필은 단순한 소개 페이지가 아니라, 나를 빠르게 이해시키는 매칭 시그널 페이지입니다. 툴, 역할, 예산,
              프로젝트 길이까지 한 장에서 읽히게 구성했습니다.
            </p>

            <div className="flex flex-wrap gap-3">
              {survey.tools.map((tool) => (
                <span
                  key={tool}
                  className="rounded-full border border-[#ddd2c5] bg-white px-4 py-2 text-sm text-[#4d433a]"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[#e6ddd1] bg-white p-7 shadow-[0_20px_50px_rgba(50,34,18,0.06)]">
            <p className="text-sm uppercase tracking-[0.24em] text-[#a08f80]">Quick Match Summary</p>
            <div className="mt-6 space-y-5 text-sm leading-7 text-[#4f463e]">
              <div>
                <p className="text-[#9a8d80]">희망 분야</p>
                <p className="mt-1 text-base font-medium text-[#1f1b17]">{survey.field || "미선택"}</p>
              </div>
              <div>
                <p className="text-[#9a8d80]">희망 역할군</p>
                <p className="mt-1 text-base font-medium text-[#1f1b17]">
                  {survey.roles.length > 0 ? survey.roles.join(", ") : "미선택"}
                </p>
              </div>
              <div>
                <p className="text-[#9a8d80]">프로젝트 선호</p>
                <p className="mt-1 text-base font-medium text-[#1f1b17]">
                  {survey.timeline === "long" ? "장기 프로젝트" : "단기 프로젝트"}
                </p>
              </div>
              <div>
                <p className="text-[#9a8d80]">예산 기준</p>
                <p className="mt-1 text-base font-medium text-[#1f1b17]">{survey.budget || "논의 후 결정"}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function OasisStage() {
  const {
    ready,
    realtimeMode,
    draftName,
    setDraftName,
    activeName,
    currentUser,
    others,
    selectedSeat,
    join,
    signOut,
    requestSeat,
    standUp,
  } = useOasisPresence();

  const [notice, setNotice] = useState(
    "Realtime is ready to become shared presence. Once a shared backend is configured, seats will sync across separate computers too.",
  );
  const [entryMode, setEntryMode] = useState<EntryMode>("role");
  const [recruiterQuery, setRecruiterQuery] = useState("");
  const [survey, setSurvey] = useState<CandidateSurvey>({
    field: "",
    tools: [],
    roles: [],
    budget: "",
    timeline: "",
  });

  const occupants = useMemo<CanvasOccupant[]>(() => {
    const everyone = [...others];
    if (currentUser) {
      everyone.push(currentUser);
    }

    return everyone
      .filter((occupant): occupant is PresenceRecord & { seatId: SeatId } => occupant.seatId !== null)
      .map((occupant) => ({
        ...occupant,
        kind: occupant.id === currentUser?.id ? "you" : "guest",
      }));
  }, [currentUser, others]);

  const handleProfileEnter = () => {
    const success = join(draftName);
    if (!success) {
      setNotice("이름이 들어가야 라운지에서 서로를 알아볼 수 있어요.");
      return;
    }

    setNotice(
      realtimeMode === "supabase"
        ? `${draftName}님, ${survey.field || "새로운 분야"} 프로필이 라운지에 연결됐어요. 이제 다른 컴퓨터에서도 당신의 좌석이 보이기 시작합니다.`
        : `${draftName}님, ${survey.field || "새로운 분야"} 프로필이 준비됐어요. 지금은 로컬 데모 모드라 같은 브라우저 안에서만 좌석이 공유됩니다.`,
    );
  };

  const handleSeatSelect = (seatId: SeatId) => {
    const result = requestSeat(seatId);

    if (!result.ok) {
      setNotice(`${seatLabels[seatId]} is already taken by ${result.occupant.name}. The room politely keeps that desk reserved.`);
      return;
    }

    setNotice(`You settled into ${seatLabels[seatId]}. Other open Oasis screens should now see your chair glow and your name appear.`);
  };

  const handleSeatBlocked = (seatId: SeatId) => {
    const occupant = occupants.find((entry) => entry.seatId === seatId && entry.kind === "guest");
    if (occupant) {
      setNotice(`${seatLabels[seatId]} is occupied by ${occupant.name}. They're ${occupant.mood.toLowerCase()}.`);
      return;
    }

    setNotice(`${seatLabels[seatId]} is already taken right now.`);
  };

  const seatCopy = useMemo(() => {
    if (!selectedSeat) {
      return {
        title: "Choose a seat",
        description: notice,
      };
    }

    return {
      title: seatLabels[selectedSeat],
      description: `${seatDescriptions[selectedSeat]} ${notice}`,
    };
  }, [notice, selectedSeat]);

  const showLibraryUi = ready && Boolean(activeName);

  return (
    <>
      <OasisCanvas
        selectedSeat={selectedSeat}
        occupants={occupants}
        onSeatSelect={handleSeatSelect}
        onSeatBlocked={handleSeatBlocked}
      />

      {!showLibraryUi ? (
        entryMode === "role" ? (
          <RoleSelectScreen onSelect={setEntryMode} />
        ) : entryMode === "jobseeker-survey" ? (
          <CandidateSurveyScreen
            draftName={draftName}
            setDraftName={setDraftName}
            survey={survey}
            setSurvey={setSurvey}
            onBackToRole={() => setEntryMode("role")}
            onComplete={() => setEntryMode("jobseeker-profile")}
          />
        ) : entryMode === "jobseeker-profile" ? (
          <CandidateProfilePreview
            draftName={draftName}
            survey={survey}
            onBack={() => setEntryMode("jobseeker-survey")}
            onEnter={handleProfileEnter}
          />
        ) : (
          <RecruiterScreen
            query={recruiterQuery}
            setQuery={setRecruiterQuery}
            onBack={() => setEntryMode("role")}
          />
        )
      ) : null}

      {showLibraryUi ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-6 p-6 text-[#f4eadb]">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.32em] text-[#f4eadb]/60">Shared Study Lounge</p>
              <h1 className="mt-3 text-3xl font-semibold">Focus Oasis</h1>
            </div>

            <div className="text-right text-xs leading-6 text-[#f4eadb]/65">
              <p>{activeName}</p>
              <p>Student ID 20261027</p>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 text-[#f4eadb]">
            <div className="max-w-sm">
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#f4eadb]/55">Shared Study Lounge</p>
              <h2 className="mt-3 text-2xl font-semibold">{seatCopy.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#f4eadb]/72">{seatCopy.description}</p>
            </div>

            <div className="pointer-events-auto flex items-end gap-4">
              <div className="max-h-[72vh] min-w-[300px] overflow-y-auto rounded-md border border-[#f4eadb]/12 bg-[#1b1512]/82 p-4 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#f4eadb]/52">Live Seats</p>
                    <p className="mt-1 text-xs leading-5 text-[#f4eadb]/42">
                      {realtimeMode === "supabase" ? "Shared across devices" : "Local-only until Supabase is configured"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      signOut();
                      setEntryMode("role");
                      setNotice("You slipped out of the room. Your chair is open again, and the other screens will see the lounge quiet down.");
                    }}
                    className="rounded-md border border-[#f4eadb]/14 bg-[#241c18] px-3 py-2 text-xs text-[#f4eadb]/86 transition hover:bg-[#2d221d]"
                  >
                    Leave
                  </button>
                </div>

                <div className="mt-3 space-y-3 text-sm">
                  {(Object.keys(seatLabels) as SeatId[]).map((seatId) => {
                    const occupant = occupants.find((entry) => entry.seatId === seatId) ?? null;
                    const statusLabel = occupant ? occupant.name : "Open";
                    const statusTone = occupant
                      ? occupant.kind === "you"
                        ? "text-[#ffd39e]"
                        : "text-[#e5b5ae]"
                      : "text-[#a5d8bb]";

                    return (
                      <div key={seatId} className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[#f4eadb]">{seatLabels[seatId]}</p>
                          <p className="mt-1 text-xs leading-5 text-[#f4eadb]/55">
                            {occupant ? occupant.mood : "Free for a new focus session"}
                          </p>
                        </div>
                        <p className={`shrink-0 text-xs font-medium ${statusTone}`}>{statusLabel}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedSeat ? (
                <button
                  type="button"
                  onClick={() => {
                    standUp();
                    setNotice("You stood up, and that little update should now ripple out to the other open Oasis screens.");
                  }}
                  className="rounded-md border border-[#f4eadb]/18 bg-[#1c1613]/78 px-4 py-2 text-sm text-[#f4eadb] transition hover:bg-[#2a211d]"
                >
                  Stand Up
                </button>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
