import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, projects, sourceVideos, clips } from "@/db/schema";
import { hashPassword, createToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    // Check if demo user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, "demo@clipperai.com"))
      .limit(1);

    if (existing.length > 0) {
      const token = createToken(existing[0].id);
      const response = NextResponse.json({
        message: "Demo data already exists",
        user: { id: existing[0].id, name: existing[0].name, email: existing[0].email },
      });
      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return response;
    }

    const passwordHash = await hashPassword("demo123");

    const [demoUser] = await db
      .insert(users)
      .values({
        name: "Alex Rivera",
        email: "demo@clipperai.com",
        passwordHash,
      })
      .returning();

    // Create projects
    const projectData = [
      { name: "Gaming Highlights", description: "Best moments from Valorant and Apex Legends streams" },
      { name: "Tech Reviews", description: "Product reviews and unboxings for YouTube Shorts" },
      { name: "Podcast Clips", description: "Engaging clips from The Creative Edge podcast" },
      { name: "Travel Vlogs", description: "Short-form travel content for TikTok and Reels" },
    ];

    const createdProjects = await db
      .insert(projects)
      .values(projectData.map((p) => ({ ...p, userId: demoUser.id })))
      .returning();

    // Create source videos
    const videoData = [
      { title: "Valorant Ranked Grind Session #47", projectId: createdProjects[0].id, durationSeconds: 7200, fileSize: "4.2 GB", platform: "Twitch" },
      { title: "Apex Legends Season 19 First Look", projectId: createdProjects[0].id, durationSeconds: 5400, fileSize: "3.1 GB", platform: "Twitch" },
      { title: "MacBook Pro M4 Review", projectId: createdProjects[1].id, durationSeconds: 1800, fileSize: "2.5 GB", platform: "YouTube" },
      { title: "iPhone 16 Unboxing & Setup", projectId: createdProjects[1].id, durationSeconds: 2400, fileSize: "1.8 GB", platform: "YouTube" },
      { title: "PS5 Pro vs PC Gaming", projectId: createdProjects[1].id, durationSeconds: 3600, fileSize: "3.2 GB", platform: "YouTube" },
      { title: "Ep 42: Building a Personal Brand", projectId: createdProjects[2].id, durationSeconds: 5400, fileSize: "800 MB", platform: "Spotify" },
      { title: "Ep 43: Creator Economy in 2025", projectId: createdProjects[2].id, durationSeconds: 4800, fileSize: "720 MB", platform: "Spotify" },
      { title: "Tokyo Street Food Adventure", projectId: createdProjects[3].id, durationSeconds: 3600, fileSize: "5.1 GB", platform: "GoPro" },
      { title: "Bali Hidden Gems Tour", projectId: createdProjects[3].id, durationSeconds: 4200, fileSize: "4.8 GB", platform: "GoPro" },
    ];

    const createdVideos = await db
      .insert(sourceVideos)
      .values(videoData.map((v) => ({ ...v, userId: demoUser.id })))
      .returning();

    // Create clips
    const clipData = [
      { title: "Insane 1v5 Clutch on Ascent", sourceVideoId: createdVideos[0].id, projectId: createdProjects[0].id, startTime: 1234, endTime: 1289, status: "completed" as const, aiScore: 97, tags: "clutch,ace,valorant", views: 45200, likes: 3200, isPublished: true, description: "AI detected peak engagement moment with 5 kills in 55 seconds" },
      { title: "Operator Triple Kill", sourceVideoId: createdVideos[0].id, projectId: createdProjects[0].id, startTime: 3456, endTime: 3498, status: "completed" as const, aiScore: 92, tags: "sniper,highlight,valorant", views: 28400, likes: 1890, isPublished: true, description: "Clean operator plays with flick shots" },
      { title: "Funny Team Comms Fail", sourceVideoId: createdVideos[0].id, projectId: createdProjects[0].id, startTime: 5600, endTime: 5645, status: "completed" as const, aiScore: 88, tags: "funny,comms,valorant", views: 67300, likes: 5100, isPublished: true, description: "Hilarious callout mistake leading to team laugh" },
      { title: "Apex Arena Wipe", sourceVideoId: createdVideos[1].id, projectId: createdProjects[0].id, startTime: 800, endTime: 856, status: "completed" as const, aiScore: 94, tags: "apex,arena,wipe", views: 15600, likes: 980, isPublished: true, description: "Full team wipe in Apex arena mode" },
      { title: "Clutch Win Season 19", sourceVideoId: createdVideos[1].id, projectId: createdProjects[0].id, startTime: 2200, endTime: 2260, status: "processing" as const, aiScore: 91, tags: "apex,clutch,win", views: 0, likes: 0, isPublished: false, description: "Final ring clutch with 2 HP remaining" },
      { title: "M4 Chip Speed Test Results", sourceVideoId: createdVideos[2].id, projectId: createdProjects[1].id, startTime: 420, endTime: 480, status: "completed" as const, aiScore: 85, tags: "macbook,m4,benchmark", views: 12300, likes: 890, isPublished: true, description: "Key benchmark results showing M4 performance" },
      { title: "MacBook Build Quality Close-up", sourceVideoId: createdVideos[2].id, projectId: createdProjects[1].id, startTime: 120, endTime: 165, status: "completed" as const, aiScore: 78, tags: "macbook,design,closeup", views: 8900, likes: 560, isPublished: false, description: "Detailed look at the new build materials" },
      { title: "iPhone Camera Comparison", sourceVideoId: createdVideos[3].id, projectId: createdProjects[1].id, startTime: 600, endTime: 660, status: "completed" as const, aiScore: 90, tags: "iphone,camera,comparison", views: 34500, likes: 2100, isPublished: true, description: "Side by side camera test in low light" },
      { title: "PS5 Pro Load Time Test", sourceVideoId: createdVideos[4].id, projectId: createdProjects[1].id, startTime: 1800, endTime: 1845, status: "pending" as const, aiScore: 82, tags: "ps5,performance,test", views: 0, likes: 0, isPublished: false, description: "Loading time comparison across games" },
      { title: "Personal Brand Golden Rule", sourceVideoId: createdVideos[5].id, projectId: createdProjects[2].id, startTime: 1200, endTime: 1260, status: "completed" as const, aiScore: 93, tags: "branding,advice,motivation", views: 22100, likes: 1650, isPublished: true, description: "The #1 rule for building an authentic brand" },
      { title: "Monetization Mistakes", sourceVideoId: createdVideos[5].id, projectId: createdProjects[2].id, startTime: 2800, endTime: 2860, status: "completed" as const, aiScore: 89, tags: "monetization,tips,creator", views: 18700, likes: 1320, isPublished: true, description: "3 monetization mistakes every creator makes" },
      { title: "Creator Economy Prediction", sourceVideoId: createdVideos[6].id, projectId: createdProjects[2].id, startTime: 900, endTime: 955, status: "completed" as const, aiScore: 86, tags: "economy,prediction,2025", views: 9400, likes: 720, isPublished: false, description: "Bold prediction about creator economy shifts" },
      { title: "Tokyo Ramen Experience", sourceVideoId: createdVideos[7].id, projectId: createdProjects[3].id, startTime: 1500, endTime: 1560, status: "completed" as const, aiScore: 95, tags: "tokyo,ramen,food", views: 89200, likes: 7800, isPublished: true, description: "Incredible ramen shop in hidden alley of Shinjuku" },
      { title: "Shibuya Crossing Time-lapse", sourceVideoId: createdVideos[7].id, projectId: createdProjects[3].id, startTime: 2400, endTime: 2430, status: "completed" as const, aiScore: 91, tags: "tokyo,shibuya,timelapse", views: 56300, likes: 4200, isPublished: true, description: "Mesmerizing time-lapse of Shibuya crossing at night" },
      { title: "Bali Sunrise at Mount Batur", sourceVideoId: createdVideos[8].id, projectId: createdProjects[3].id, startTime: 600, endTime: 645, status: "completed" as const, aiScore: 96, tags: "bali,sunrise,nature", views: 124000, likes: 11200, isPublished: true, description: "Breathtaking sunrise captured during early morning hike" },
      { title: "Ubud Rice Terrace Walk", sourceVideoId: createdVideos[8].id, projectId: createdProjects[3].id, startTime: 1800, endTime: 1850, status: "processing" as const, aiScore: 87, tags: "bali,ubud,nature", views: 0, likes: 0, isPublished: false, description: "Walking through the famous Tegallalang rice terraces" },
    ];

    await db
      .insert(clips)
      .values(clipData.map((c) => ({ ...c, userId: demoUser.id })));

    const token = createToken(demoUser.id);

    const response = NextResponse.json({
      message: "Demo data seeded successfully",
      user: { id: demoUser.id, name: demoUser.name, email: demoUser.email },
    });
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed data" },
      { status: 500 }
    );
  }
}
