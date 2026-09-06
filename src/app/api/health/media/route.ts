import { NextResponse } from "next/server";
import { mediaService } from "@/modules/media";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const health = await mediaService.getHealth();
    return NextResponse.json(health);
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Media service health check failed",
      },
      { status: 500 }
    );
  }
}
