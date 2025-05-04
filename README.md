#  Registration Form & Admin Dashboard

This project implements a secure and feature-rich registration system built with Next.js, TypeScript, and PostgreSQL. It allows users to submit personal details, address information, and supporting documents (photo and video), which are securely stored using Cloudinary. An accompanying Admin Dashboard provides authorized users with tools to manage, search, filter, and perform CRUD operations on submitted registrations.

## Features

### Registration Form (`/form`)

* **Personal Details:** Collects Full Name, Date of Birth, Gender.
* **Contact Information:** Collects Mobile Number (10 digits validation), Email ID (format validation).
* **Identification:** Collects Aadhaar Number (12 digits validation), PAN Number.
* **Address Information:** Collects Permanent Address, State, City, Pincode.
* **Document Upload:**
    * Photo Upload: Accepts JPG/PNG formats, max 5 MB.
    * Verification Video Upload: Accepts MP4/MOV formats, max 10 MB.
* **Validation:**
    * **Client-Side:** Real-time validation using `Formik` and `Yup` for immediate feedback.
    * **Server-Side:** Robust validation on the backend to ensure data integrity.
* **Secure File Storage:** Integrates with `Cloudinary` to upload and store photos/videos securely. File URLs are saved in the database.
* **User Experience:** Built with `TailwindCSS` for a responsive and modern UI.

### Admin Dashboard (`/admin`)

* **Secure Login:** Protects the dashboard for authorized admin users (Implementation details like NextAuth or custom JWT needed).
* **Registration Management:**
    * **List View:** Displays all submitted registrations in a paginated table.
    * **Search:** Allows searching by Full Name, Mobile Number, or Aadhaar Number.
    * **Filtering:** Enables filtering registrations by State, City, or Gender.
    * **Preview:** Admins can preview uploaded photos and videos directly within the dashboard.
* **CRUD Operations:** Full Create, Read, Update, and Delete capabilities for managing registration records.
* **Data Persistence:** Uses `Prisma ORM` to interact with the `PostgreSQL` database.

## Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (with App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Form Management:** [Formik](https://formik.org/)
* **Schema Validation:** [Yup](https://github.com/jquense/yup)
* **Database ORM:** [Prisma](https://www.prisma.io/)
* **Database:** [PostgreSQL](https://www.postgresql.org/)
* **Cloud Storage:** [Cloudinary](https://cloudinary.com/)
* **Deployment (Example):** [Vercel](https://vercel.com/), [AWS](https://aws.amazon.com/), [Netlify](https://www.netlify.com/)

## Prerequisites

* [Node.js](https://nodejs.org/) (Version >= 18.x recommended)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
* [PostgreSQL](https://www.postgresql.org/download/) database instance (local or cloud-hosted)
* [Cloudinary](https://cloudinary.com/) account (for API keys and cloud name)

## Getting Started

Follow these steps to set up and run the project locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/kumarUjjawal/ameya-dashboard
    cd ameya-dashboard
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory by copying the example file:
    ```bash
    cp .env.example .env.local
    ```
    Update the `.env.local` file with your specific configuration:
    ```dotenv
    # PostgreSQL Database URL (Prisma)
    # Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
    DATABASE_URL="postgresql://..."

    # Cloudinary Credentials
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
    NEXT_PUBLIC_CLOUDINARY_API_KEY="your_api_key"
    CLOUDINARY_API_SECRET="your_api_secret" # Kept server-side only

    ```
    **Important:** `CLOUDINARY_API_SECRET` should *not* be prefixed with `NEXT_PUBLIC_` as it needs to remain server-side only for security. Ensure your API routes handle Cloudinary uploads securely using this secret.

4.  **Database Migration:**
    Apply database schema changes using Prisma Migrate:
    ```bash
    npx prisma migrate dev --name init
    ```
    This will synchronize your database schema with your `prisma/schema.prisma` file and generate Prisma Client.

5.  **Seed Database (Optional):**
    If you have a seeding script (e.g., `prisma/seed.ts`) to create an initial admin user or sample data:
    ```bash
    npx prisma db seed
    ```
    *(Note: You might need to configure the seed script execution in your `package.json`)*

6.  **Run the Development Server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.
    * The registration form might be at `/` or `/register`.
    * The admin dashboard might be at `/admin`.

## Development Tools

* **Prisma Studio:** To view and manage your database data easily during development:
    ```bash
    npx prisma studio
    ```
    Open [http://localhost:5555](http://localhost:5555) in your browser.

## Building for Production

```bash
npm run build
