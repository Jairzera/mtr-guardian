import { Lock, Trophy } from "lucide-react";
import { useAchievements, Milestone } from "@/hooks/useAchievements";
import { Skeleton } from "@/components/ui/skeleton";

const MilestoneCard = ({ milestone, isNext }: { milestone: Milestone; isNext: boolean }) => {
  const unlocked = milestone.unlocked;

  return (
    <div className="relative group">
      {/* Card */}
      <div
        className={`
          relative overflow-hidden rounded-2xl p-5 min-h-[180px] flex flex-col justify-between
          transition-all duration-500 border
          ${unlocked
            ? "border-white/10 shadow-2xl hover:scale-[1.03]"
            : "border-white/5 opacity-60 grayscale"
          }
        `}
        style={{
          background: unlocked
            ? "linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
            : "linear-gradient(145deg, #1f1f1f 0%, #2a2a2a 50%, #1f1f1f 100%)",
          boxShadow: unlocked
            ? `0 8px 32px ${milestone.glowColor}, inset 0 1px 0 rgba(255,255,255,0.1)`
            : "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        {/* Shine effect for unlocked */}
        {unlocked && (
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, transparent 30%, ${milestone.glowColor} 50%, transparent 70%)`,
            }}
          />
        )}

        {/* Badge icon */}
        <div className="flex items-start justify-between">
          <div
            className={`
              w-14 h-14 rounded-xl flex items-center justify-center text-2xl
              ${unlocked ? `bg-gradient-to-br ${milestone.gradient} shadow-lg` : "bg-zinc-700/50"}
            `}
            style={unlocked ? {
              boxShadow: `0 4px 20px ${milestone.glowColor}`,
            } : {}}
          >
            {unlocked ? milestone.icon : <Lock className="w-5 h-5 text-zinc-500" />}
          </div>

          {isNext && !unlocked && (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
              Próximo
            </span>
          )}

          {unlocked && milestone.id >= 4 && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-xs">★</span>
              <span className="text-yellow-400 text-xs">★</span>
              <span className="text-yellow-400 text-xs">★</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-4 space-y-1">
          <h3 className={`font-bold text-lg tracking-tight ${unlocked ? "text-white" : "text-zinc-500"}`}>
            {milestone.name}
          </h3>
          <p className={`text-xs ${unlocked ? "text-zinc-300" : "text-zinc-600"}`}>
            {milestone.label}
          </p>
        </div>

        {/* Bottom edge / "plaque" effect */}
        {unlocked && (
          <div
            className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${milestone.gradient}`}
          />
        )}
      </div>
    </div>
  );
};

const AchievementsSection = () => {
  const {
    milestones,
    totalKg,
    currentLevel,
    nextMilestone,
    progressPercent,
    remainingKg,
    formatWeight,
    isLoading,
  } = useAchievements();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[180px] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <Trophy className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Minhas Conquistas</h2>
          <p className="text-xs text-muted-foreground">Sua jornada de impacto ambiental</p>
        </div>
      </div>

      {/* Progress bar card */}
      <div
        className="rounded-2xl p-5 border border-white/10"
        style={{
          background: "linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-zinc-300">
            Nível {currentLevel + 1}: {milestones[currentLevel]?.name}
          </span>
          {nextMilestone && (
            <span className="text-xs text-zinc-400">
              Próximo: {nextMilestone.name}
            </span>
          )}
        </div>

        {/* Custom progress bar */}
        <div className="relative h-3 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 rounded-full opacity-50"
            style={{
              width: `${progressPercent}%`,
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
              animation: "shimmer 2s infinite",
            }}
          />
        </div>

        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-zinc-400">
            {nextMilestone ? (
              <>
                Total Reciclado: <span className="text-emerald-400 font-semibold">{formatWeight(totalKg)}</span>
                {" / "}Próximo Nível: <span className="text-white font-semibold">{formatWeight(nextMilestone.thresholdKg)}</span>
                {" — "}Faltam <span className="text-white font-semibold">{formatWeight(remainingKg)}</span> para a placa{" "}
                <span className="text-white font-semibold">{nextMilestone.name}</span>.
              </>
            ) : (
              <>
                🎉 Parabéns! Total Reciclado:{" "}
                <span className="text-emerald-400 font-semibold">{formatWeight(totalKg)}</span> — Nível máximo alcançado!
              </>
            )}
          </p>
        </div>
      </div>

      {/* Milestone cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {milestones.map((m) => (
          <MilestoneCard
            key={m.id}
            milestone={m}
            isNext={nextMilestone?.id === m.id}
          />
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default AchievementsSection;
