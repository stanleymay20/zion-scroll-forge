import { FileText, Compass, ScrollText, BookOpen, Award } from "lucide-react";

const steps = [
  {
    icon: FileText,
    label: "Apply",
    desc: "Submit your application and statement of calling.",
  },
  {
    icon: Compass,
    label: "Orient",
    desc: "Complete the 9-step orientation and meet your AI tutors.",
  },
  {
    icon: ScrollText,
    label: "Matriculate",
    desc: "Sign the Student Oath in the matriculation ceremony.",
  },
  {
    icon: BookOpen,
    label: "Learn",
    desc: "Progress through modules, assessments, and live lectures.",
  },
  {
    icon: Award,
    label: "Graduate",
    desc: "Walk the stage and receive a verifiable Scroll Degree.",
  },
];

export const JourneySection = () => {
  return (
    <section className="py-20 sm:py-28 px-4 bg-secondary/40 border-y border-border/50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-14 sm:mb-16">
          <p className="text-xs font-sans font-semibold tracking-[0.25em] uppercase text-accent mb-3">
            The Student Journey
          </p>
          <h2 className="text-primary mb-4 font-serif">From Calling to Commencement</h2>
          <p className="text-sm sm:text-base text-muted-foreground font-sans max-w-xl mx-auto">
            A real institutional lifecycle—not just a course list. Every transition is audited
            and credentialed.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line on desktop */}
          <div className="hidden lg:block absolute top-7 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 relative">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.label}
                  className="animate-fade-up flex flex-col items-center text-center"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="relative mb-4">
                    <div className="w-14 h-14 rounded-full bg-card border-2 border-accent/30 flex items-center justify-center elevation-2 relative z-10">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-sans font-bold text-accent tracking-wider">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  </div>
                  <h3 className="font-serif font-semibold text-sm sm:text-base text-primary mb-1.5 mt-2">
                    {step.label}
                  </h3>
                  <p className="text-xs text-muted-foreground font-sans leading-relaxed max-w-[180px]">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
