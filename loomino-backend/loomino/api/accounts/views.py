from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import (
    RegisterSerializer,
    VerifyEmailSerializer,
    LoginSerializer,
    LogoutSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    ResendOTPSerializer,
    ProfileSerializer,
AddressSerializer,
)
from django.shortcuts import get_object_or_404
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)

from accounts.models import Address
from drf_spectacular.utils import extend_schema


@extend_schema(
    tags=["Accounts"],
    summary="Register User",
    description="Create a new user account and send an email verification link.",
    request=RegisterSerializer,
    responses={
        201: {
            "type": "object",
            "properties": {
                "message": {
                    "type": "string"
                }
            }
        }
    },
)
class RegisterAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(

            {
                "message": "Registration successful."
            },

            status=status.HTTP_201_CREATED,

        )

@extend_schema(
        tags=["Accounts"],
        summary="Verify Email",
        description="Verify a user's email using the OTP.",
        request=VerifyEmailSerializer,
    )

class VerifyEmailAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):

        serializer = VerifyEmailSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            {
                "message": "Email verified successfully."
            },
            status=status.HTTP_200_OK,
        )


@extend_schema(
    tags=["Accounts"],
    summary="User Login",
    description="Authenticate a user and return JWT access and refresh tokens.",
    request=LoginSerializer,
)
class LoginAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):

        serializer = LoginSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        return Response(
            {
                "message": "Login successful.",

                "access": serializer.validated_data["access"],

                "refresh": serializer.validated_data["refresh"],

                "user": {
                    "email": serializer.validated_data["user"].email,
                    "first_name": serializer.validated_data["user"].first_name,
                    "last_name": serializer.validated_data["user"].last_name,
                },
            },
            status=status.HTTP_200_OK,
        )
@extend_schema(
    tags=["Accounts"],
    summary="Logout User",
    description="Blacklist the user's refresh token.",
    request=LogoutSerializer,
)
class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):

        serializer = LogoutSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            {
                "message": "Logged out successfully."
            },
            status=status.HTTP_200_OK,
        )


@extend_schema(
    tags=["Accounts"],
    summary="Forgot Password",
    description="Send a password reset OTP.",
    request=ForgotPasswordSerializer,
)

class ForgotPasswordAPIView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = ForgotPasswordSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            {
                "message": "Password reset OTP sent successfully."
            },
            status=status.HTTP_200_OK,
        )
@extend_schema(
    tags=["Accounts"],
    summary="Reset Password",
    description="Reset the user's password.",
    request=ResetPasswordSerializer,
)
class ResetPasswordAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):

        serializer = ResetPasswordSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            {
                "message": "Password reset successful."
            },
            status=status.HTTP_200_OK,


        )


@extend_schema(
    tags=["Accounts"],
    summary="Resend OTP",
    description="Resend the email verification OTP.",
    request=ResendOTPSerializer,
)
class ResendOTPAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):

        serializer = ResendOTPSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            {
                "message": "Verification OTP sent successfully."
            },
            status=status.HTTP_200_OK,
        )
@extend_schema(
    tags=["Accounts"],
    summary="User Profile",
    description="Retrieve or update the authenticated user's profile.",
)
class ProfileAPIView(generics.RetrieveUpdateAPIView):

    serializer_class = ProfileSerializer

    permission_classes = [IsAuthenticated]

    def get_object(self):

        return self.request.user

@extend_schema(
    tags=["Accounts"],
    summary="List/Create Addresses",
    description="Retrieve all addresses or create a new address for the authenticated user.",
)
class AddressListCreateAPIView(generics.ListCreateAPIView):

    serializer_class = AddressSerializer

    permission_classes = [IsAuthenticated]

    pagination_class = None

    def get_queryset(self):

        return Address.objects.filter(
            user=self.request.user
        ).order_by(
            "-is_default",
            "-created_at",
        )

    def perform_create(self, serializer):
        is_first_address = not Address.objects.filter(
            user=self.request.user
        ).exists()

        serializer.save(
            user=self.request.user,
            is_default=is_first_address,
        )


@extend_schema(
    tags=["Accounts"],
    summary="Update Address",
    description="Update an existing address.",
)
class AddressUpdateAPIView(generics.UpdateAPIView):

    serializer_class = AddressSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Address.objects.filter(
            user=self.request.user
        )

@extend_schema(
    tags=["Accounts"],
    summary="Delete Address",
    description="Delete one of the authenticated user's addresses.",
)
class AddressDeleteAPIView(generics.DestroyAPIView):

    permission_classes = [IsAuthenticated]

    queryset = Address.objects.all()

    def get_queryset(self):

        return Address.objects.filter(
            user=self.request.user
        )

@extend_schema(
    tags=["Accounts"],
    summary="Set Default Address",
    description="Mark an address as the default shipping address.",
)
class SetDefaultAddressAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        address = get_object_or_404(

            Address,

            pk=pk,

            user=request.user,

        )

        Address.objects.filter(
            user=request.user,
            is_default=True,
        ).update(
            is_default=False
        )

        address.is_default = True

        address.save()

        return Response(
            {
                "message": "Default address updated successfully."
            },
            status=status.HTTP_200_OK,
        )
