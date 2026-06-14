import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { processPDF } from "@/lib/ai";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const document = await prisma.uploadedDocument.findUnique({ where: { id } });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Update status to processing
    await prisma.uploadedDocument.update({
      where: { id },
      data: { status: "PROCESSING" },
    });

    try {
      // Fetch the PDF from Supabase storage
      const response = await fetch(
        `${process.env.SUPABASE_URL}/storage/v1/object/public/nce-uploads/${document.fileUrl}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch PDF from storage");
      }

      const fileBuffer = Buffer.from(await response.arrayBuffer());

      // Determine topic ID based on document type
      // For textbooks, we need to distribute chunks across topics
      // For exam papers, link to exam paper
      let topicId = "default";

      // Find a relevant topic based on document type
      if (document.type === "TEXTBOOK") {
        const unit1 = await prisma.unit.findUnique({ where: { code: "U1" } });
        if (unit1) {
          const topic = await prisma.topic.findFirst({ where: { unitId: unit1.id } });
          if (topic) topicId = topic.id;
        }
      } else if (document.type === "EXAM_PAPER") {
        // For exam papers, we'd process differently
        // For now, use a general topic
        const topic = await prisma.topic.findFirst();
        if (topic) topicId = topic.id;
      }

      // Process PDF
      const { chunks, count } = await processPDF(
        fileBuffer,
        document.fileName,
        topicId,
        {
          source: document.type.toLowerCase() as any,
          year: document.year,
        }
      );

      // Save chunks to database
      for (const chunk of chunks) {
        await prisma.contentChunk.upsert({
          where: { id: chunk.id },
          update: {
            content: chunk.content,
            embedding: JSON.stringify(chunk.embedding),
            metadata: chunk.metadata,
            chunkIndex: chunk.chunkIndex,
            tokenCount: chunk.tokenCount,
          },
          create: {
            id: chunk.id,
            topicId: chunk.topicId,
            content: chunk.content,
            embedding: JSON.stringify(chunk.embedding),
            metadata: chunk.metadata,
            chunkIndex: chunk.chunkIndex,
            tokenCount: chunk.tokenCount,
          },
        });
      }

      // If Supabase is configured, sync embeddings
      if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

        for (const chunk of chunks) {
          await supabase.from('content_embeddings').upsert({
            id: chunk.id,
            topic_id: chunk.topicId,
            content: chunk.content,
            embedding: chunk.embedding,
            metadata: chunk.metadata,
            chunk_index: chunk.chunkIndex,
            token_count: chunk.tokenCount,
          }, { onConflict: 'id' });
        }
      }

      // Update document status
      await prisma.uploadedDocument.update({
        where: { id },
        data: {
          status: "COMPLETED",
          processedAt: new Date(),
          chunksCount: count,
        },
      });

      return NextResponse.json({
        success: true,
        data: { chunksProcessed: count },
      });
    } catch (error) {
      console.error("Processing error:", error);

      await prisma.uploadedDocument.update({
        where: { id },
        data: {
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        },
      });

      return NextResponse.json(
        { error: "Failed to process document" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Process document error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}