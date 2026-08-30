import AuthLayout from "@/features/auth/components/AuthLayout";
import AuthImage from "@/features/auth/components/AuthImage";
import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";
import authImage from "@/assets/images/auth/auth-image.jpg";

function ResetPasswordPage() {
  return (
    <AuthLayout image={<AuthImage src={authImage} />}>
      <ResetPasswordForm />
    </AuthLayout>
  );
}

export default ResetPasswordPage;
