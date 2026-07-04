import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, clips, sourceVideos } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, desc, sql } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectList = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      thumbnailUrl: projects.thumbnailUrl,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      clipCount: sql<number>`(SELECT COUNT(*) FROM clips WHERE clips.project_id = ${projects.id})::int`,
      videoCount: sql<number>`(SELECT COUNT(*) FROM source_videos WHERE source_videos.project_id = ${projects.id})::int`,
    })
    .from(projects)
    .where(eq(projects.userId, user.id))
    .orderBy(desc(projects.updatedAt));

  return NextResponse.json({ projects: projectList });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description } = await request.json();

  if (!name) {
    return NextResponse.json(
      { error: "Project name is required" },
      { status: 400 }
    );
  }

  const [project] = await db
    .insert(projects)
    .values({ name, description, userId: user.id })
    .returning();

  return NextResponse.json({ project }, { status: 201 });
}
