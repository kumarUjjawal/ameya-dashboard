'use client';

import { useState, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

// Define the form values type
interface RegistrationFormValues {
  fullName: string;
  dateOfBirth: Date | null;
  gender: string;
  mobileNumber: string;
  email: string;
  aadhaarNumber: string;
  panNumber: string;
  permanentAddress: string;
  state: string;
  city: string;
  pincode: string;
  photo: File | null;
  video: File | null;
}

const RegistrationForm = () => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // List of Indian states for the dropdown
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
  ];

  // Initial form values
  const initialValues: RegistrationFormValues = {
    fullName: '',
    dateOfBirth: null,
    gender: '',
    mobileNumber: '',
    email: '',
    aadhaarNumber: '',
    panNumber: '',
    permanentAddress: '',
    state: '',
    city: '',
    pincode: '',
    photo: null,
    video: null
  };

  // Yup validation schema
  const validationSchema = Yup.object({
    fullName: Yup.string()
      .required('Full name is required')
      .min(3, 'Name must be at least 3 characters')
      .max(50, 'Name must be less than 50 characters'),
    dateOfBirth: Yup.date()
      .required('Date of birth is required')
      .max(new Date(), 'Date of birth cannot be in the future'),
    gender: Yup.string()
      .required('Gender is required')
      .oneOf(['male', 'female', 'other'], 'Invalid gender selection'),
    mobileNumber: Yup.string()
      .required('Mobile number is required')
      .matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits'),
    email: Yup.string()
      .required('Email is required')
      .email('Invalid email format'),
    aadhaarNumber: Yup.string()
      .required('Aadhaar number is required')
      .matches(/^[0-9]{12}$/, 'Aadhaar number must be exactly 12 digits'),
    panNumber: Yup.string()
      .required('PAN number is required')
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
    permanentAddress: Yup.string()
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

  // Handle form submission
  const handleSubmit = async (
    values: RegistrationFormValues,
    { resetForm }: FormikHelpers<RegistrationFormValues>
  ) => {
    try {
      setLoading(true);

      // Create FormData for file uploads
      const formData = new FormData();

      // Add all form field values to FormData
      Object.keys(values).forEach(key => {
        if (key === 'dateOfBirth' && values.dateOfBirth) {
          formData.append(key, values.dateOfBirth.toISOString());
        } else if (key === 'photo' || key === 'video') {
          if (values[key as keyof RegistrationFormValues]) {
            formData.append(key, values[key as 'photo' | 'video'] as File);
          }
        } else {
          formData.append(key, String(values[key as keyof RegistrationFormValues]));
        }
      });

      // Send data to API
      const response = await axios.post('/api/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.status === 201) {
        toast.success('Registration submitted successfully!');
        resetForm();
        setPhotoPreview(null);
        setVideoPreview(null);
        if (photoInputRef.current) photoInputRef.current.value = '';
        if (videoInputRef.current) videoInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle photo file preview
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any) => void) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      setFieldValue('photo', file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle video file preview
  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any) => void) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      setFieldValue('video', file);

      // Create preview URL
      const videoUrl = URL.createObjectURL(file);
      setVideoPreview(videoUrl);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Registration Form</h1>

      <ToastContainer position="top-right" autoClose={5000} />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, errors, touched, values }) => (
          <Form className="space-y-6">
            {/* Personal Information Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Personal Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name*
                  </label>
                  <Field
                    type="text"
                    id="fullName"
                    name="fullName"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.fullName && touched.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter your full name"
                  />
                  <ErrorMessage name="fullName" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth*
                  </label>
                  <DatePicker
                    id="dateOfBirth"
                    selected={values.dateOfBirth}
                    onChange={(date) => setFieldValue('dateOfBirth', date)}
                    dateFormat="dd/MM/yyyy"
                    showYearDropdown
                    yearDropdownItemNumber={100}
                    scrollableYearDropdown
                    maxDate={new Date()}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.dateOfBirth && touched.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholderText="Select date of birth"
                  />
                  <ErrorMessage name="dateOfBirth" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender*</label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <Field
                        type="radio"
                        name="gender"
                        value="male"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">Male</span>
                    </label>
                    <label className="inline-flex items-center">
                      <Field
                        type="radio"
                        name="gender"
                        value="female"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">Female</span>
                    </label>
                    <label className="inline-flex items-center">
                      <Field
                        type="radio"
                        name="gender"
                        value="other"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">Other</span>
                    </label>
                  </div>
                  <ErrorMessage name="gender" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                {/* Mobile Number */}
                <div>
                  <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number*
                  </label>
                  <Field
                    type="text"
                    id="mobileNumber"
                    name="mobileNumber"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.mobileNumber && touched.mobileNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="10-digit mobile number"
                  />
                  <ErrorMessage name="mobileNumber" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email ID*
                  </label>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter your email address"
                  />
                  <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                {/* Aadhaar Number */}
                <div>
                  <label htmlFor="aadhaarNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Aadhaar Number*
                  </label>
                  <Field
                    type="text"
                    id="aadhaarNumber"
                    name="aadhaarNumber"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.aadhaarNumber && touched.aadhaarNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="12-digit Aadhaar number"
                  />
                  <ErrorMessage name="aadhaarNumber" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                {/* PAN Number */}
                <div>
                  <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    PAN Number*
                  </label>
                  <Field
                    type="text"
                    id="panNumber"
                    name="panNumber"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase ${errors.panNumber && touched.panNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="ABCDE1234F"
                  />
                  <ErrorMessage name="panNumber" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Address Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Permanent Address */}
                <div className="md:col-span-2">
                  <label htmlFor="permanentAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Permanent Address*
                  </label>
                  <Field
                    as="textarea"
                    id="permanentAddress"
                    name="permanentAddress"
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.permanentAddress && touched.permanentAddress ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter your permanent address"
                  />
                  <ErrorMessage name="permanentAddress" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                {/* State */}
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State*
                  </label>
                  <Field
                    as="select"
                    id="state"
                    name="state"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.state && touched.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                  >
                    <option value="">Select State</option>
                    {indianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="state" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City*
                  </label>
                  <Field
                    type="text"
                    id="city"
                    name="city"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.city && touched.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter your city"
                  />
                  <ErrorMessage name="city" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                {/* Pincode */}
                <div>
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode*
                  </label>
                  <Field
                    type="text"
                    id="pincode"
                    name="pincode"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.pincode && touched.pincode ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="6-digit pincode"
                  />
                  <ErrorMessage name="pincode" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Document Upload</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Photo Upload */}
                <div>
                  <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Photo* (JPG/PNG, max 5MB)
                  </label>
                  <input
                    ref={photoInputRef}
                    type="file"
                    id="photo"
                    name="photo"
                    accept="image/jpeg, image/png"
                    onChange={(e) => handlePhotoChange(e, setFieldValue)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage name="photo" component="div" className="mt-1 text-sm text-red-600" />

                  {/* Photo Preview */}
                  {photoPreview && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Preview:</p>
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="h-40 w-40 object-cover rounded border border-gray-300"
                      />
                    </div>
                  )}
                </div>

                {/* Video Upload */}
                <div>
                  <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Verification Video* (MP4/MOV, max 10MB)
                  </label>
                  <input
                    ref={videoInputRef}
                    type="file"
                    id="video"
                    name="video"
                    accept="video/mp4, video/quicktime"
                    onChange={(e) => handleVideoChange(e, setFieldValue)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage name="video" component="div" className="mt-1 text-sm text-red-600" />

                  {/* Video Preview */}
                  {videoPreview && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Preview:</p>
                      <video
                        src={videoPreview}
                        controls
                        className="h-40 w-full object-cover rounded border border-gray-300"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </div>
                ) : (
                  'Submit Registration'
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default RegistrationForm;
