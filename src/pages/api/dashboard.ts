import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const {
            page = '1',
            limit = '10',
            search = '',
            state,
            city,
            gender,
        } = req.query;

        const pageNumber = parseInt(page as string, 10) || 1;
        const limitNumber = parseInt(limit as string, 10) || 10;
        const skip = (pageNumber - 1) * limitNumber;

        const where: any = {
            AND: [
                search
                    ? {
                        OR: [
                            { name: { contains: search as string, mode: 'insensitive' } },
                            { mobile: { contains: search as string, mode: 'insensitive' } },
                            { aadhaar: { contains: search as string, mode: 'insensitive' } },
                        ],
                    }
                    : {},
                state ? { state: state as string } : {},
                city ? { city: city as string } : {},
                gender ? { gender: gender as string } : {},
            ],
        };

        const [registrations, total] = await Promise.all([
            prisma.registration.findMany({
                where,
                skip,
                take: limitNumber,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.registration.count({ where }),
        ]);

        return res.status(200).json({
            success: true,
            data: registrations,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber),
            },
        });
    } catch (error) {
        console.error('Error in GET /api/registrations:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch registrations' });
    }
}
