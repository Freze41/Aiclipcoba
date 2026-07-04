import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clips, sourceVideos } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, desc, sql, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = request.nextUrl.searchParams.get("projectId");
  const videoId = request.nextUrl.searchParams.get("videoId");
  const status = request.nextUrl.searchParams.get("status");

  let whereClause = sql`${clips.userId} = ${user.id}`;

  if (projectId) {
    whereClause = sql`${whereClause} AND ${clips.projectId} = ${parseInt(projectId)}`;
  }
  if (videoId) {
    whereClause = sql`${whereClause} AND ${clips.sourceVideoId} = ${parseInt(videoId)}`;
  }
  if (status) {
    whereClause = sql`${whereClause} AND ${clips.status} = ${status}`;
  }

  const clipList = await db
    .select({
      id: clips.id,
      sourceVideoId: clips.sourceVideoId,
      projectId: clips.projectId,
      title: clips.title,
      description: clips.description,
      startTime: clips.startTime,
      endTime: clips.endTime,
      status: clips.status,
      aiScore: clips.aiScore,
      tags: clips.tags,
      thumbnailUrl: clips.thumbnailUrl,
      exportUrl: clips.exportUrl,
      views: clips.views,
      likes: clips.likes,
      isPublished: clips.isPublished,
      createdAt: clips.createdAt,
      updatedAt: clips.updatedAt,
      videoTitle: sourceVideos.title,
    })
    .from(clips)
    .leftJoin(sourceVideos, eq(clips.sourceVideoId, sourceVideos.id))
    .where(whereClause)
    .orderBy(desc(clips.createdAt));

  return NextResponse.json({ clips: clipList });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    title,
    description,
    sourceVideoId,
    projectId,
    startTime,
    endTime,
    tags,
  } = body;

  if (!title || !sourceVideoId || !projectId) {
    return NextResponse.json(
      { error: "Title, source video, and project are required" },
      { status: 400 }
    );
  }

  const aiScore = Math.floor(Math.random() * 30) + 70;

  const [clip] = await db
    .insert(clips)
    .values({
      title,
      description,
      sourceVideoId,
      projectId,
      userId: user.id,
      startTime: startTime || 0,
      endTime: endTime || 30,
      tags,
      aiScore,
      status: "processing",
    })
    .returning();

  // Simulate AI processing completing after creation
  setTimeout(async () => {
    try {
      await db
        .update(clips)
        .set({ status: "completed", updatedAt: new Date() })
        .where(eq(clips.id, clip.id));
    } catch {
      // ignore errors in timeout
    }
  }, 3000);

  return NextResponse.json({ clip }, { status: 201 });
}
