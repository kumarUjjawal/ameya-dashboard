import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import { join } from "path";

export const config = {
    api: {
        bodyParser: false,
    },
};

const getFieldValue = (value: string | string[] | undefined): string =>
    Array.isArray(value) ? value[0] : value ?? "";

// Helper to parse FormData
async function parseFormData(req: Request) {
    return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
        const form = formidable({ multiples: false, uploadDir: "./public/uploads", keepExtensions: true });

        form.parse(req as any, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields, files });
        });
    });
}

export async function POST(req: Request) {
    try {
        const { fields, files } = await parseFormData(req);

        // Optional: move files if needed
        const imageUrl = files.photo ? "/uploads/" + files.photo[0].newFilename : null;
        const videoUrl = files.video ? "/uploads/" + files.video[0].newFilename : null;

        const registration = await prisma.registration.create({
            data: {
                name: getFieldValue(fields.name),
                mobile: getFieldValue(fields.mobile),
                aadhaar: getFieldValue(fields.aadhaar),
                state: getFieldValue(fields.state),
                city: getFieldValue(fields.city),
                gender: getFieldValue(fields.gender),
                dateOfBirth: fields.dateOfBirth
                    ? new Date(getFieldValue(fields.dateOfBirth))
                    : null,
                imageUrl,
                videoUrl,
            },
        });
        return NextResponse.json({ success: true, registration }, { status: 201 });
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
