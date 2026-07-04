import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sourceVideos } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await db
    .delete(sourceVideos)
    .where(
      and(
        eq(sourceVideos.id, parseInt(id)),
        eq(sourceVideos.userId, user.id)
      )
    );

  return NextResponse.json({ success: true });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { title, platform } = await request.json();

  const [video] = await db
    .update(sourceVideos)
    .set({ title, platform })
    .where(
      and(
        eq(sourceVideos.id, parseInt(id)),
        eq(sourceVideos.userId, user.id)
      )
    )
    .returning();

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  return NextResponse.json({ video });
}
