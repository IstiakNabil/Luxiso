import AuthLayout from "@/features/auth/components/AuthLayout";
import AuthImage from "@/features/auth/components/AuthImage";
import LoginForm from "@/features/auth/components/LoginForm";
import authImage from "@/assets/images/auth/auth-image.jpg"; // use your actual image path

function LoginPage() {
  return (
    <AuthLayout
      image={
        <AuthImage
          src={authImage}
        />
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}

export default LoginPage;