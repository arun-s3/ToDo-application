export const dummyTask = {
    isGuest: true,
    guestId: "demo-guest-zen-001",

    title: "Get started with ZenTask!",
    desc: "This sample task shows how to organize, prioritize, and track your work. Try editing or completing items below.",

    done: false,

    checklist: [
        {
            text: "Review the ZenTask dashboard",
            completed: true,
        },
        {
            text: "Create your first real task",
            completed: false,
        },
        {
            text: "Set a priority and deadline",
            completed: false,
        },
        {
            text: "Now Try editing this task",
            completed: false,
        },
        {
            text: "Now delete this task if no longer needed or mark it done!",
            completed: false,
        },
    ],

    priority: "high",
    priorityRank: 3,

    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),

    starred: true,

    tags: ["getting-started", "productivity", "demo"],

    isDemo: true,

    createdAt: new Date(),
    updatedAt: new Date(),
}
