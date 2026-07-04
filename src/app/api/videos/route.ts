import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sourceVideos } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = request.nextUrl.searchParams.get("projectId");

  const conditions = [eq(sourceVideos.userId, user.id)];
  if (projectId) {
    conditions.push(eq(sourceVideos.projectId, parseInt(projectId)));
  }

  const videos = await db
    .select({
      id: sourceVideos.id,
      projectId: sourceVideos.projectId,
      title: sourceVideos.title,
      originalUrl: sourceVideos.originalUrl,
      durationSeconds: sourceVideos.durationSeconds,
      fileSize: sourceVideos.fileSize,
      platform: sourceVideos.platform,
      createdAt: sourceVideos.createdAt,
      clipCount: sql<number>`(SELECT COUNT(*) FROM clips WHERE clips.source_video_id = ${sourceVideos.id})::int`,
    })
    .from(sourceVideos)
    .where(
      projectId
        ? sql`${sourceVideos.userId} = ${user.id} AND ${sourceVideos.projectId} = ${parseInt(projectId)}`
        : eq(sourceVideos.userId, user.id)
    )
    .orderBy(desc(sourceVideos.createdAt));

  return NextResponse.json({ videos });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, projectId, originalUrl, durationSeconds, fileSize, platform } =
    await request.json();

  if (!title || !projectId) {
    return NextResponse.json(
      { error: "Title and project are required" },
      { status: 400 }
    );
  }

  const [video] = await db
    .insert(sourceVideos)
    .values({
      title,
      projectId,
      userId: user.id,
      originalUrl,
      durationSeconds,
      fileSize,
      platform,
    })
    .returning();

  return NextResponse.json({ video }, { status: 201 });
}
