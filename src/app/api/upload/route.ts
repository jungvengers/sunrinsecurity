import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadFile } from "@/lib/minio";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const url = await uploadFile(buffer, file.name, file.type);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "업로드 실패" }, { status: 500 });
  }
}
