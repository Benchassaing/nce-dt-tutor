import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { uploadDocumentSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [documents, total] = await Promise.all([
      prisma.uploadedDocument.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.uploadedDocument.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: documents,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = uploadDocumentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.format() },
        { status: 400 }
      );
    }

    const document = await prisma.uploadedDocument.create({
      data: {
        ...validation.data,
        uploadedBy: user.id,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    console.error("Create document error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}