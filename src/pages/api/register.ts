import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import formidable from 'formidable';

export const config = {
    api: {
        bodyParser: false, // important to let formidable handle the multipart/form-data
    },
};

// helper to get a string value from field
const getFieldValue = (value: string | string[] | undefined): string =>
    Array.isArray(value) ? value[0] : value ?? '';

// helper to parse form using formidable
function parseForm(req: NextApiRequest) {
    return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
        const form = formidable({
            multiples: false,
            uploadDir: './public/uploads',
            keepExtensions: true,
        });

        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields, files });
        });
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ success: false, error: 'Method not allowed' });
        return;
    }

    try {
        const { fields, files } = await parseForm(req);

        const imageFile = files.photo as formidable.File | formidable.File[] | undefined;
        const videoFile = files.video as formidable.File | formidable.File[] | undefined;

        const imageUrl = imageFile
            ? '/uploads/' + (Array.isArray(imageFile) ? imageFile[0].newFilename : imageFile.newFilename)
            : null;

        const videoUrl = videoFile
            ? '/uploads/' + (Array.isArray(videoFile) ? videoFile[0].newFilename : videoFile.newFilename)
            : null;

        const registration = await prisma.registration.create({
            data: {
                name: getFieldValue(fields.name),
                mobile: getFieldValue(fields.mobile),
                aadhaar: getFieldValue(fields.aadhaar),
                email: getFieldValue(fields.email),
                address: getFieldValue(fields.address),
                pincode: getFieldValue(fields.pincode),
                pan: getFieldValue(fields.pan),
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

        res.status(201).json({ success: true, registration });
    } catch (error) {
        console.error('Error in /api/register:', error);
        res.status(500).json({ success: false, error: 'Failed to register' });
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
