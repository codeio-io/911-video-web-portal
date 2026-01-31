import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Field, Label, ErrorMessage } from "../../components/ui/fieldset";
import { Heading } from "../../components/ui/heading";
import { Input } from "../../components/ui/input";
import { Text, TextLink } from "../../components/ui/text";
import { AuthLayout } from "../../components/ui/auth-layout";
import { Link, useLocation, useNavigate } from "react-router";
import { Formik, Form, useField } from "formik";
import * as Yup from "yup";
import axios from "axios";

// Custom form field component
const FormField = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  const hasError = meta.touched && meta.error;

  return (
    <Field>
      <Label>{label}</Label>
      <Input
        {...field}
        {...props}
        className={hasError ? "border-red-500" : ""}
      />
      {hasError && <ErrorMessage>{meta.error}</ErrorMessage>}
    </Field>
  );
};

const ResetPasswordWrapper = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Get email from URL params or location state
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get("email") || "";

  // Validation schema
  const validationSchema = Yup.object({
    code: Yup.string()
      .required("Verification code is required")
      .matches(/^\d{6}$/, "Code must be 6 digits"),
    newPassword: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Please confirm your password"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setIsResetting(true);
      setError("");

      await axios.post(
        `${import.meta.env.VITE_API_URL}/confirm-forgot-password`,
        {
          email,
          code: values.code,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        },
        { withCredentials: true }
      );

      setIsSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setIsResetting(false);
      setSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <Heading>Password Reset Successful</Heading>
          <Text>Your password has been successfully reset.</Text>
          <Button onClick={() => navigate("/login")} className="w-full">
            Back to Login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="flex flex-col space-y-6">
        <Heading>Reset Password</Heading>
        <Text>
          Enter the verification code sent to your email and create a new
          password.
        </Text>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <Formik
          initialValues={{
            code: "",
            newPassword: "",
            confirmPassword: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <FormField
                name="code"
                label="Verification Code"
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
              />

              <FormField
                name="newPassword"
                label="New Password"
                type="password"
                autoComplete="new-password"
                required
              />

              <FormField
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                autoComplete="new-password"
                required
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isResetting || isSubmitting}
              >
                {isResetting ? "Resetting..." : "Reset Password"}
              </Button>

              <div className="text-center">
                <Text>
                  Didn't receive the code?{" "}
                  <TextLink to="/forgot-password">Resend Code</TextLink>
                </Text>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordWrapper;
