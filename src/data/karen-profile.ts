import type { UserProfile } from "@/lib/utils/profile";

export const karenProfile: UserProfile = {
  name: "Karen Singer",
  currentRole: "Staff Product Manager",
  currentCompany: "Character.AI",
  yearsExperience: 10,
  companyTypes: ["Big Tech", "AI Startup", "Media/Entertainment"],
  productsShipped: [
    {
      name: "Creator Team & Tools (Character.AI)",
      description:
        "Founded 0-to-1 creator team. Shipped quick creation, detailed creation, video creation, scene creation, creator analytics, and profile hub. Authored 3-year creator strategy and convinced CEO to make creators the top priority.",
      impact:
        "+10% content production from top 1% of creators. Made Creator team the highest funded initiative at the company.",
    },
    {
      name: "Monetization Turnaround (Character.AI)",
      description:
        "Rearchitected struggling monetization org. Ran user research, found memory was the core value driver. Reframed strategy, created decision-making framework adopted across all product teams. Introduced ad revenue stream.",
      impact:
        "Doubled subscription ARR in 3 months ($800K to $1.5M MRR).",
    },
    {
      name: "Model Picker (Character.AI)",
      description:
        "Shipped model picker enabling users to switch between post-trained models optimized for specific use cases. Designed feedback loops connecting user signals to model iteration. Partnered with AI researchers on post-training strategy.",
      impact:
        "30% engagement lift (sessions + session length). 20% reduction in negative user feedback on memory/recall. $1.3M/month reduction in GPU inference costs.",
    },
    {
      name: "YouTube Avatars (Google)",
      description:
        "Founded 0-to-1. Pitched 5-year strategic initiative to YouTube CEO. Led >$100M acquisition. Translated hand tracking and face tracking research into product requirements. Grew team from 2 to 31.",
      impact:
        "System adopted by Google's central avatar team. Built foundation for YouTube's creator tools strategy.",
    },
    {
      name: "YouTube CTV Ads (Google)",
      description:
        "Led delivery of all ad types to Connected TV. Shipped 9 new ad formats. Created YouTube CTV ads playbook presented to VPs across YouTube. Pitched new media ad format for TV.",
      impact:
        "+$500M ARR from 9 new ad formats. +60% revenue per hour YoY.",
    },
    {
      name: "YouTube VR/XR (Google)",
      description:
        "Sole PM for all VR/AR initiatives at YouTube. YouTube VR app, 360/180 video, cloud-based 3D AR, gaming experiences. Built prototypes to validate directions before committing engineering resources.",
      impact:
        "+279% YoY user growth on YouTube VR. +10 points user satisfaction.",
    },
    {
      name: "Emmy-Nominated AR Experience (Viacom)",
      description:
        "Directed Emmy-nominated interactive AR experience for MTV/Nickelodeon/Comedy Central. Owned both technical architecture and creative direction. Users could jump into stories and talk to characters.",
      impact:
        "Daytime Emmy Award Nominee for Best Interactive Media. Cannes Lions Grand Prix Winner for Digital Craft. +2M engagements in under 48 hours.",
    },
  ],
  keyMetrics: [
    "$500M ARR from YouTube CTV ad formats",
    "+279% YoY user growth on YouTube VR",
    "$100M+ YouTube Avatars acquisition",
    "Team growth 2 to 31 (YouTube Avatars)",
    "$800K to $1.5M MRR in 3 months (Character.AI)",
    "30% engagement lift from model picker",
    "$1.3M/month GPU cost savings",
    "+60% revenue per hour YoY (YouTube CTV)",
    "+2M engagements in <48 hours (Viacom AR)",
  ],
  frameworks: [
    "0-to-1 Product Development",
    "Build/Partner/Buy Strategy",
    "Creator Co-Creation",
    "Rapid Prototyping & Kill What Doesn't Work",
    "Research-to-Product Translation",
  ],
  skillsAssessment: {
    productStrategy: 5,
    userResearch: 4,
    dataAnalysis: 4,
    technicalDepth: 5,
    stakeholderManagement: 5,
    executionDelivery: 5,
    leadership: 5,
    communication: 5,
  },
  goalRole: "Senior PM / Staff PM",
  industryPreferences: ["AI", "Gaming", "Creator Tools", "Entertainment"],
  companyStagePreferences: ["Growth", "Big Tech"],
  workStylePreferences:
    "Decisive, vision-driven, shields team from chaos. Disagree private, support public. No surprises for stakeholders. Eyes wide open.",
  learningStyle: "visual",
};
