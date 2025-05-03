import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const data = await req.json();

    try {
        const registration = await prisma.registration.create({
            data: {
                name: data.name,
                mobile: data.mobile,
                aadhaar: data.aadhaar,
                state: data.state,
                city: data.city,
                gender: data.gender,
                imageUrl: data.imageUrl,
                videoUrl: data.videoUrl,
            },
        });

        return NextResponse.json({ success: true, registration });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: "Failed to register" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") ?? "";
    const state = searchParams.get("state");
    const city = searchParams.get("city");
    const gender = searchParams.get("gender");
    const page = parseInt(searchParams.get("page") ?? "1");
    const pageSize = 10;

    const where: any = {
        OR: [
            { name: { contains: search, mode: "insensitive" } },
            { mobile: { contains: search } },
            { aadhaar: { contains: search } },
        ],
    };

    if (state) where.state = state;
    if (city) where.city = city;
    if (gender) where.gender = gender;

    const registrations = await prisma.registration.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
    });

    const totalCount = await prisma.registration.count({ where });

    return NextResponse.json({ registrations, totalCount });
}
