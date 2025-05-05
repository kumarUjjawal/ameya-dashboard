import * as Yup from 'yup';

export const validationSchema = Yup.object({
    name: Yup.string()
        .required('Full name is required')
        .min(3, 'Name must be at least 3 characters')
        .max(50, 'Name must be less than 50 characters'),
    dateOfBirth: Yup.date()
        .required('Date of birth is required')
        .max(new Date(), 'Date of birth cannot be in the future'),
    gender: Yup.string()
        .required('Gender is required')
        .oneOf(['Male', 'Female', 'Other'], 'Invalid gender selection'),
    mobile: Yup.string()
        .required('Mobile number is required')
        .matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits'),
    email: Yup.string()
        .required('Email is required')
        .email('Invalid email format'),
    aadhaar: Yup.string()
        .required('Aadhaar number is required')
        .matches(/^[0-9]{12}$/, 'Aadhaar number must be exactly 12 digits'),
    pan: Yup.string()
        .required('PAN number is required')
        .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
    address: Yup.string()
        .required('Permanent address is required')
        .min(10, 'Address is too short')
        .max(200, 'Address is too long'),
    state: Yup.string()
        .required('State is required'),
    city: Yup.string()
        .required('City is required')
        .min(2, 'City name is too short'),
    pincode: Yup.string()
        .required('Pincode is required')
        .matches(/^[0-9]{6}$/, 'Pincode must be exactly 6 digits'),
    photo: Yup.mixed()
        .required('Photo is required')
        .test('fileType', 'Only JPG/PNG files are allowed',
            (value) => value && ['image/jpeg', 'image/png'].includes((value as File).type))
        .test('fileSize', 'File must be less than 5MB',
            (value) => value && (value as File).size <= 5 * 1024 * 1024),
    video: Yup.mixed()
        .required('Verification video is required')
        .test('fileType', 'Only MP4/MOV files are allowed',
            (value) => value && ['video/mp4', 'video/quicktime'].includes((value as File).type))
        .test('fileSize', 'File must be less than 10MB',
            (value) => value && (value as File).size <= 10 * 1024 * 1024)
});
