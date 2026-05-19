"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useOasisPresence } from "@/hooks/useOasisPresence";
import { seatDescriptions, seatLabels, type PresenceRecord, type SeatId } from "@/lib/oasis";

type CanvasOccupant = Omit<PresenceRecord, "seatId"> & {
  seatId: SeatId;
  kind: "you" | "guest";
};

type EntryMode = "role" | "jobseeker" | "recruiter";

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
    <div className="flex h-screen w-screen items-center justify-center bg-[#120f0d] text-sm tracking-[0.18em] text-[#f4eadb]/75 uppercase">
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
    description: "빠른 실행, 명확한 산출물, 몇 주 안에 끝나는 흐름",
  },
  {
    id: "long",
    title: "장기 프로젝트",
    description: "팀처럼 호흡을 맞추며 몇 달 이상 함께 가는 흐름",
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
  onSelect: (mode: Exclude<EntryMode, "role">) => void;
}) {
  const cards = [
    {
      id: "jobseeker" as const,
      eyebrow: "Job Seeker",
      title: "취준생으로 입장",
      description: "짧은 설문으로 당신의 분야와 도구, 원하는 프로젝트 결을 정리한 뒤 도서관으로 들어갑니다.",
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "recruiter" as const,
      eyebrow: "Hiring Manager",
      title: "인사담당자로 입장",
      description: "채용 목적과 카테고리 중심의 탐색 화면으로 들어가 적합한 인재를 찾는 흐름을 먼저 봅니다.",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  return (
    <div className="absolute inset-0 z-20 bg-[#120f0d]/70 px-6 py-10 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl flex-col justify-between">
        <div className="pointer-events-none flex items-start justify-between gap-6 text-[#f4eadb]">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.32em] text-[#f4eadb]/58">Focus Oasis Entry</p>
            <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">어떤 마음으로 들어오시나요?</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#f4eadb]/70 sm:text-base">
              늦은 밤 라운지 문 앞에서, 먼저 당신이 찾고 있는 역할을 고릅니다. 그 선택에 맞춰 화면의 톤과 질문이 달라집니다.
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
                style={{ backgroundImage: `linear-gradient(to top, rgba(18,15,13,0.86), rgba(18,15,13,0.26)), url(${card.image})` }}
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
  const filtered = options.filter((option) =>
    option.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div>
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={multi ? "검색해서 여러 개를 고르세요" : "검색해서 한 개를 고르세요"}
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
          ? `${selected.join(", ")}`
          : multi
            ? "여러 개를 골라도 괜찮아요. 지금 할 수 있는 것들을 가볍게 찍어도 충분합니다."
            : "지금 가장 가고 싶은 방향 하나를 먼저 골라볼게요."}
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
      caption: "늦은 밤 라운지에서 당신 이름이 작은 조명처럼 보이게 됩니다.",
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
            지금 입력한 이름은 도서관 안에서 좌석 위에 떠오를 이름이기도 하고, 다른 화면에서 당신을 알아보는 작은 표식이기도 해요.
          </p>
        </div>
      ),
    },
    {
      title: "희망 분야는 어디에 가까울까요?",
      caption: "검색해서 찾고, 한 가지 중심축을 골라봅니다.",
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
      caption: "PM이든, 디자이너든, 엔지니어든. 지금 당신이 맡고 싶은 결을 보여주세요.",
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
      caption: "조심스럽게라도 괜찮아요. 프로젝트의 온도와 폭을 가늠하는 기준이 됩니다.",
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
    <div className="absolute inset-0 z-20 bg-[#120f0d]/72 px-6 py-10 backdrop-blur-md">
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
                {isLast ? "도서관으로 들어가기" : "다음 질문"}
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
            어떤 목적을 위해 채용하고자 하는지 간단히 설명해 주세요. 당신의 추천 항목과 AI를 통해 귀하에게 적합한 프리랜서를
            매치시켜 드리겠습니다. <span className="underline underline-offset-4">Adobe 생성형 AI 약관</span>
          </p>

          <div className="mt-10 rounded-full border border-[#4a6cf7] bg-white p-2 shadow-[0_20px_70px_rgba(68,97,242,0.12)]">
            <div className="flex items-center gap-3 rounded-full bg-white px-2 sm:px-4">
              <span className="rounded-xl bg-[#eef3ff] px-5 py-4 text-sm font-medium text-[#3e62f5]">
                찾는 항목
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="내 반려동물 사료 회사에 대한 일러스트레이터, 예산 $800"
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
                  style={{ backgroundImage: `linear-gradient(to top, rgba(12,15,24,0.72), rgba(12,15,24,0.3)), url(${category.image})` }}
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

export default function OasisStage() {
  const {
    ready,
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
    "Open the Oasis in another browser window, sign in there too, and you'll watch seats update across both screens.",
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

  const handleSurveyComplete = () => {
    const success = join(draftName);
    if (!success) {
      setNotice("이름이 들어가야 라운지에서 서로를 알아볼 수 있어요.");
      return;
    }

    setNotice(
      `${draftName}님, ${survey.field || "새로운 분야"}를 향한 자리 하나가 준비됐어요. 이제 도서관 안에서 프로젝트와 사람을 만날 시간입니다.`,
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
        ) : entryMode === "jobseeker" ? (
          <CandidateSurveyScreen
            draftName={draftName}
            setDraftName={setDraftName}
            survey={survey}
            setSurvey={setSurvey}
            onBackToRole={() => setEntryMode("role")}
            onComplete={handleSurveyComplete}
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
                    <p className="mt-1 text-xs leading-5 text-[#f4eadb]/42">{`${activeName} is in the room.`}</p>
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
