import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clips } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const [clip] = await db
    .select()
    .from(clips)
    .where(and(eq(clips.id, parseInt(id)), eq(clips.userId, user.id)))
    .limit(1);

  if (!clip) {
    return NextResponse.json({ error: "Clip not found" }, { status: 404 });
  }

  return NextResponse.json({ clip });
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
  const body = await request.json();

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.startTime !== undefined) updateData.startTime = body.startTime;
  if (body.endTime !== undefined) updateData.endTime = body.endTime;
  if (body.tags !== undefined) updateData.tags = body.tags;
  if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;
  if (body.status !== undefined) updateData.status = body.status;

  const [clip] = await db
    .update(clips)
    .set(updateData)
    .where(and(eq(clips.id, parseInt(id)), eq(clips.userId, user.id)))
    .returning();

  if (!clip) {
    return NextResponse.json({ error: "Clip not found" }, { status: 404 });
  }

  return NextResponse.json({ clip });
}

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
    .delete(clips)
    .where(and(eq(clips.id, parseInt(id)), eq(clips.userId, user.id)));

  return NextResponse.json({ success: true });
}
