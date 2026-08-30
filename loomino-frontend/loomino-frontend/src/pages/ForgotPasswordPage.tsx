import AuthLayout from "@/features/auth/components/AuthLayout";
import AuthImage from "@/features/auth/components/AuthImage";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";
import authImage from "@/assets/images/auth/auth-image.png";

function ForgotPasswordPage() {
  return (
    <AuthLayout image={<AuthImage src={authImage} />}>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
