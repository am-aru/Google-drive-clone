"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { string, z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Link from "next/link";
import { createAccount } from "@/lib/actions/user.actions";
import OTPModel from "./OTPModel";

type FormType = "sign-in" | "sign-up";

const authFormSchema = (formType: FormType) => {
  return z.object({
    email: z.string().email(),
    fullName:
      formType === "sign-up"
        ? z.string().min(2).max(50)
        : z.string().optional(),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [accountId, setAccountId] = useState(null);


  // This function (authFormSchema) presumably generates a validation schema based on the type argument (e.g., login, register, etc.).
  const formSchema = authFormSchema(type);

  // This ensures that the form knows the exact types of its fields, enhancing type safety.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema), //It takes the formSchema and validates form input values against it.
    defaultValues: {
      fullName: " ",
      email: " ",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage(" ");
    console.log("user");
    try {
      const user = await createAccount({
        fullName: values.fullName || " ",
        email: values.email,
      });
      setAccountId(user.accountId);
    } catch {
      setErrorMessage("Failed to create account. please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
          <h1 className="form-title">
            {type === "sign-in" ? "Sign In" : "Sign Up"}
          </h1>
          {type === "sign-up" && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => {
                console.log(field)

                return (
                  <FormItem>
                    <div className="shad-form-item">
                      <FormLabel className="shad-form-label">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          className="shad-input"
                          {...field}
                          
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="shad-form-message" />
                  </FormItem>
                )
              }}
            />
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="shad-form-item">
                  <FormLabel className="shad-form-label">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter  your email"
                      className="shad-input"
                      {...field}
                      trim
                    />
                  </FormControl>
                </div>
                <FormMessage className="shad-form-message" />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="form-submit-button"
            disabled={isLoading}
          >
            {type === "sign-in" ? "sign-in" : "sign-up"}
            {isLoading && (
              <img
                src="/assets/icons/loader.svg"
                alt="loader"
                width={24}
                height={24}
                className="ml-2 animation-spin"
              />
            )}
          </Button>
          {errorMessage && <p className="error-message">*{errorMessage}</p>}
          <div className="body-2 flex justify-center">
            <p className="text-light-100">
              {type === "sign-in"
                ? "Don't have an account?"
                : "Already have an account?"}
            </p>
            <Link
              href={type === "sign-in" ? "/sign-up" : "/sign-in"}
              className="ml-1 font-medium text-brand"
            >
              {" "}
              {type === "sign-in" ? "sign-up" : "sign-in"}
            </Link>
          </div>
        </form>
      </Form>
      {/* OTP verification  */}

      {accountId && (
        <OTPModel email={form.getValues("email")} accountId={accountId} />

//         An OTP is sent to the user's email.
// The OTPModel is rendered, allowing the user to enter the OTP for verification.

      )}
    </>
  );
};

export default AuthForm;
