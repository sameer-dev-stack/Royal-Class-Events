import SignUpForm from "@/components/auth/sign-up-form";

export default function AttendeeSignUpPage() {
    return (
        <div className="flex items-center justify-center min-h-screen py-12 px-4">
            <SignUpForm role="attendee" />
        </div>
    );
}
