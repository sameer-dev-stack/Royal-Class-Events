import SignUpForm from "@/components/auth/sign-up-form";

export default function OrganizerSignUpPage() {
    return (
        <div className="flex items-center justify-center min-h-screen py-12 px-4">
            <SignUpForm role="organizer" />
        </div>
    );
}
