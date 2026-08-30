import AuthLayout from "@/features/auth/components/AuthLayout";
import AuthImage from "@/features/auth/components/AuthImage";
import RegisterForm from "@/features/auth/components/RegisterForm";
import authImage from "@/assets/images/auth/auth-image.jpg";

function RegisterPage() {
  return (
    <AuthLayout image={<AuthImage src={authImage} />}>
      <RegisterForm />
    </AuthLayout>
  );
}

export default RegisterPage;
