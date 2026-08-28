'use client';

import { useState } from "react";
import RegisterForm from "@/components/RegisterForm";
import Welcome from "@/components/Welcome";
import { UserThemeProvider } from "@/context/ThemeContext";

export default function Register() {
  const [step, setStep] = useState(1);

  return (
    <UserThemeProvider>
      <div>
        {step == 1 ? <Welcome nextStep={setStep} /> : <RegisterForm previousStep={setStep} />}
      </div>
    </UserThemeProvider>
  );
}