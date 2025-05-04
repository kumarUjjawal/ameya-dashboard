'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

// Define the form values type
interface RegistrationFormValues {
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

const RegistrationForm = () => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const id = searchParams && searchParams.get('id');
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
    name: '',
    dateOfBirth: null,
    gender: '',
    mobile: '',
    email: '',
    aadhaar: '',
    pan: '',
    address: '',
    state: '',
    city: '',
    pincode: '',
    photo: null,
    video: null
  };
  const [initialFormValues, setInitialFormValues] = useState<RegistrationFormValues>(initialValues);

  useEffect(() => {
    if (id) {
      fetch(`/api/dashboard?id=${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.registration) {
            const reg = data.registration;
            setInitialFormValues({
              name: reg.name || '',
              dateOfBirth: reg.dateOfBirth ? new Date(reg.dateOfBirth) : null,
              gender: reg.gender || '',
              mobile: reg.mobile || '',
              email: reg.email || '',
              aadhaar: reg.aadhaar || '',
              pan: reg.pan || '',
              address: reg.address || '',
              state: reg.state || '',
              city: reg.city || '',
              pincode: reg.pincode || '',
              photo: null, // can't prepopulate a File object from URL
              video: null
            });

            setPhotoPreview(reg.imageUrl || null);
            setVideoPreview(reg.videoUrl || null);
          }
        })
        .catch(err => {
          console.error('Failed to fetch registration', err);
        });
    }
  }, [id]);

  // Yup validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Full name is required')
      .min(3, 'Name must be at least 3 characters')
      .max(50, 'Name must be less than 50 characters'),
    dateOfBirth: Yup.date()
      .required('Date of birth is required')
      .max(new Date(), 'Date of birth cannot be in the future'),
    gender: Yup.string()
      .required('Gender is required')
      .oneOf(['male', 'female', 'other'], 'Invalid gender selection'),
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

  // Handle form submission
  const handleSubmit = async (
    values: RegistrationFormValues,
    { resetForm }: FormikHelpers<RegistrationFormValues>
  ) => {
    try {
      console.log(values)
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

      const id = searchParams?.get('id'); // <-- get id here

      const url = id ? `/api/register?id=${id}` : '/api/register';
      const method = id ? 'put' : 'post';

      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success(`Registration ${id ? 'updated' : 'submitted'} successfully!`);
        resetForm();
        setPhotoPreview(null);
        setVideoPreview(null);
        if (photoInputRef.current) photoInputRef.current.value = '';
        if (videoInputRef.current) videoInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(`Registration ${id ? 'update' : 'submission'} failed. Please try again.`);
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
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
        <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          Create Your Account
        </h1>

        <ToastContainer position="top-right" autoClose={5000} theme="colored" />

        <Formik
          initialValues={initialFormValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, errors, touched, values }) => (
            <Form className="space-y-8">
              {/* Personal Information Section */}
              <div className="bg-gradient-to-r from-gray-50 to-indigo-50 p-8 rounded-xl shadow-inner">
                <h2 className="text-2xl font-semibold mb-6 text-indigo-900">Personal Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-indigo-900 mb-2">
                      Full Name*
                    </label>
                    <Field
                      type="text"
                      id="name"
                      name="name"
                      className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${errors.name && touched.name ? 'border-red-400' : 'border-indigo-200 hover:border-indigo-400'}`}
                      placeholder="Enter your full name"
                    />
                    <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-500" />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-indigo-900 mb-2">
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
                      className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${errors.dateOfBirth && touched.dateOfBirth ? 'border-red-400' : 'border-indigo-200 hover:border-indigo-400'}`}
                      placeholderText="Select date of birth"
                    />
                    <ErrorMessage name="dateOfBirth" component="div" className="mt-1 text-sm text-red-500" />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-indigo-900 mb-2">Gender*</label>
                    <div className="flex space-x-6">
                      {['male', 'female', 'other'].map((gender) => (
                        <label key={gender} className="inline-flex items-center cursor-pointer">
                          <Field
                            type="radio"
                            name="gender"
                            value={gender}
                            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-indigo-200"
                          />
                          <span className="ml-2 text-indigo-900 capitalize">{gender}</span>
                        </label>
                      ))}
                    </div>
                    <ErrorMessage name="gender" component="div" className="mt-1 text-sm text-red-500" />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label htmlFor="mobile" className="block text-sm font-medium text-indigo-900 mb-2">
                      Mobile Number*
                    </label>
                    <Field
                      type="text"
                      id="mobile"
                      name="mobile"
                      className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${errors.mobile && touched.mobile ? 'border-red-400' : 'border-indigo-200 hover:border-indigo-400'}`}
                      placeholder="10-digit mobile number"
                    />
                    <ErrorMessage name="mobile" component="div" className="mt-1 text-sm text-red-500" />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-indigo-900 mb-2">
                      Email ID*
                    </label>
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${errors.email && touched.email ? 'border-red-400' : 'border-indigo-200 hover:border-indigo-400'}`}
                      placeholder="Enter your email address"
                    />
                    <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-500" />
                  </div>

                  {/* Aadhaar Number */}
                  <div>
                    <label htmlFor="aadhaar" className="block text-sm font-medium text-indigo-900 mb-2">
                      Aadhaar Number*
                    </label>
                    <Field
                      type="text"
                      id="aadhaar"
                      name="aadhaar"
                      className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${errors.aadhaar && touched.aadhaar ? 'border-red-400' : 'border-indigo-200 hover:border-indigo-400'}`}
                      placeholder="12-digit Aadhaar number"
                    />
                    <ErrorMessage name="aadhaar" component="div" className="mt-1 text-sm text-red-500" />
                  </div>

                  {/* PAN Number */}
                  <div>
                    <label htmlFor="pan" className="block text-sm font-medium text-indigo-900 mb-2">
                      PAN Number*
                    </label>
                    <Field
                      type="text"
                      id="pan"
                      name="pan"
                      className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase transition-all duration-200 ${errors.pan && touched.pan ? 'border-red-400' : 'border-indigo-200 hover:border-indigo-400'}`}
                      placeholder="ABCDE1234F"
                    />
                    <ErrorMessage name="pan" component="div" className="mt-1 text-sm text-red-500" />
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div className="bg-gradient-to-r from-gray-50 to-purple-50 p-8 rounded-xl shadow-inner">
                <h2 className="text-2xl font-semibold mb-6 text-purple-900">Address Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Permanent Address */}
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-purple-900 mb-2">
                      Permanent Address*
                    </label>
                    <Field
                      as="textarea"
                      id="address"
                      name="address"
                      rows={4}
                      className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${errors.address && touched.address ? 'border-red-400' : 'border-purple-200 hover:border-purple-400'}`}
                      placeholder="Enter your permanent address"
                    />
                    <ErrorMessage name="address" component="div" className="mt-1 text-sm text-red-500" />
                  </div>

                  {/* State */}
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-purple-900 mb-2">
                      State*
                    </label>
                    <Field
                      as="select"
                      id="state"
                      name="state"
                      className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${errors.state && touched.state ? 'border-red-400' : 'border-purple-200 hover:border-purple-400'}`}
                    >
                      <option value="">Select State</option>
                      {indianStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="state" component="div" className="mt-1 text-sm text-red-500" />
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-purple-900 mb-2">
                      City*
                    </label>
                    <Field
                      type="text"
                      id="city"
                      name="city"
                      className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${errors.city && touched.city ? 'border-red-400' : 'border-purple-200 hover:border-purple-400'}`}
                      placeholder="Enter your city"
                    />
                    <ErrorMessage name="city" component="div" className="mt-1 text-sm text-red-500" />
                  </div>

                  {/* Pincode */}
                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-purple-900 mb-2">
                      Pincode*
                    </label>
                    <Field
                      type="text"
                      id="pincode"
                      name="pincode"
                      className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${errors.pincode && touched.pincode ? 'border-red-400' : 'border-purple-200 hover:border-purple-400'}`}
                      placeholder="6-digit pincode"
                    />
                    <ErrorMessage name="pincode" component="div" className="mt-1 text-sm text-red-500" />
                  </div>
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="bg-gradient-to-r from-gray-50 to-pink-50 p-8 rounded-xl shadow-inner">
                <h2 className="text-2xl font-semibold mb-6 text-pink-900">Document Upload</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Photo Upload */}
                  <div>
                    <label htmlFor="photo" className="block text-sm font-medium text-pink-900 mb-2">
                      Upload Photo* (JPG/PNG, max 5MB)
                    </label>
                    <input
                      ref={photoInputRef}
                      type="file"
                      id="photo"
                      name="photo"
                      accept="image/jpeg, image/png"
                      onChange={(e) => handlePhotoChange(e, setFieldValue)}
                      className="w-full px-4 py-3 bg-white border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 hover:border-pink-400 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-pink-100 file:text-pink-900 file:cursor-pointer"
                    />
                    <ErrorMessage name="photo" component="div" className="mt-1 text-sm text-red-500" />

                    {/* Photo Preview */}
                    {photoPreview && (
                      <div className="mt-4">
                        <p className="text-sm text-pink-900 mb-2">Preview:</p>
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="h-48 w-48 object-cover rounded-lg border-2 border-pink-200 shadow-sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Video Upload */}
                  <div>
                    <label htmlFor="video" className="block text-sm font-medium text-pink-900 mb-2">
                      Upload Verification Video* (MP4/MOV, max 10MB)
                    </label>
                    <input
                      ref={videoInputRef}
                      type="file"
                      id="video"
                      name="video"
                      accept="video/mp4, video/quicktime"
                      onChange={(e) => handleVideoChange(e, setFieldValue)}
                      className="w-full px-4 py-3 bg-white border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 hover:border-pink-400 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-pink-100 file:text-pink-900 file:cursor-pointer"
                    />
                    <ErrorMessage name="video" component="div" className="mt-1 text-sm text-red-500" />

                    {/* Video Preview */}
                    {videoPreview && (
                      <div className="mt-4">
                        <p className="text-sm text-pink-900 mb-2">Preview:</p>
                        <video
                          src={videoPreview}
                          controls
                          className="h-48 w-full object-cover rounded-lg border-2 border-pink-200 shadow-sm"
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
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
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
    </div>
  );
};

export default RegistrationForm;
