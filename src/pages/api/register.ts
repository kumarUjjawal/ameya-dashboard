import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import formidable from 'formidable';
import { cloudinary } from "@/lib/cloudinary";
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
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
async function uploadToCloudinary(filePath: string, folder: string, resourceType: 'image' | 'video' = 'image') {
    return new Promise<{ secure_url: string }>((resolve, reject) => {
        cloudinary.uploader.upload(
            filePath,
            { folder, resource_type: resourceType },
            (error, result) => {
                if (error) reject(error);
                else resolve(result as any);
            }
        );
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { fields, files } = await parseForm(req);

            const imageFile = files.photo as formidable.File | formidable.File[] | undefined;
            const videoFile = files.video as formidable.File | formidable.File[] | undefined;

            let imageUrl: string | null = null;
            let videoUrl: string | null = null;

            const imageFilePath = Array.isArray(imageFile) ? imageFile[0].filepath : imageFile?.filepath;
            const videoFilePath = Array.isArray(videoFile) ? videoFile[0].filepath : videoFile?.filepath;

            if (imageFile) {
                if (!imageFilePath) throw new Error('Image file path missing');
                const uploadResult = await uploadToCloudinary(imageFilePath, 'registration/images', 'image');
                imageUrl = uploadResult.secure_url;
                fs.unlinkSync(imageFilePath);
            }

            if (videoFile) {
                if (!videoFilePath) throw new Error('Video file path missing');
                const uploadResult = await uploadToCloudinary(videoFilePath, 'registration/videos', 'video');
                videoUrl = uploadResult.secure_url;
                fs.unlinkSync(videoFilePath);
            }

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
                    dateOfBirth: fields.dateOfBirth ? new Date(getFieldValue(fields.dateOfBirth)) : null,
                    imageUrl,
                    videoUrl,
                },
            });

            return res.status(201).json({ success: true, registration });
        } catch (error) {
            console.error('Error in /api/register POST:', error);
            return res.status(500).json({ success: false, error: 'Failed to register' });
        }
    } else if (req.method === 'PUT') {
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ success: false, error: 'Missing or invalid ID' });
        }

        try {
            const { fields, files } = await parseForm(req);

            const imageFile = files.photo as formidable.File | formidable.File[] | undefined;
            const videoFile = files.video as formidable.File | formidable.File[] | undefined;

            let imageUrl: string | null = null;
            let videoUrl: string | null = null;

            const imageFilePath = Array.isArray(imageFile) ? imageFile[0].filepath : imageFile?.filepath;
            const videoFilePath = Array.isArray(videoFile) ? videoFile[0].filepath : videoFile?.filepath;

            if (imageFile) {
                if (!imageFilePath) throw new Error('Image file path missing');
                const uploadResult = await uploadToCloudinary(imageFilePath, 'registration/images', 'image');
                imageUrl = uploadResult.secure_url;
                fs.unlinkSync(imageFilePath);
            }

            if (videoFile) {
                if (!videoFilePath) throw new Error('Video file path missing');
                const uploadResult = await uploadToCloudinary(videoFilePath, 'registration/videos', 'video');
                videoUrl = uploadResult.secure_url;
                fs.unlinkSync(videoFilePath);
            }

            const updatedRegistration = await prisma.registration.update({
                where: { id: parseInt(id) },
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
                    dateOfBirth: fields.dateOfBirth ? new Date(getFieldValue(fields.dateOfBirth)) : null,
                    ...(imageUrl && { imageUrl }),
                    ...(videoUrl && { videoUrl }),
                },
            });

            return res.status(200).json({ success: true, registration: updatedRegistration });
        } catch (error) {
            console.error('Error in /api/register PUT:', error);
            return res.status(500).json({ success: false, error: 'Failed to update registration' });
        }
    } else {
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}
