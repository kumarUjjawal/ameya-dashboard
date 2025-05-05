export interface RegistrationFormValues {
    name: string;
    dateOfBirth: Date | null;
    gender: string;
    mobile: string;
    email: string;
    aadhaar: string;
    pan: string;
    address: string;
    state: string;
    city: string;
    pincode: string;
    photo: File | null;
    video: File | null;
}
