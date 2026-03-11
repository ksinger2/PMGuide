import Link from "next/link";
import { User, FileText, Mail, MessageSquare, DollarSign } from "lucide-react";

const sections = [
  {
    href: "/about-me",
    icon: User,
    title: "About Me",
    description: "Build your PM profile through a guided conversation",
    status: "Start here",
    available: true,
  },
  {
    href: "/resume",
    icon: FileText,
    title: "Resume",
    description: "Get AI-powered critique and tailored resume generation",
    status: "Requires profile",
    available: true,
  },
  {
    href: "/outreach",
    icon: Mail,
    title: "Outreach",
    description: "Craft compelling cold emails and LinkedIn messages",
    status: "Coming Soon",
    available: false,
  },
  {
    href: "/interview",
    icon: MessageSquare,
    title: "Interview Prep",
    description: "Practice PM interviews with AI-powered mock sessions",
    status: "Coming Soon",
    available: false,
  },
  {
    href: "/negotiate",
    icon: DollarSign,
    title: "Negotiate",
    description: "Prepare your compensation negotiation strategy",
    status: "Coming Soon",
    available: false,
  },
];

export default function DashboardPage() {
  return (
    <div data-testid="dashboard-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Welcome to PMGuide
        </h1>
        <p className="mt-2 text-lg text-slate-500">
          Your AI-powered PM career companion. Start by telling us about
          yourself.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const content = (
            <div
              className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 ${
                section.available
                  ? "hover:shadow-md cursor-pointer"
                  : "opacity-60"
              }`}
              data-testid={`dashboard-card-${section.title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    section.available
                      ? "bg-primary-50 text-primary-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-800">
                      {section.title}
                    </h2>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        section.status === "Start here"
                          ? "bg-primary-50 text-primary-700"
                          : section.status === "Requires profile"
                            ? "bg-slate-100 text-slate-600"
                            : "border border-slate-200 text-slate-500"
                      }`}
                    >
                      {section.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {section.description}
                  </p>
                </div>
              </div>
            </div>
          );

          if (section.available) {
            return (
              <Link key={section.href} href={section.href}>
                {content}
              </Link>
            );
          }

          return <div key={section.href}>{content}</div>;
        })}
      </div>
    </div>
  );
}
