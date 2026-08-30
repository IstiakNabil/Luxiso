import AuthLayout from "@/features/auth/components/AuthLayout";
import AuthImage from "@/features/auth/components/AuthImage";
import VerifyOTPForm from "@/features/auth/components/VerifyOTPForm";
import authImage from "@/assets/images/auth/auth-image.jpg";

function VerifyOTPPage() {
  return (
    <AuthLayout image={<AuthImage src={authImage} />}>
      <VerifyOTPForm />
    </AuthLayout>
  );
}

export default VerifyOTPPage;
