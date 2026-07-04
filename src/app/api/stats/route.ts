import { NextResponse } from "next/server";
import { db } from "@/db";
import { clips, projects, sourceVideos } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [projectCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projects)
    .where(eq(projects.userId, user.id));

  const [videoCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(sourceVideos)
    .where(eq(sourceVideos.userId, user.id));

  const [clipStats] = await db
    .select({
      count: sql<number>`count(*)::int`,
      totalViews: sql<number>`coalesce(sum(${clips.views}), 0)::int`,
      totalLikes: sql<number>`coalesce(sum(${clips.likes}), 0)::int`,
      avgScore: sql<number>`coalesce(avg(${clips.aiScore}), 0)::int`,
      publishedCount: sql<number>`count(*) filter (where ${clips.isPublished} = true)::int`,
      processingCount: sql<number>`count(*) filter (where ${clips.status} = 'processing')::int`,
      completedCount: sql<number>`count(*) filter (where ${clips.status} = 'completed')::int`,
    })
    .from(clips)
    .where(eq(clips.userId, user.id));

  return NextResponse.json({
    stats: {
      projects: projectCount.count,
      videos: videoCount.count,
      clips: clipStats.count,
      totalViews: clipStats.totalViews,
      totalLikes: clipStats.totalLikes,
      avgAiScore: clipStats.avgScore,
      publishedClips: clipStats.publishedCount,
      processingClips: clipStats.processingCount,
      completedClips: clipStats.completedCount,
    },
  });
}
